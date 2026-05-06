document.getElementById('searchBtn').addEventListener('click', () => {
  const spec = document.getElementById('specializationFilter').value;
  if (spec) {
    searchDoctors(spec);
  } else {
    alert('Please select a specialization first.');
  }
});

async function searchDoctors(specialization) {
  const loader = document.getElementById('loader');
  const resultsContainer = document.getElementById('searchResults');
  const noResultsState = document.getElementById('noResultsState');
  const resultsTitle = document.getElementById('resultsTitle');

  // Reset UI
  resultsContainer.innerHTML = '';
  noResultsState.style.display = 'none';
  resultsTitle.style.display = 'none';
  loader.style.display = 'block';

  try {
    const response = await fetch(`http://localhost:5000/api/doctors/specialization/${encodeURIComponent(specialization)}`);
    if (!response.ok) throw new Error('Failed to fetch data');
    
    const doctors = await response.json();
    loader.style.display = 'none';

    if (doctors.length === 0) {
      noResultsState.style.display = 'block';
      return;
    }

    resultsTitle.style.display = 'block';
    
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });
    let html = '';

    doctors.forEach(doc => {
      const isAvailableToday = doc.availableDays.includes(today);
      const badgeClass = isAvailableToday ? 'badge-success' : 'badge-warning';
      const badgeText = isAvailableToday ? 'Available Today' : 'Not Available Today';

      html += `
        <div class="card">
          <div class="doctor-card-header">
            <h3>${doc.name} <span style="font-size: 0.9rem; color: var(--text-light); font-family: 'DM Sans', sans-serif;">(${doc.doctorId || 'No ID'})</span></h3>
            <span class="badge ${badgeClass}">${badgeText}</span>
          </div>
          <div class="doctor-card-body">
            <span class="badge badge-spec mb-4">${doc.specialization}</span>
            <p><strong>Qualification:</strong> ${doc.qualification}</p>
            <p><strong>Experience:</strong> ${doc.experience} Years</p>
            <p><strong>Timing:</strong> ${doc.consultationTimings}</p>
            <p><strong>Available:</strong> ${doc.availableDays.join(', ')}</p>
            <p><strong>Room:</strong> ${doc.roomNumber}</p>
            <p><strong>Contact:</strong> ${doc.contact}</p>
          </div>
        </div>
      `;
    });

    resultsContainer.innerHTML = html;

  } catch (error) {
    console.error('Error:', error);
    loader.style.display = 'none';
    resultsContainer.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1; color: var(--danger-color);">Error loading search results.</div>`;
  }
}
