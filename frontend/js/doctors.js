document.addEventListener('DOMContentLoaded', () => {
  fetchDoctors();
});

async function fetchDoctors() {
  const loader = document.getElementById('loader');
  const tableBody = document.getElementById('doctorsTableBody');
  const emptyState = document.getElementById('emptyState');

  try {
    const response = await fetch('http://localhost:5000/api/doctors');
    if (!response.ok) throw new Error('Failed to fetch data');
    
    const doctors = await response.json();
    loader.style.display = 'none';

    if (doctors.length === 0) {
      emptyState.style.display = 'block';
      return;
    }

    let html = '';
    const today = new Date().toLocaleDateString('en-US', { weekday: 'long' });

    doctors.forEach(doc => {
      const isAvailableToday = doc.availableDays.includes(today);
      const dotColor = isAvailableToday ? 'var(--success-color)' : 'var(--accent-color)';
      
      html += `
        <tr>
          <td>
            <strong>${doc.name}</strong> <span style="font-size: 0.85rem; color: var(--text-light);">(${doc.doctorId || 'No ID'})</span><br>
            <small class="text-muted">${doc.qualification}</small>
          </td>
          <td><span class="badge badge-spec">${doc.specialization}</span></td>
          <td>${doc.experience} Years</td>
          <td>
            <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.25rem;">
              <span style="display: inline-block; width: 8px; height: 8px; border-radius: 50%; background-color: ${dotColor};"></span>
              <span>${isAvailableToday ? 'Available Today' : 'Not Available'}</span>
            </div>
            <small class="text-muted" style="display: block; max-width: 150px; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;" title="${doc.availableDays.join(', ')}">
              ${doc.availableDays.join(', ')}
            </small>
          </td>
          <td>
            ${doc.contact}<br>
            <small class="text-muted">Room: ${doc.roomNumber}</small>
          </td>
          <td>
            <div class="action-btns">
              <a href="edit-doctor.html?id=${doc._id}" class="btn btn-outline">Edit</a>
              <button onclick="deleteDoctor('${doc._id}')" class="btn btn-danger">Delete</button>
            </div>
          </td>
        </tr>
      `;
    });

    tableBody.innerHTML = html;

  } catch (error) {
    console.error('Error:', error);
    loader.style.display = 'none';
    tableBody.innerHTML = `<tr><td colspan="6" style="text-align: center; color: var(--danger-color);">Error loading data.</td></tr>`;
  }
}

async function deleteDoctor(id) {
  if (confirm('Are you sure you want to delete this doctor? This action cannot be undone.')) {
    try {
      const response = await fetch(`http://localhost:5000/api/doctors/${id}`, {
        method: 'DELETE'
      });
      
      if (!response.ok) throw new Error('Failed to delete');
      
      // Refresh the list
      document.getElementById('doctorsTableBody').innerHTML = '';
      document.getElementById('loader').style.display = 'block';
      fetchDoctors();
      
    } catch (error) {
      alert('Error deleting doctor');
      console.error(error);
    }
  }
}
