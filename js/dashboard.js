document.addEventListener("DOMContentLoaded", () => {
  console.log("Cargando dashboard...");

  // Verificar autenticación
  const token = localStorage.getItem("accessToken");
  console.log("¿Hay token?", !!token);

  if (!token) {
    console.log("No hay token, redirigiendo a login.html");
    window.location.replace("login.html");
    return;
  }

  // Cargar datos del usuario
  let userData;
  try {
    userData = JSON.parse(localStorage.getItem("userData") || "{}");
    console.log("Datos de usuario cargados:", userData);
  } catch (error) {
    console.error("Error al cargar datos del usuario:", error);
    userData = {};
  }

  // Ocultar secciones según el email del usuario
  if (userData.email === 'admin@medquick.com') {
    // Ocultar secciones
    document.getElementById('appointments-section')?.classList.add('hidden');
    document.getElementById('doctors-section')?.classList.add('hidden');
    document.getElementById('dashboard-section')?.classList.add('hidden');

    // Ocultar elementos <li> del menú
    document.getElementById('dashboard-link')?.parentElement?.classList.add('hidden');
    document.getElementById('doctors-link')?.parentElement?.classList.add('hidden');
    document.getElementById('appointments-link')?.parentElement?.classList.add('hidden');
  } else {
    // Ocultar dashboard médico y su enlace
    document.getElementById('medical-dashboard-section')?.classList.add('hidden');
    document.getElementById('medical-dashboard-link')?.parentElement?.classList.add('hidden');
  }

  // Mostrar información del usuario en la barra de navegación
  const userInfoElement = document.getElementById("user-info");
  if (userInfoElement) {
    if (userData.fullName) {
      // Obtener iniciales para el avatar
      const initials = userData.fullName
        .split(" ")
        .map((name) => name && name[0])
        .filter(Boolean)
        .join("")
        .substring(0, 2)
        .toUpperCase();

      userInfoElement.innerHTML = `
        <div class="user-avatar">${initials}</div>
        <span>${userData.fullName}</span>
      `;
    } else if (userData.email) {
      // Si no hay nombre completo, usar la primera letra del email
      const initial = userData.email[0].toUpperCase();
      userInfoElement.innerHTML = `
        <div class="user-avatar">${initial}</div>
        <span>${userData.email}</span>
      `;
    } else {
      // Fallback si no hay datos
      userInfoElement.innerHTML = `
        <div class="user-avatar">U</div>
        <span>Usuario</span>
      `;
    }
  }

  // Manejar cierre de sesión
  const logoutBtn = document.getElementById("logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      console.log("Cerrando sesión...");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("userData");
      window.location.replace("index.html");
    });
  }

  // Navegación entre secciones
  const sections = document.querySelectorAll(".section");
  const navLinks = document.querySelectorAll(".nav-link");

  if (sections.length > 0 && navLinks.length > 0) {
    function showSection(sectionId) {
      console.log("Cambiando a sección:", sectionId);

      sections.forEach((section) => {
        section.classList.remove("active");
      });

      navLinks.forEach((link) => {
        link.classList.remove("active");
      });

      const targetSection = document.getElementById(sectionId);
      if (targetSection) {
        targetSection.classList.add("active");

        const linkId = `${sectionId.replace("-section", "")}-link`;
        const targetLink = document.getElementById(linkId);
        if (targetLink) {
          targetLink.classList.add("active");
        }
      }
    }

    // Asignar eventos a los enlaces de navegación
    navLinks.forEach((link) => {
      link.addEventListener("click", (e) => {
        e.preventDefault();
        const sectionId = e.target.id.replace("-link", "-section");
        showSection(sectionId);
      });
    });

    // Botones de las tarjetas del dashboard
    const viewDoctorsBtn = document.getElementById("view-doctors-btn");
    if (viewDoctorsBtn) {
      viewDoctorsBtn.addEventListener("click", () => {
        showSection("doctors-section");
      });
    }

    const viewAppointmentsBtn = document.getElementById(
      "view-appointments-btn"
    );
    if (viewAppointmentsBtn) {
      viewAppointmentsBtn.addEventListener("click", () => {
        showSection("appointments-section");
      });
    }

    const viewSurveysBtn = document.getElementById("view-surveys-btn");
    if (viewSurveysBtn) {
      viewSurveysBtn.addEventListener("click", () => {
        showSection("surveys-section");
      });
    }
  }

  // Manejo del perfil
  const profileLink = document.getElementById("profile-link");
  const profileForm = document.getElementById("profile-form");

  if (profileLink && profileForm) {
    // Cargar datos del perfil al hacer clic en el enlace
    profileLink.addEventListener("click", () => {
      const profileName = document.getElementById("profile-name");
      const profileEmail = document.getElementById("profile-email");
      const profileAge = document.getElementById("profile-age");
      const profilePhone = document.getElementById("profile-phone");
      const profileAddress = document.getElementById("profile-address");
      const profileBlood = document.getElementById("profile-blood");

      if (userData) {
        if (profileName) profileName.value = userData.fullName || "";
        if (profileEmail) profileEmail.value = userData.email || "";
        if (profileAge) profileAge.value = userData.age || "";
        if (profilePhone) profilePhone.value = userData.phone || "";
        if (profileAddress) profileAddress.value = userData.address || "";
        if (profileBlood) profileBlood.value = userData.bloodType || "";
      }
    });
  }

  // Cargar lista de doctores (si existe la sección)
  const doctorsSection = document.getElementById("doctors-section");
  if (doctorsSection) {
    const doctorsList = doctorsSection.querySelector(".doctors-list");
    if (doctorsList) {
      loadDoctors(doctorsList, token);
    }
  }

  
  
});

// Función para cargar la lista de doctores
async function loadDoctors(container, token) {
  try {
    container.innerHTML = "<p>Cargando doctores...</p>";

    const response = await fetch("http://127.0.0.1:8000/doctors", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const doctors = await response.json();

      if (doctors.length === 0) {
        container.innerHTML = "<p>No hay doctores disponibles actualmente.</p>";
        return;
      }

      let html = '<div class="doctors-grid">';
      doctors.forEach((doctor) => {
        html += `
          <div class="doctor-card">
            <div class="doctor-avatar">
              ${doctor.name.charAt(0)}${doctor.lastName.charAt(0)}
            </div>
            <h3>${doctor.name} ${doctor.lastName}</h3>
            <p>${doctor.specialty}</p>
            <button class="btn secondary-btn book-appointment" data-id="${
              doctor.id
            }">Reservar cita</button>
          </div>
        `;
      });
      html += "</div>";

      container.innerHTML = html;

      // Añadir eventos a los botones de reserva
      document.querySelectorAll(".book-appointment").forEach((button) => {
        button.addEventListener("click", () => {
          const doctorId = button.getAttribute("data-id");
          showBookingForm(doctorId);
        });
      });
    } else {
      container.innerHTML =
        "<p>Error al cargar los doctores. Intente nuevamente más tarde.</p>";
    }
  } catch (error) {
    console.error("Error al cargar doctores:", error);
    container.innerHTML = "<p>No se pudo conectar al servidor.</p>";
  }
}
