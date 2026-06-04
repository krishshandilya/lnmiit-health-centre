document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  
  const form = e.target;
  const submitBtn = document.getElementById('submitBtn');
  const btnText = document.getElementById('btnText');
  const btnLoader = document.getElementById('btnLoader');
  const errorAlert = document.getElementById('errorAlert');
  const errorText = document.getElementById('errorText');
  
  // Reset states
  errorAlert.classList.add('hidden');
  btnText.textContent = 'Verifying...';
  btnLoader.classList.remove('hidden');
  submitBtn.disabled = true;
  
  const username = form.username.value.trim();
  const password = form.password.value.trim();
  
  try {
    const response = await fetch(`${window.API_BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'Login failed.');
    }
    
    // Save token to sessionStorage
    sessionStorage.setItem('token', data.token);
    window.isAdmin = true;
    
    // Toast notification
    if (window.showToast) {
      window.showToast('Login successful! Welcome back.', 'success');
    }
    
    // Redirect to index.html
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 1000);
    
  } catch (error) {
    // Show error
    errorText.textContent = error.message;
    errorAlert.classList.remove('hidden');
    
    // Trigger shake animation on card
    const card = document.querySelector('.bg-surface-container-lowest');
    if (card) {
      card.classList.add('animate-shake');
      setTimeout(() => card.classList.remove('animate-shake'), 500);
    }
    
    // Reset buttons
    btnText.textContent = 'Login';
    btnLoader.classList.add('hidden');
    submitBtn.disabled = false;
  }
});
