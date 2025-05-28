// Función para obtener datos de la API y actualizar el dashboard médico
async function fetchData() {
  try {
    const [appointmentsRes, doctorsRes] = await Promise.all([
      fetch("http://127.0.0.1:8000/appointments"),
      fetch("http://127.0.0.1:8000/doctors"),
    ]);

    if (!appointmentsRes.ok || !doctorsRes.ok) {
      throw new Error(
        `Error en las respuestas: ${appointmentsRes.status}, ${doctorsRes.status}`
      );
    }

    const appointments = await appointmentsRes.json();
    const doctors = await doctorsRes.json();

    // Crear un mapa de ID de doctor => Nombre
    const doctorMap = {};
    doctors.forEach((doc) => {
      doctorMap[doc.id_doctor] = doc.full_name;
    });

    // Estadísticas básicas
    document.getElementById("totalAppointments").textContent =
      appointments.length;
    document.getElementById("totalPatients").textContent = new Set(
      appointments.map((d) => d.id_patient)
    ).size;
    document.getElementById("inProgress").textContent = appointments.filter(
      (d) =>
        d.status.toLowerCase() === "in progress" ||
        d.status.toLowerCase() === "in process"
    ).length;
    document.getElementById("completed").textContent = appointments.filter(
      (d) => d.status.toLowerCase() === "completed"
    ).length;

    // Contadores
    const statusCounts = {};
    const monthCounts = {};
    const doctorCounts = {};
    const hourCounts = {};

    appointments.forEach((d) => {
      statusCounts[d.status] = (statusCounts[d.status] || 0) + 1;

      const monthIndex = d.date.split("-")[1]; // obtiene '06' por ejemplo
      const monthNames = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ];
      const month = monthNames[parseInt(monthIndex, 10) - 1]; // convierte '06' a 'Jun'
      monthCounts[month] = (monthCounts[month] || 0) + 1;

      const doctorName = doctorMap[d.id_doctor] || `ID ${d.id_doctor}`;
      doctorCounts[doctorName] = (doctorCounts[doctorName] || 0) + 1;

      const hour = d.time.split(":")[0] + ":00";
      hourCounts[hour] = (hourCounts[hour] || 0) + 1;
    });

    // Ordenar horas
    const sortedHourCounts = Object.keys(hourCounts)
      .sort((a, b) => parseInt(a) - parseInt(b))
      .reduce((obj, key) => {
        obj[key] = hourCounts[key];
        return obj;
      }, {});

    // Gráficas
    renderChart("byStatus", "Citas por Estado", statusCounts, "bar", true);
    renderChart("byMonth", "Citas por Mes", monthCounts, "line");
    renderChart("byDoctor", "Citas por Doctor", doctorCounts, "doughnut");
    renderChart(
      "byHour",
      "Horas de Citas Más Comunes",
      sortedHourCounts,
      "bar"
    );
  } catch (error) {
    console.error("Error al obtener datos:", error);
  }
}

// Función para renderizar una gráfica de Chart.js
function renderChart(id, label, dataObject, type, isHorizontal = false) {
  const ctx = document.getElementById(id);
  if (!ctx) {
    console.error(`Elemento canvas con ID '${id}' no encontrado.`);
    return;
  }
  const chartInstance = Chart.getChart(id);
  if (chartInstance) {
    chartInstance.destroy();
  }

  const multiColorPalette = [
    "rgba(14, 165, 233, 0.8)", // Sky Blue
    "rgba(34, 197, 94, 0.8)",
    "rgba(251, 191, 36, 0.8)",
    "rgba(239, 68, 68, 0.8)",
    "rgba(168, 85, 247, 0.8)",
    "rgba(6, 182, 212, 0.8)",
    "rgba(249, 115, 22, 0.8)",
    "rgba(139, 92, 246, 0.8)",
  ];

  const barBackgroundColor = "rgba(14, 165, 233, 0.8)";
  const barHoverBackgroundColor = "rgba(14, 165, 233, 1)";

  let datasets = [];
  let options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: type === "doughnut" || type === "pie" || type === "polarArea",
        position: "right",
        labels: {
          color: "#374151",
          font: {
            size: 12,
          },
        },
      },
      title: {
        display: true,
        text: label,
        font: {
          size: 18,
          weight: "bold",
          family: "Inter, sans-serif",
        },
        color: "#374151",
        padding: {
          top: 10,
          bottom: 20,
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.7)",
        titleFont: {
          size: 14,
          weight: "bold",
        },
        bodyFont: {
          size: 12,
        },
        padding: 10,
        cornerRadius: 6,
        displayColors:
          type === "doughnut" || type === "pie" || type === "polarArea",
      },
    },
    animation: {
      duration: 1000,
      easing: "easeInOutQuart",
    },
  };

  if (type === "bar") {
    datasets.push({
      label,
      data: Object.values(dataObject),
      backgroundColor: barBackgroundColor,
      borderColor: "transparent",
      borderWidth: 0,
      borderRadius: 8,
      hoverBackgroundColor: barHoverBackgroundColor,
    });

    options.indexAxis = isHorizontal ? "y" : "x";
    options.scales = {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          color: "#6b7280",
        },
        grid: {
          display: false,
        },
      },
      x: {
        ticks: {
          color: "#6b7280",
        },
        grid: {
          display: false,
        },
      },
    };

    if (isHorizontal) {
      options.scales = {
        x: {
          beginAtZero: true,
          ticks: {
            precision: 0,
            color: "#6b7280",
          },
          grid: {
            display: false,
          },
        },
        y: {
          ticks: {
            color: "#6b7280",
          },
          grid: {
            display: false,
          },
        },
      };
    }
  } else if (type === "doughnut" || type === "pie" || type === "polarArea") {
    datasets.push({
      label,
      data: Object.values(dataObject),
      backgroundColor: multiColorPalette.slice(
        0,
        Object.keys(dataObject).length
      ),
      borderColor: "transparent",
      borderWidth: 0,
      hoverOffset: 4,
    });
    options.scales = {};
  } else if (type === "line") {
    datasets.push({
      label,
      data: Object.values(dataObject),
      fill: true,
      borderColor: "rgba(14, 165, 233, 1)",
      backgroundColor: "rgba(14, 165, 233, 0.2)",
      tension: 0.4,
      pointBackgroundColor: "rgba(14, 165, 233, 1)",
      pointBorderColor: "#fff",
      pointHoverBackgroundColor: "#fff",
      pointHoverBorderColor: "rgba(14, 165, 233, 1)",
    });
    options.scales = {
      y: {
        beginAtZero: true,
        ticks: {
          precision: 0,
          color: "#6b7280",
        },
        grid: {
          display: false,
        },
      },
      x: {
        ticks: {
          color: "#6b7280",
        },
        grid: {
          display: false,
        },
      },
    };
  }

  new Chart(ctx.getContext("2d"), {
    type: type,
    data: {
      labels: Object.keys(dataObject),
      datasets: datasets,
    },
    options: options,
  });
}
