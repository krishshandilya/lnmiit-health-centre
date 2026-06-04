function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

document.getElementById('searchBtn').addEventListener('click', () => {
  const spec = document.getElementById('specializationFilter').value;
  if (spec) {
    searchDoctors(spec);
  } else {
    if (window.showToast) {
      window.showToast('Please select a specialization first.', 'error');
    } else {
      alert('Please select a specialization first.');
    }
  }
});

async function searchDoctors(specialization) {
  const loader = document.getElementById('loader');
  const resultsContainer = document.getElementById('searchResults');
  const noResultsState = document.getElementById('noResultsState');
  const resultsTitle = document.getElementById('resultsTitle');

  // Reset UI
  resultsContainer.innerHTML = '';
  noResultsState.classList.add('hidden');
  resultsTitle.classList.add('hidden');
  loader.classList.remove('hidden');

  try {
    const response = await fetch(`${window.API_BASE_URL}/api/doctors/specialization/${encodeURIComponent(specialization)}`);
    if (!response.ok) throw new Error('Failed to fetch specialization records.');
    
    const doctors = await response.json();
    loader.classList.add('hidden');

    if (doctors.length === 0) {
      noResultsState.classList.remove('hidden');
      return;
    }

    resultsTitle.classList.remove('hidden');
    
    let html = '';
    doctors.forEach(doc => {
      const availability = window.checkAvailability(doc.availableDays, doc.consultationTimings);

      html += `
        <div class="bg-white border border-outline-variant p-md rounded-xl hover:border-primary hover:shadow-sm transition-all duration-200 flex flex-col justify-between card-shadow">
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
              <p class="flex items-center gap-2"><span class="material-symbols-outlined text-[18px] text-primary">school</span><span><strong>Qualification:</strong> ${escapeHTML(doc.qualification)}</span></p>
              <p class="flex items-center gap-2"><span class="material-symbols-outlined text-[18px] text-primary">badge</span><span><strong>Experience:</strong> ${escapeHTML(doc.experience)} Years</span></p>
              <p class="flex items-center gap-2"><span class="material-symbols-outlined text-[18px] text-primary">schedule</span><span><strong>Timings:</strong> ${escapeHTML(doc.consultationTimings)}</span></p>
              <p class="flex items-center gap-2"><span class="material-symbols-outlined text-[18px] text-primary">calendar_month</span><span><strong>Available:</strong> ${escapeHTML(doc.availableDays.join(', '))}</span></p>
              <p class="flex items-center gap-2"><span class="material-symbols-outlined text-[18px] text-primary">meeting_room</span><span><strong>Room:</strong> ${escapeHTML(doc.roomNumber)}</span></p>
              <p class="flex items-center gap-2"><span class="material-symbols-outlined text-[18px] text-primary">call</span><span><strong>Contact:</strong> ${escapeHTML(doc.contact)}</span></p>
            </div>
          </div>
          
          ${window.isAdmin ? `
          <div class="mt-md pt-sm border-t border-[#e2e8f0] flex justify-end">
            <a href="edit-doctor.html?id=${doc._id}" class="text-sm text-primary hover:underline flex items-center gap-1 font-semibold">
              <span class="material-symbols-outlined text-[16px]">edit</span> Edit Info
            </a>
          </div>` : ''}
        </div>
      `;
    });

    resultsContainer.innerHTML = html;

  } catch (error) {
    console.error('Error searching doctors:', error);
    loader.classList.add('hidden');
    resultsContainer.innerHTML = `<div class="col-span-full text-center text-red-600 font-semibold p-md bg-red-50 rounded-xl border border-red-200">Error loading search results.</div>`;
  }
}
