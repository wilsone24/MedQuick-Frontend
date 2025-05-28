document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  const registerMessage = document.getElementById('register-message');
  
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const data = {
      user: {
        full_name: document.getElementById('fullName').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
      },
      patient: {
        age: parseInt(document.getElementById('age').value),
        phone: document.getElementById('phone').value,
        address: document.getElementById('address').value,
        blood_type: document.getElementById('bloodType').value,
        gender: document.getElementById('gender').value,
      },
    };
    
    registerMessage.textContent = "Procesando registro...";
    registerMessage.className = "message";
    
    try {
      const response = await fetch('http://127.0.0.1:8000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (response.ok) {
        registerMessage.textContent = 'Registro exitoso. Redirigiendo a la página de login...';
        registerMessage.className = 'message success-message';
        
        // Redirigir al login después de un segundo
        setTimeout(() => {
          window.location.href = 'login.html';
        }, 1000);
      } else {
        const errorData = await response.json();
        registerMessage.textContent = 'Error: ' + (errorData.detail || errorData.message || 'Error en el registro');
        registerMessage.className = 'message error-message';
      }
    } catch (error) {
      console.error('Error:', error);
      registerMessage.textContent = 'No se pudo conectar al servidor';
      registerMessage.className = 'message error-message';
    }
  });
});
