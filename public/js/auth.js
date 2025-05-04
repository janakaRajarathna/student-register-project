// Handle login form submission
document.querySelector('.auth-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
      email: e.target.email.value,
      password: e.target.password.value
    };
  
    try {
      const response = await fetch('/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
  
      if (response.redirected) {
        window.location.href = response.url;
      } else {
        const error = await response.text();
        alert(error);
      }
    } catch (err) {
      console.error('Login error:', err);
    }
  });
  
  // Handle registration form submission
  document.querySelector('.register-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const formData = {
      name: e.target.name.value,
      email: e.target.email.value,
      password: e.target.password.value,
      role: e.target.role.value
    };
  
    try {
      const response = await fetch('/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
  
      if (response.ok) {
        window.location.href = '/login.html';
      } else {
        const error = await response.text();
        alert(error);
      }
    } catch (err) {
      console.error('Registration error:', err);
    }
  });