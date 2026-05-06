document.addEventListener('DOMContentLoaded', async () => {
  const urlParams = new URLSearchParams(window.location.search);
  const doctorId = urlParams.get('id');

  if (!doctorId) {
    showError();
    return;
  }

  try {
    const response = await fetch(`http://localhost:5000/api/doctors/${doctorId}`);
    if (!response.ok) throw new Error('Doctor not found');
    
    const doctor = await response.json();
    populateForm(doctor);

  } catch (error) {
    console.error(error);
    showError();
  }
});

function showError() {
  document.getElementById('loader').style.display = 'none';
  document.getElementById('errorState').style.display = 'block';
}

function populateForm(doctor) {
  document.getElementById('loader').style.display = 'none';
  document.getElementById('formContainer').style.display = 'block';

  const form = document.getElementById('editDoctorForm');
  
  form.name.value = doctor.name;
  form.specialization.value = doctor.specialization;
  form.qualification.value = doctor.qualification;
  form.experience.value = doctor.experience;
  
  // Parse existing timings (assuming format "HH:MM - HH:MM")
  if (doctor.consultationTimings && doctor.consultationTimings.includes(' - ')) {
    const [start, end] = doctor.consultationTimings.split(' - ');
    form.startTime.value = start.trim();
    form.endTime.value = end.trim();
  } else {
    // Fallback if data is in old free-text format
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

  let hasError = false;
  
  const checkedDays = Array.from(form.querySelectorAll('input[name="days"]:checked')).map(cb => cb.value);
  
  if (checkedDays.length === 0) {
    daysError.style.display = 'block';
    hasError = true;
  } else {
    daysError.style.display = 'none';
  }

  // Validate email ends with @lnmiit.ac.in
  const email = form.email.value.trim();
  if (!email.endsWith('@lnmiit.ac.in')) {
    emailError.style.display = 'block';
    hasError = true;
  } else {
    emailError.style.display = 'none';
  }

  // Validate contact is exactly 10 digits
  const contact = form.contact.value.trim();
  if (!/^\d{10}$/.test(contact)) {
    contactError.style.display = 'block';
    hasError = true;
  } else {
    contactError.style.display = 'none';
  }

  if (hasError) return;
  
  const doctorData = {
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
  const doctorId = urlParams.get('id');

  try {
    submitBtn.textContent = 'Updating...';
    submitBtn.disabled = true;

    const response = await fetch(`http://localhost:5000/api/doctors/${doctorId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(doctorData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update doctor');
    }

    alert('Doctor updated successfully!');
    window.location.href = 'doctors.html';

  } catch (error) {
    alert('Error: ' + error.message);
    console.error(error);
  } finally {
    submitBtn.textContent = 'Update Doctor';
    submitBtn.disabled = false;
  }
});
