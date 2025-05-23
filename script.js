document
  .getElementById("registerForm")
  .addEventListener("submit", async function (e) {
    e.preventDefault();

    const data = {
      user: {
        full_name: document.getElementById("fullName").value,
        email: document.getElementById("email").value,
        password: document.getElementById("password").value,
      },
      patient: {
        age: parseInt(document.getElementById("age").value),
        phone: document.getElementById("phone").value,
        address: document.getElementById("address").value,
        blood_type: document.getElementById("bloodType").value,
        gender: document.getElementById("gender").value,
      },
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        alert("Registro exitoso");
      } else {
        const result = await response.json();
        alert(
          "Error en el registro: " + (result.detail || response.statusText)
        );
      }
    } catch (error) {
      console.error("Error al registrar:", error);
      alert("No se pudo conectar al servidor.");
    }
  });
