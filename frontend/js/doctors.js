function escapeHTML(str) {
  if (!str) return '';
  return String(str).replace(/[&<>'"]/g, 
    tag => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[tag] || tag)
  );
}

let allDoctors = [];

document.addEventListener('DOMContentLoaded', () => {
  fetchDoctors();
  setupSearchFilter();
  setupExportCsv();
});

async function fetchDoctors() {
  const loader = document.getElementById('loader');
  const emptyState = document.getElementById('emptyState');
  const staffCountLabel = document.getElementById('staffCountLabel');

  try {
    const response = await fetch('/api/doctors');
    if (!response.ok) throw new Error('Failed to fetch doctor list.');
    
    allDoctors = await response.json();
    if (loader) loader.style.display = 'none';

    staffCountLabel.textContent = `${allDoctors.length} Staff Member${allDoctors.length === 1 ? '' : 's'}`;

    renderDoctorsTable(allDoctors);

  } catch (error) {
    console.error('Error fetching doctors:', error);
    if (loader) loader.style.display = 'none';
    const tableBody = document.getElementById('doctorsTableBody');
    const colsCount = window.isAdmin ? 6 : 5;
    tableBody.innerHTML = `<tr><td colspan="${colsCount}" class="text-center text-red-600 font-semibold p-4">Error loading doctors data. Make sure server is running.</td></tr>`;
  }
}

function renderDoctorsTable(doctorsList) {
  const tableBody = document.getElementById('doctorsTableBody');
  const emptyState = document.getElementById('emptyState');
  
  tableBody.innerHTML = '';
  
  if (doctorsList.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }
  
  emptyState.classList.add('hidden');
  
  let html = '';
  doctorsList.forEach(doc => {
    const availability = window.checkAvailability(doc.availableDays, doc.consultationTimings);
    
    html += `
      <tr class="hover:bg-slate-50 transition-colors">
        <td class="px-gutter py-4">
          <div class="flex flex-col">
            <span class="font-semibold text-slate-800 text-base">${escapeHTML(doc.name)}</span>
            <span class="text-sm text-slate-400 font-mono">${escapeHTML(doc.doctorId || 'No ID')}</span>
            <span class="text-sm text-slate-500 mt-0.5">${escapeHTML(doc.qualification)}</span>
          </div>
        </td>
        <td class="px-gutter py-4">
          <span class="inline-block bg-slate-100 text-[#00685f] text-sm font-semibold px-2.5 py-0.5 rounded">${escapeHTML(doc.specialization)}</span>
        </td>
        <td class="px-gutter py-4 text-sm text-slate-700 font-medium">
          ${escapeHTML(doc.experience)} Years
        </td>
        <td class="px-gutter py-4">
          <div class="flex flex-col gap-1">
            <span class="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full ${availability.badgeClass} text-sm font-semibold w-fit">
              <span class="w-1.5 h-1.5 rounded-full" style="background-color: ${availability.dotColor};"></span>
              <span>${availability.text}</span>
            </span>
            <span class="text-sm text-slate-400 max-w-[180px] truncate" title="${escapeHTML(doc.availableDays.join(', '))}">
              Days: ${escapeHTML(doc.availableDays.join(', '))}
            </span>
          </div>
        </td>
        <td class="px-gutter py-4 text-sm text-slate-700">
          <div class="flex flex-col">
            <span class="font-medium">${escapeHTML(doc.contact)}</span>
            <span class="text-sm text-slate-500">Room: ${escapeHTML(doc.roomNumber)}</span>
          </div>
        </td>
        <td class="px-gutter py-4 text-right admin-only">
          <div class="flex items-center justify-end gap-1.5">
            <a href="edit-doctor.html?id=${doc._id}" class="p-1 text-slate-400 hover:text-primary hover:bg-[#008378]/10 rounded transition-all" title="Edit Profile">
              <span class="material-symbols-outlined text-[20px]">edit</span>
            </a>
            <button onclick="deleteDoctor('${doc._id}', '${escapeHTML(doc.name)}')" class="p-1 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-all" title="Delete Profile">
              <span class="material-symbols-outlined text-[20px]">delete</span>
            </button>
          </div>
        </td>
      </tr>
    `;
  });
  
  tableBody.innerHTML = html;
}

function setupSearchFilter() {
  const searchInput = document.getElementById('doctorsSearchInput');
  if (!searchInput) return;
  
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (!query) {
      renderDoctorsTable(allDoctors);
      return;
    }
    
    const filtered = allDoctors.filter(doc => {
      const nameMatch = (doc.name || '').toLowerCase().includes(query);
      const specMatch = (doc.specialization || '').toLowerCase().includes(query);
      const qualMatch = (doc.qualification || '').toLowerCase().includes(query);
      const idMatch = (doc.doctorId || '').toLowerCase().includes(query);
      const roomMatch = String(doc.roomNumber || '').toLowerCase().includes(query);
      
      return nameMatch || specMatch || qualMatch || idMatch || roomMatch;
    });
    
    renderDoctorsTable(filtered);
  });
}

async function deleteDoctor(id, name) {
  if (confirm(`Are you sure you want to delete ${name}? This action cannot be undone.`)) {
    try {
      const response = await fetch(`/api/doctors/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${sessionStorage.getItem('token')}`
        }
      });
      
      if (!response.ok) throw new Error('Deletion request was rejected.');
      
      if (window.showToast) {
        window.showToast('Practitioner deleted successfully!', 'success');
      }
      
      fetchDoctors();
      
    } catch (error) {
      if (window.showToast) {
        window.showToast('Error deleting doctor: ' + error.message, 'error');
      } else {
        alert('Error: ' + error.message);
      }
      console.error(error);
    }
  }
}

function setupExportCsv() {
  const exportBtn = document.getElementById('exportCsvBtn');
  if (!exportBtn) return;
  
  exportBtn.addEventListener('click', () => {
    if (allDoctors.length === 0) {
      if (window.showToast) {
        window.showToast('No doctor profiles to export.', 'info');
      }
      return;
    }
    
    // Define headers
    const headers = [
      'Doctor ID',
      'Name',
      'Specialization',
      'Qualification',
      'Experience (Years)',
      'Room Number',
      'Available Days',
      'Consultation Timings',
      'Contact',
      'Email'
    ];
    
    // Construct CSV rows
    const csvRows = [headers.join(',')];
    
    allDoctors.forEach(doc => {
      const row = [
        `"${(doc.doctorId || '').replace(/"/g, '""')}"`,
        `"${(doc.name || '').replace(/"/g, '""')}"`,
        `"${(doc.specialization || '').replace(/"/g, '""')}"`,
        `"${(doc.qualification || '').replace(/"/g, '""')}"`,
        `"${doc.experience || 0}"`,
        `"${(doc.roomNumber || '').replace(/"/g, '""')}"`,
        `"${(doc.availableDays || []).join(', ').replace(/"/g, '""')}"`,
        `"${(doc.consultationTimings || '').replace(/"/g, '""')}"`,
        `"${(doc.contact || '').replace(/"/g, '""')}"`,
        `"${(doc.email || '').replace(/"/g, '""')}"`
      ];
      csvRows.push(row.join(','));
    });
    
    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `LNMIIT_Health_Center_Doctors_${new Date().toISOString().slice(0, 10)}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    if (window.showToast) {
      window.showToast('CSV file downloaded successfully!', 'success');
    }
  });
}
