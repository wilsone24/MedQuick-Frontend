document.addEventListener("DOMContentLoaded", () => {
  // Referencias al DOM
  const doctorsSection = document.getElementById("doctors-section");
  const doctorsList = document.getElementById("doctors-list");

  if (!doctorsList) {
    console.error("Error: No se encontró el elemento #doctors-list");
    return;
  }

  const doctorsLink = document.getElementById("doctors-link");

  let specialtiesMap = new Map();

  if (doctorsLink) {
    doctorsLink.addEventListener("click", async () => {
      document
        .querySelectorAll(".section")
        .forEach((section) => section.classList.remove("active"));
      document
        .querySelectorAll(".nav-link")
        .forEach((link) => link.classList.remove("active"));

      doctorsSection.classList.add("active");
      doctorsLink.classList.add("active");

      await loadSpecialties();
      await loadDoctors();
    });
  }

  async function loadSpecialties() {
    try {
      const response = await fetch("http://127.0.0.1:8000/specialties");
      if (response.ok) {
        const specialties = await response.json();
        specialtiesMap = new Map(
          specialties.map((s) => [s.id_specialty, s.name])
        );
        console.log("Especialidades cargadas:", specialtiesMap);
      } else {
        console.error("No se pudieron cargar las especialidades");
      }
    } catch (error) {
      console.error("Error al cargar especialidades:", error);
    }
  }

  async function loadDoctors() {
    console.log("Cargando doctores...");
    const token = localStorage.getItem("accessToken");
    if (!token) {
      doctorsList.innerHTML =
        '<div class="error-message">Error de autenticación. Inicie sesión nuevamente.</div>';
      return;
    }

    try {
      const url = "http://127.0.0.1:8000/doctors";
      doctorsList.innerHTML = '<div class="loading">Cargando doctores...</div>';
      const response = await fetch(url, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        const data = await response.json();
        displayDoctors(data);
      } else {
        const errorText = await response.text();
        doctorsList.innerHTML =
          '<div class="error-message">Error al cargar doctores. Por favor, intente nuevamente.</div>';
        console.error("Error del servidor:", response.status, errorText);
      }
    } catch (error) {
      doctorsList.innerHTML =
        '<div class="error-message">No se pudo conectar al servidor</div>';
      console.error("Error:", error);
    }
  }

  function displayDoctors(doctors) {
    if (!doctors || doctors.length === 0) {
      doctorsList.innerHTML =
        '<div class="no-results">No se encontraron doctores disponibles</div>';
      return;
    }

    let html = "";
    doctors.forEach((doctor) => {
      const nameParts = doctor.full_name
        ? doctor.full_name.split(" ")
        : ["Doctor"];
      const initials = nameParts
        .map((name) => name && name[0])
        .join("")
        .substring(0, 2)
        .toUpperCase();
      const doctorName = doctor.full_name || "Sin nombre";
      const specialtyId = doctor.id_specialty;
      const doctorSpecialty = specialtiesMap.get(specialtyId) || "Especialista";
      const doctorDescription = doctor.skills_description || "Sin descripción";

      html += `
        <div class="doctor-card">
          <div class="doctor-image" style="background-color: ${stringToColor(
            doctorName
          )}; display: flex; align-items: center; justify-content: center; color: white; font-size: 3rem;">
            ${initials}
          </div>
          <div class="doctor-info">
            <div class="doctor-name">${doctorName}</div>
            <div class="doctor-specialty">${doctorSpecialty}</div>
            <p><strong>Consultorio:</strong> ${doctor.room || "No asignado"}</p>
            <p>${doctorDescription}</p>
          </div>
        </div>
      `;
    });

    doctorsList.innerHTML = html;
  }

  function stringToColor(str) {
    if (!str) return "#cccccc";
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = "#";
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += ("00" + value.toString(16)).substr(-2);
    }
    return color;
  }

  const viewDoctorsBtn = document.getElementById("view-doctors-btn");
  if (viewDoctorsBtn) {
    viewDoctorsBtn.addEventListener("click", async () => {
      document
        .querySelectorAll(".section")
        .forEach((section) => section.classList.remove("active"));
      document
        .querySelectorAll(".nav-link")
        .forEach((link) => link.classList.remove("active"));
      doctorsSection.classList.add("active");
      if (doctorsLink) doctorsLink.classList.add("active");
      await loadSpecialties();
      await loadDoctors();
    });
  }

  // Si ya está activa al cargar la página
  if (doctorsSection && doctorsSection.classList.contains("active")) {
    (async () => {
      await loadSpecialties();
      await loadDoctors();
    })();
  }
});
