document.getElementById('addDoctorForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const form = e.target;
  const submitBtn = document.getElementById('submitBtn');
  const daysError = document.getElementById('daysError');
  const emailError = document.getElementById('emailError');
  const contactError = document.getElementById('contactError');

  let hasError = false;
  
  // Get all checked days
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

  try {
    submitBtn.textContent = 'Adding...';
    submitBtn.disabled = true;

    const response = await fetch('http://localhost:5000/api/doctors', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(doctorData)
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add doctor');
    }

    alert('Doctor added successfully!');
    window.location.href = 'doctors.html';

  } catch (error) {
    alert('Error: ' + error.message);
    console.error(error);
  } finally {
    submitBtn.textContent = 'Add Doctor';
    submitBtn.disabled = false;
  }
});
