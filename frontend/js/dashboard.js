function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

document.addEventListener('DOMContentLoaded', () => {
  fetchDashboardData();
});

async function fetchDashboardData() {
  const loader = document.getElementById('loader');
  const totalDoctorsEl = document.getElementById('totalDoctorsCount');
  const availableTodayEl = document.getElementById('availableTodayCount');
  const activeRoomsEl = document.getElementById('activeRoomsCount');
  const availabilityCapacityEl = document.getElementById('availabilityCapacity');
  const specContainer = document.getElementById('specializationContainer');
  const recentList = document.getElementById('recentDoctorsList');

  try {
    const response = await fetch('/api/doctors');
    if (!response.ok) throw new Error('Failed to fetch data');
    
    const doctors = await response.json();
    
    // Hide loader
    if (loader) loader.style.display = 'none';
    
    // 1. Total Doctors
    totalDoctorsEl.textContent = doctors.length;
    
    // 2. Compute live availability and active rooms
    let availableCount = 0;
    const activeRooms = new Set();
    const specCounts = {};
    
    doctors.forEach(doc => {
      const spec = doc.specialization || 'Other';
      specCounts[spec] = (specCounts[spec] || 0) + 1;
      
      const availability = window.checkAvailability(doc.availableDays, doc.consultationTimings);
      if (availability.status === 'available') {
        availableCount++;
        if (doc.roomNumber) {
          activeRooms.add(doc.roomNumber);
        }
      }
    });
    
    availableTodayEl.textContent = availableCount;
    activeRoomsEl.textContent = activeRooms.size;
    
    const capacityPercent = doctors.length > 0 ? Math.round((availableCount / doctors.length) * 100) : 0;
    availabilityCapacityEl.textContent = `${capacityPercent}% staff capacity active`;
    
    // 3. Render specializations summary (only if container exists in DOM)
    if (specContainer) {
      let specHtml = '';
      const sortedSpecs = Object.entries(specCounts).sort((a, b) => b[1] - a[1]);
      
      if (sortedSpecs.length === 0) {
        specHtml = `<p class="text-secondary text-sm text-center py-4">No data available</p>`;
      } else {
        const maxCount = Math.max(...Object.values(specCounts));
        sortedSpecs.forEach(([specName, count]) => {
          const percent = Math.round((count / maxCount) * 100);
          specHtml += `
            <div class="space-y-1">
              <div class="flex justify-between font-label-sm text-label-sm">
                <span class="text-on-surface-variant font-semibold text-sm">${escapeHTML(specName)}</span>
                <span class="text-secondary font-bold">${count} ${count === 1 ? 'doc' : 'docs'}</span>
              </div>
              <div class="w-full bg-slate-100 rounded-full h-2">
                <div class="bg-[#00685f] h-2 rounded-full bar-transition" style="width: ${percent}%"></div>
              </div>
            </div>
          `;
        });
      }
      specContainer.innerHTML = specHtml;
    }
    
    // 4. Render 3 recently added doctors
    const recent = doctors.slice(-3).reverse();
    
    if (recent.length === 0) {
      recentList.innerHTML = `
        <div class="col-span-full border border-dashed border-outline-variant p-lg rounded-xl text-center text-secondary">
          <p class="font-body-md">No practitioners registered yet.</p>
          <a href="add-doctor.html" class="admin-only text-primary hover:underline text-sm font-semibold mt-xs inline-block">Add Doctor</a>
        </div>
      `;
      return;
    }
    
    let recentHtml = '';
    recent.forEach(doc => {
      const availability = window.checkAvailability(doc.availableDays, doc.consultationTimings);
      
      recentHtml += `
        <div class="border border-outline-variant p-md rounded-xl hover:border-primary hover:shadow-sm transition-all duration-200 flex flex-col justify-between bg-white card-shadow">
          <div>
            <div class="flex justify-between items-start gap-xs mb-sm">
              <div>
                <h5 class="font-label-md text-label-md text-on-surface font-semibold text-base">${escapeHTML(doc.name)}</h5>
                <p class="text-sm text-slate-400 font-mono">${escapeHTML(doc.doctorId || 'No ID')}</p>
              </div>
              <span class="inline-flex items-center gap-xs px-2.5 py-[2px] rounded-full ${availability.badgeClass} font-semibold text-[11px] whitespace-nowrap">
                <span class="w-1.5 h-1.5 rounded-full" style="background-color: ${availability.dotColor};"></span>
                <span>${availability.text}</span>
              </span>
            </div>
            
            <span class="inline-block bg-slate-100 text-[#00685f] text-sm font-semibold px-2.5 py-0.5 rounded mb-3">${escapeHTML(doc.specialization)}</span>
            
            <div class="space-y-sm text-sm text-slate-600">
              <p class="flex items-center gap-2"><span class="material-symbols-outlined text-[18px] text-primary">school</span><span>${escapeHTML(doc.qualification)}</span></p>
              <p class="flex items-center gap-2"><span class="material-symbols-outlined text-[18px] text-primary">schedule</span><span>${escapeHTML(doc.consultationTimings)}</span></p>
              <p class="flex items-center gap-2"><span class="material-symbols-outlined text-[18px] text-primary">meeting_room</span><span>Room ${escapeHTML(doc.roomNumber)}</span></p>
            </div>
          </div>
          
          ${window.isAdmin ? `
          <div class="mt-md pt-sm border-t border-outline-variant flex justify-end">
            <a href="edit-doctor.html?id=${doc._id}" class="text-sm text-primary hover:underline flex items-center gap-1 font-semibold">
              <span class="material-symbols-outlined text-[16px]">edit</span> Edit Info
            </a>
          </div>` : ''}
        </div>
      `;
    });
    recentList.innerHTML = recentHtml;

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    if (loader) loader.style.display = 'none';
    recentList.innerHTML = `<div class="col-span-full text-center text-red-600 font-semibold p-md bg-red-50 rounded-xl border border-red-200">Error loading dashboard stats. Make sure backend is running.</div>`;
  }
}
