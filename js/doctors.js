document.addEventListener('DOMContentLoaded', () => {
  // Referencias al DOM
  const doctorsSection = document.getElementById('doctors-section');
  const doctorsList = document.getElementById('doctors-list');
  
  // Verificar que los elementos existen
  if (!doctorsList) {
    console.error("Error: No se encontró el elemento #doctors-list");
    return;
  }

  // Cargar doctores cuando se haga clic en la sección de doctores
  const doctorsLink = document.getElementById('doctors-link');
  if (doctorsLink) {
    doctorsLink.addEventListener('click', () => {
      // Primero activamos la sección correcta
      document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
      });
      document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
      });
      
      doctorsSection.classList.add('active');
      doctorsLink.classList.add('active');
      
      // Luego cargamos los datos
      loadDoctors();
    });
  }
  
  // Función para cargar doctores
  async function loadDoctors() {
    console.log("Cargando doctores...");
    
    const token = localStorage.getItem('accessToken');
    if (!token) {
      console.error("No hay token de autenticación");
      doctorsList.innerHTML = '<div class="error-message">Error de autenticación. Inicie sesión nuevamente.</div>';
      return;
    }
    
    try {
      const url = 'http://127.0.0.1:8000/doctors';
      
      doctorsList.innerHTML = '<div class="loading">Cargando doctores...</div>';
      console.log("Haciendo fetch a:", url);
      
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log("Datos recibidos:", data);
        displayDoctors(data);
      } else {
        const errorText = await response.text();
        console.error("Error del servidor:", response.status, errorText);
        doctorsList.innerHTML = '<div class="error-message">Error al cargar doctores. Por favor, intente nuevamente.</div>';
      }
    } catch (error) {
      console.error('Error:', error);
      doctorsList.innerHTML = '<div class="error-message">No se pudo conectar al servidor</div>';
    }
  }
  
  // Mostrar doctores en la interfaz
  function displayDoctors(doctors) {
    console.log("Mostrando doctores:", doctors);
    
    if (!doctors || doctors.length === 0) {
      doctorsList.innerHTML = '<div class="no-results">No se encontraron doctores disponibles</div>';
      return;
    }
    
    let html = '';
    doctors.forEach(doctor => {
      // Generar iniciales para el avatar
      const nameParts = doctor.full_name ? doctor.full_name.split(' ') : ['Doctor'];
      const initials = nameParts.map(name => name && name[0]).join('').substring(0, 2).toUpperCase();
      
      // Usar el nombre correcto según la API
      const doctorName = doctor.full_name || 'Sin nombre';
      const doctorSpecialty = doctor.specialty_name || 'Especialista';
      const doctorDescription = doctor.skills_description || 'Sin descripción';
      
      html += `
        <div class="doctor-card">
          <div class="doctor-image" style="background-color: ${stringToColor(doctorName)}; display: flex; align-items: center; justify-content: center; color: white; font-size: 3rem;">
            ${initials}
          </div>
          <div class="doctor-info">
            <div class="doctor-name">${doctorName}</div>
            <div class="doctor-specialty">${doctorSpecialty}</div>
            <p><strong>Consultorio:</strong> ${doctor.room || 'No asignado'}</p>
            <p>${doctorDescription}</p>
            <button class="btn primary-btn schedule-btn" data-id="${doctor.id_doctor}">Agendar cita</button>
          </div>
        </div>
      `;
    });
    
    doctorsList.innerHTML = html;
    
    // Añadir evento para los botones de agendar cita
    document.querySelectorAll('.schedule-btn').forEach(button => {
      button.addEventListener('click', () => {
        const doctorId = button.getAttribute('data-id');
        const card = button.closest('.doctor-card');
        const doctorName = card.querySelector('.doctor-name').textContent;
        const specialty = card.querySelector('.doctor-specialty').textContent;
        
        showScheduleModal({
          id: doctorId,
          fullName: doctorName,
          specialty: specialty
        });
      });
    });
  }
  
  // Función auxiliar para generar color basado en string
  function stringToColor(str) {
    if (!str) return '#cccccc';
    
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    
    let color = '#';
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xFF;
      color += ('00' + value.toString(16)).substr(-2);
    }
    return color;
  }
  
  // Función para mostrar modal de programación de cita
  function showScheduleModal(doctor) {
    console.log(`Mostrar modal para programar cita con el doctor: ${doctor.fullName} (ID: ${doctor.id})`);
    
    // Por ahora, solo mostrar un mensaje
    alert(`Para programar una cita con ${doctor.fullName}, contacte directamente a la clínica.`);
    
    // En un desarrollo completo, aquí implementarías un modal con calendario y opciones de horario
  }

  // Cargar doctores al cargar la página si estamos en la sección correspondiente
  if (doctorsSection && doctorsSection.classList.contains('active')) {
    console.log("Sección de doctores activa al cargar, inicializando datos");
    loadDoctors();
  }
  
  // También cargar si se hace clic en "Ver doctores" desde el dashboard
  const viewDoctorsBtn = document.getElementById('view-doctors-btn');
  if (viewDoctorsBtn) {
    viewDoctorsBtn.addEventListener('click', () => {
      // Activar sección de doctores
      document.querySelectorAll('.section').forEach(section => {
        section.classList.remove('active');
      });
      document.querySelectorAll('.nav-link').forEach(link => {
        link.classList.remove('active');
      });
      
      doctorsSection.classList.add('active');
      if (doctorsLink) {
        doctorsLink.classList.add('active');
      }
      
      loadDoctors();
    });
  }
});