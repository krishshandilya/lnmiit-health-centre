document.getElementById('addDoctorForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const form = e.target;
  const submitBtn = document.getElementById('submitBtn');
  const daysError = document.getElementById('daysError');
  const emailError = document.getElementById('emailError');
  const contactError = document.getElementById('contactError');
  const idError = document.getElementById('idError');
  const timingError = document.getElementById('timingError');

  let hasError = false;
  
  // Get all checked days
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

  try {
    submitBtn.textContent = 'Adding...';
    submitBtn.disabled = true;

    const response = await fetch(`${window.API_BASE_URL}/api/doctors`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${sessionStorage.getItem('token')}`
      },
      body: JSON.stringify(doctorData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add doctor');
    }

    if (window.showToast) {
      window.showToast('Doctor added successfully!', 'success');
    } else {
      alert('Doctor added successfully!');
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
    submitBtn.textContent = 'Add Doctor';
    submitBtn.disabled = false;
  }
});
