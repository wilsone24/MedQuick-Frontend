document.addEventListener('DOMContentLoaded', () => {
  // Verificar si el usuario ya está autenticado
  const token = localStorage.getItem('accessToken');
  if (token) {
    window.location.href = 'dashboard.html'; // Redirigir al panel si ya está logueado
    return;
  }
  
  // Formularios
  const loginFormElement = document.getElementById('loginForm');
  
  // Mensajes
  const loginMessage = document.getElementById('login-message');
  
  // Manejar inicio de sesión
  loginFormElement.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    
    loginMessage.textContent = 'Iniciando sesión...';
    loginMessage.className = 'message';
    
    try {
      // Crear FormData para OAuth2PasswordRequestForm
      const formData = new FormData();
      formData.append('username', email);  // OAuth2PasswordRequestForm espera 'username' no 'email'
      formData.append('password', password);
      
      const response = await fetch('http://127.0.0.1:8000/login', {
        method: 'POST',
        body: formData,  // No usar headers con FormData, el navegador lo configura automáticamente
      });
      
      const data = await response.json();
      
      if (response.ok) {
        loginMessage.textContent = 'Inicio de sesión exitoso. Redirigiendo...';
        loginMessage.className = 'message success-message';
        
        // Guardar token y datos del usuario de acuerdo con la respuesta de FastAPI
        localStorage.setItem('accessToken', data.access_token);
        localStorage.setItem('id_user', data.id_user);
        
        // Extraer información del payload del token (si lo necesitas)
        // Aquí estamos guardando la información básica que sabemos
        const userData = {
          email: email,
        };
        localStorage.setItem('userData', JSON.stringify(userData));
        
        // Redireccionar al panel principal
        setTimeout(() => {
          window.location.href = 'dashboard.html';
        }, 1500);
      } else {
        loginMessage.textContent = data.detail || 'Credenciales inválidas';
        loginMessage.className = 'message error-message';
      }
    } catch (error) {
      console.error('Error:', error);
      loginMessage.textContent = 'No se pudo conectar al servidor';
      loginMessage.className = 'message error-message';
    }
  });
  
  // Si hay un email en el almacenamiento temporal (de registro rápido), autocompletar
  const tempEmail = localStorage.getItem('tempEmail');
  if (tempEmail) {
    document.getElementById('loginEmail').value = tempEmail;
    localStorage.removeItem('tempEmail'); // Limpiar después de usar
  }
});