document.addEventListener('DOMContentLoaded', () => {
  fetchDashboardData();
});

async function fetchDashboardData() {
  const loader = document.getElementById('loader');
  const countEl = document.getElementById('totalDoctorsCount');
  const recentList = document.getElementById('recentDoctorsList');

  try {
    const response = await fetch('http://localhost:5000/api/doctors');
    if (!response.ok) throw new Error('Failed to fetch data');
    
    const doctors = await response.json();
    
    // Update count
    countEl.textContent = doctors.length;
    
    // Hide loader
    loader.style.display = 'none';
    
    // Render recent 3 doctors
    const recent = doctors.slice(0, 3);
    
    if (recent.length === 0) {
      recentList.innerHTML = `
        <div class="empty-state" style="grid-column: 1 / -1;">
          <h3>No doctors found</h3>
          <p>Start by adding some doctors to the system.</p>
        </div>
      `;
      return;
    }

    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

    let html = '';
    recent.forEach(doc => {
      const isAvailableToday = doc.availableDays.includes(today);
      const badgeClass = isAvailableToday ? 'badge-success' : 'badge-warning';
      const badgeText = isAvailableToday ? 'Available Today' : 'Not Available Today';

      html += `
        <div class="card">
          <div class="doctor-card-header">
            <h3>${doc.name}</h3>
            <span class="badge ${badgeClass}">${badgeText}</span>
          </div>
          <div class="doctor-card-body">
            <span class="badge badge-spec mb-4">${doc.specialization}</span>
            <p><strong>Timing:</strong> ${doc.consultationTimings}</p>
            <p><strong>Room:</strong> ${doc.roomNumber}</p>
          </div>
          <div class="doctor-card-footer mt-4">
            <a href="edit-doctor.html?id=${doc._id}" class="btn btn-outline">Edit</a>
          </div>
        </div>
      `;
    });
    
    recentList.innerHTML = html;

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    loader.style.display = 'none';
    recentList.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1; color: var(--danger-color);">Error loading data. Make sure backend is running.</div>`;
  }
}
