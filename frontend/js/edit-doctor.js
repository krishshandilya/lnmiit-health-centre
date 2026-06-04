document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const doctorId = urlParams.get('id');

  if (!doctorId) {
    showError();
    return;
  }

  try {
    const response = await fetch(`${window.API_BASE_URL}/api/doctors/${doctorId}`);
    if (!response.ok) throw new Error('Doctor not found');
    
    const doctor = await response.json();
    populateForm(doctor);

  } catch (error) {
    console.error(error);
    showError();
  }
});

function showError() {
  const loader = document.getElementById('loader');
  const errorState = document.getElementById('errorState');
  if (loader) loader.classList.add('hidden');
  if (errorState) errorState.classList.remove('hidden');
}

function convertTo24Hour(timeStr) {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)?/i);
  if (!match) return "";
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3] ? match[3].toUpperCase() : null;

  if (period === 'PM' && hours !== 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
}

function populateForm(doctor) {
  const loader = document.getElementById('loader');
  const formContainer = document.getElementById('formContainer');
  if (loader) loader.classList.add('hidden');
  if (formContainer) formContainer.classList.remove('hidden');

  const form = document.getElementById('editDoctorForm');
  
  form.doctorId.value = doctor.doctorId || '';
  form.name.value = doctor.name;
  form.specialization.value = doctor.specialization;
  form.qualification.value = doctor.qualification;
  form.experience.value = doctor.experience;
  
  // Parse existing timings (supporting both HH:MM and HH:MM AM/PM formats)
  if (doctor.consultationTimings && doctor.consultationTimings.includes(' - ')) {
    const [start, end] = doctor.consultationTimings.split(' - ');
    form.startTime.value = convertTo24Hour(start.trim());
    form.endTime.value = convertTo24Hour(end.trim());
  } else {
    // Fallback if data is in old format
    form.startTime.value = '10:00';
    form.endTime.value = '13:00';
  }

  form.roomNumber.value = doctor.roomNumber;
  form.contact.value = doctor.contact;
  form.email.value = doctor.email;

  // Check the appropriate days
  const checkboxes = form.querySelectorAll('input[name="days"]');
  checkboxes.forEach(cb => {
    if (doctor.availableDays.includes(cb.value)) {
      cb.checked = true;
    }
  });
}

document.getElementById('editDoctorForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const form = e.target;
  const submitBtn = document.getElementById('submitBtn');
  const daysError = document.getElementById('daysError');
  const emailError = document.getElementById('emailError');
  const contactError = document.getElementById('contactError');
  const idError = document.getElementById('idError');
  const timingError = document.getElementById('timingError');

  let hasError = false;
  
  const checkedDays = Array.from(form.querySelectorAll('input[name="days"]:checked')).map(cb => cb.value);
  
  if (checkedDays.length === 0) {
    daysError.classList.remove('hidden');
    hasError = true;
  } else {
    daysError.classList.add('hidden');
  }

  // Validate email ends with @lnmiit.ac.in
  const email = form.email.value.trim();
  if (!email.endsWith('@lnmiit.ac.in')) {
    emailError.classList.remove('hidden');
    hasError = true;
  } else {
    emailError.classList.add('hidden');
  }

  // Validate contact is exactly 10 digits
  const contact = form.contact.value.trim();
  if (!/^\d{10}$/.test(contact)) {
    contactError.classList.remove('hidden');
    hasError = true;
  } else {
    contactError.classList.add('hidden');
  }

  // Validate doctorId pattern
  const doctorId = form.doctorId.value.trim();
  if (!/^DOC-\d{3}$/.test(doctorId)) {
    idError.classList.remove('hidden');
    hasError = true;
  } else {
    idError.classList.add('hidden');
  }

  // Validate start time is before end time
  const startTime = form.startTime.value;
  const endTime = form.endTime.value;
  if (startTime && endTime && startTime >= endTime) {
    timingError.classList.remove('hidden');
    hasError = true;
  } else {
    timingError.classList.add('hidden');
  }

  if (hasError) return;
  
  const doctorData = {
    doctorId: form.doctorId.value.trim(),
    name: form.name.value.trim(),
    specialization: form.specialization.value,
    qualification: form.qualification.value.trim(),
    experience: Number(form.experience.value),
    availableDays: checkedDays,
    consultationTimings: `${form.startTime.value} - ${form.endTime.value}`,
    roomNumber: form.roomNumber.value.trim(),
    contact: form.contact.value.trim(),
    email: form.email.value.trim()
  };

  const urlParams = new URLSearchParams(window.location.search);
  const dbId = urlParams.get('id');

  try {
    submitBtn.textContent = 'Updating...';
    submitBtn.disabled = true;

    const response = await fetch(`${window.API_BASE_URL}/api/doctors/${dbId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
      },
      body: JSON.stringify(doctorData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update doctor');
    }

    if (window.showToast) {
      window.showToast('Doctor updated successfully!', 'success');
    } else {
      alert('Doctor updated successfully!');
    }
    
    setTimeout(() => {
      window.location.href = 'doctors.html';
    }, 1500);

  } catch (error) {
    if (window.showToast) {
      window.showToast('Error: ' + error.message, 'error');
    } else {
      alert('Error: ' + error.message);
    }
    console.error(error);
  } finally {
    submitBtn.textContent = 'Update Doctor';
    submitBtn.disabled = false;
  }
});
