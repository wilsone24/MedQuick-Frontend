document.addEventListener("DOMContentLoaded", () => {
  const btnNewAppointment = document.getElementById("new-appointment-btn");
  const modal = document.getElementById("new-appointment-modal");
  const btnCancel = document.getElementById("cancel-appointment-btn");
  const formCrearCita = document.getElementById("formCrearCita");

  const selectDoctor = document.getElementById("doctor");
  const inputFecha = document.getElementById("fecha");
  const selectHora = document.getElementById("hora");

  let doctoresMap = {}; // Aquí guardaremos los doctores por ID

  function showModal() {
    modal.classList.remove("hidden");
    cargarDoctores();
    formCrearCita.reset();
    selectHora.innerHTML = '<option value="">Seleccione una hora</option>';
    selectHora.disabled = true;
  }

  function hideModal() {
    modal.classList.add("hidden");
  }

  function cargarDoctores() {
    selectDoctor.innerHTML = '<option value="">Cargando doctores...</option>';
    fetch("http://127.0.0.1:8000/doctors", {
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Error al cargar doctores: ${res.status}`);
        return res.json();
      })
      .then((doctores) => {
        doctoresMap = {}; // Reiniciar mapa
        selectDoctor.innerHTML = '<option value="">Seleccione un doctor</option>';
        doctores.forEach((doc) => {
          doctoresMap[doc.id_doctor] = doc.full_name; // Guardar nombre por ID
          const option = document.createElement("option");
          option.value = doc.id_doctor;
          option.textContent = doc.full_name;
          selectDoctor.appendChild(option);
        });
        cargarCitas(); // Refrescar citas con nombres de doctores
      })
      .catch(() => {
        selectDoctor.innerHTML =
          '<option value="">No se pudieron cargar los doctores</option>';
      });
  }

  function cargarHorasDisponibles() {
    const idDoctor = parseInt(selectDoctor.value, 10);
    const fecha = inputFecha.value;

    if (!idDoctor || !fecha) {
      selectHora.innerHTML = '<option value="">Seleccione una hora</option>';
      selectHora.disabled = true;
      return;
    }

    fetch("http://127.0.0.1:8000/doctors/schedule", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        accept: "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      body: JSON.stringify({ id_doctor: idDoctor, date: fecha }),
    })
      .then((res) => {
        if (!res.ok) throw new Error(`Error ${res.status}`);
        return res.json();
      })
      .then((horas) => {
        selectHora.innerHTML = "";
        if (horas.length === 0) {
          selectHora.innerHTML =
            '<option value="">No hay horas disponibles</option>';
          selectHora.disabled = true;
          return;
        }
        horas.forEach((hora) => {
          const option = document.createElement("option");
          option.value = hora;
          option.textContent = hora;
          selectHora.appendChild(option);
        });
        selectHora.disabled = false;
      })
      .catch(() => {
        alert("No se pudieron cargar las horas disponibles.");
      });
  }

  async function cargarCitas() {
    const appointmentsList = document.getElementById("appointments-list");
    appointmentsList.innerHTML = '<div class="loading">Cargando citas...</div>';

    try {
      const response = await fetch(
        `http://127.0.0.1:8000/appointments/${localStorage.getItem("id_user")}`,
        {
          method: "GET",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error("Error al obtener las citas.");
      }

      const appointments = await response.json();

      if (appointments.length === 0) {
        appointmentsList.innerHTML = "<p>No tienes citas registradas.</p>";
        return;
      }

      appointmentsList.innerHTML = ""; // Limpiar loading

      appointments.forEach((appt) => {
        const card = document.createElement("div");
        card.className = "appointment-card";

        const doctorName = doctoresMap[appt.id_doctor] || `Doctor ID: ${appt.id_doctor}`;

        card.innerHTML = `
          <div class="appointment-info">
            <div class="appointment-date">${appt.date} ${appt.time}</div>
            <div class="appointment-doctor">${doctorName}</div>
            <div class="appointment-description">${appt.description}</div>
          </div>
          <div class="appointment-status ${getStatusClass(appt.status)}">
            ${appt.status}
          </div>
        `;

        appointmentsList.appendChild(card);
      });
    } catch (error) {
      appointmentsList.innerHTML = `<p>Error: ${error.message}</p>`;
    }
  }

  function getStatusClass(status) {
    switch (status.toLowerCase()) {
      case "pending":
      case "in process":
        return "status-pending"; // amarillo
      case "completed":
        return "status-completed"; // verde
      case "canceled":
        return "status-canceled"; // rojo
      default:
        return "";
    }
  }

  // Eventos
  btnNewAppointment.addEventListener("click", showModal);
  btnCancel.addEventListener("click", hideModal);
  selectDoctor.addEventListener("change", cargarHorasDisponibles);
  inputFecha.addEventListener("change", cargarHorasDisponibles);

  formCrearCita.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = {
      id_doctor: parseInt(selectDoctor.value),
      id_patient: localStorage.getItem("id_user"),
      date: inputFecha.value,
      time: selectHora.value,
      description: document.getElementById("descripcion").value,
    };

    fetch("http://127.0.0.1:8000/appointments", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
      },
      body: JSON.stringify(data),
    })
      .then((res) => {
        if (!res.ok) throw new Error("Error en la respuesta");
        return res.json();
      })
      .then(() => {
        alert("✅ Cita creada exitosamente");
        hideModal();
        cargarCitas();
      })
      .catch(() => {
        alert("❌ Ocurrió un error al crear la cita");
      });
  });

  // Inicializar doctores y citas al cargar la página
  cargarDoctores(); // esto carga doctores y llama cargarCitas internamente
});

