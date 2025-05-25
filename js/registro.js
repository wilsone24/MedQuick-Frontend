document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('registerForm');
  const registerMessage = document.getElementById('register-message');
  
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Estructurar los datos según el formato esperado por el backend
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
    
    // Guardar email y contraseña para uso posterior
    const userEmail = data.user.email;
    const userPassword = data.user.password;
    
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
        registerMessage.textContent = 'Registro exitoso. Iniciando sesión...';
        registerMessage.className = 'message success-message';
        
        // Iniciar sesión automáticamente después del registro exitoso
        try {
          const loginData = new FormData();
          loginData.append('username', userEmail);  // El backend espera 'username' según tu código
          loginData.append('password', userPassword);
          
          const loginResponse = await fetch('http://127.0.0.1:8000/login', {
            method: 'POST',
            body: loginData,  // OAuth2PasswordRequestForm espera FormData, no JSON
          });
          
          if (loginResponse.ok) {
            const tokenData = await loginResponse.json();
            // Guardar el token en localStorage
            localStorage.setItem('accessToken', tokenData.access_token);
            
            registerMessage.textContent = 'Inicio de sesión exitoso. Redirigiendo al dashboard...';
            
            // Redireccionar al dashboard después de 1 segundo
            setTimeout(() => {
              window.location.href = 'dashboard.html';
            }, 1000);
          } else {
            // Si falla el inicio de sesión automático
            registerMessage.textContent = 'Registro exitoso, pero el inicio de sesión automático falló. Redirigiendo a la página de login...';
            setTimeout(() => {
              window.location.href = 'login.html';
            }, 2000);
          }
        } catch (loginError) {
          console.error('Error en inicio de sesión automático:', loginError);
          registerMessage.textContent = 'Registro exitoso. Por favor inicia sesión manualmente.';
          setTimeout(() => {
            window.location.href = 'login.html';
          }, 2000);
        }
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