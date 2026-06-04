// Auth Session Manager
window.isAdmin = !!sessionStorage.getItem('token');

// Inject Admin/Public display rules dynamically to avoid duplicating CSS styles across pages
(function injectAuthStyles() {
  const style = document.createElement('style');
  style.textContent = `
    .admin-only {
      display: none !important;
    }
    body.is-admin .admin-only {
      display: flex !important;
    }
    body.is-admin blockquote.admin-only, 
    body.is-admin div.admin-only, 
    body.is-admin a.admin-only.is-block {
      display: block !important;
    }
    body.is-admin tr.admin-only {
      display: table-row !important;
    }
    body.is-admin td.admin-only {
      display: table-cell !important;
    }
    
    body.is-admin .public-only {
      display: none !important;
    }
  `;
  document.head.appendChild(style);
})();

// Toast Notification System
window.showToast = function(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed top-6 right-6 z-50 flex flex-col gap-3 pointer-events-none';
    document.body.appendChild(container);
  }
  
  const toast = document.createElement('div');
  const icon = type === 'success' ? 'check_circle' : (type === 'error' ? 'error' : 'info');
  const iconColor = type === 'success' ? 'text-[#0D9488]' : (type === 'error' ? 'text-[#EF4444]' : 'text-[#64748B]');
  
  toast.className = 'flex items-center gap-3 px-4 py-3 bg-white border border-[#e2e8f0] rounded-xl shadow-lg transition-all duration-300 ease-out pointer-events-auto min-w-[300px] translate-x-[120%]';
  toast.style.transition = 'transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), opacity 0.3s ease-out';
  
  toast.innerHTML = `
    <span class="material-symbols-outlined ${iconColor}">${icon}</span>
    <div class="flex-1">
      <p class="font-semibold text-sm text-[#1e293b]">${message}</p>
    </div>
    <button class="p-1 text-[#64748b] hover:text-[#1e293b] transition-colors" onclick="this.parentElement.remove()">
      <span class="material-symbols-outlined text-[18px]">close</span>
    </button>
  `;
  
  container.appendChild(toast);
  
  // Trigger animation
  setTimeout(() => {
    toast.classList.remove('translate-x-[120%]');
    toast.classList.add('translate-x-0');
  }, 10);
  
  // Auto remove
  setTimeout(() => {
    toast.classList.remove('translate-x-0');
    toast.classList.add('translate-x-[120%]');
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 4000);
};

// Override standard alert to use our custom toast
window.alert = (msg) => window.showToast(msg, 'info');

// Check availability function based on availableDays list and consultationTimings string
window.checkAvailability = function(availableDays, consultationTimings) {
  const now = new Date();
  const today = now.toLocaleDateString('en-US', { weekday: 'long' });
  
  const isDayAvailable = availableDays.includes(today);
  if (!isDayAvailable) {
    return { 
      status: 'not-available', 
      text: 'Not Available Today', 
      badgeClass: 'bg-[#F59E0B1A] text-[#92400E]', 
      dotColor: '#F59E0B' 
    };
  }
  
  // Day matches, check shift end time
  if (consultationTimings && consultationTimings.includes(' - ')) {
    const [startStr, endStr] = consultationTimings.split(' - ');
    const [endHours, endMinutes] = endStr.trim().split(':').map(Number);
    
    const shiftEnd = new Date();
    shiftEnd.setHours(endHours, endMinutes, 0, 0);
    
    if (now > shiftEnd) {
      return { 
        status: 'shift-ended', 
        text: 'Shift Ended', 
        badgeClass: 'bg-[#EF44441A] text-[#991B1B]', 
        dotColor: '#EF4444' 
      };
    }
  }
  
  return { 
    status: 'available', 
    text: 'Available Today', 
    badgeClass: 'bg-[#10B9811A] text-[#065F46]', 
    dotColor: '#10B981' 
  };
};

document.addEventListener('DOMContentLoaded', () => {
  setupAuthUI();
  enforcePageAccess();
});

function setupAuthUI() {
  if (window.isAdmin) {
    document.body.classList.add('is-admin');
  } else {
    document.body.classList.remove('is-admin');
  }

  // Setup dynamic logout listener
  const logoutBtn = document.getElementById('logoutLink');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', (e) => {
      e.preventDefault();
      sessionStorage.removeItem('token');
      window.showToast('Logged out successfully', 'success');
      setTimeout(() => {
        window.location.href = 'index.html';
      }, 1000);
    });
  }
}

function enforcePageAccess() {
  const currentPath = window.location.pathname;
  const adminOnlyPages = ['add-doctor.html', 'edit-doctor.html'];
  
  const isBlocked = adminOnlyPages.some(page => currentPath.endsWith(page));
  
  if (isBlocked && !window.isAdmin) {
    window.location.href = 'index.html';
  }
}
