"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Users, Clock, CheckCircle, Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

interface Appointment {
  id_appointment: number
  id_doctor: number
  id_patient: number
  date: string
  time: string
  description: string
  status: string
}

interface DashboardStats {
  totalCitas: number
  totalPacientes: number
  citasEnProceso: number
  citasCompletadas: number
}

interface CitasPorEstado {
  estado: string
  cantidad: number
  color: string
}

interface CitasPorMes {
  mes: string
  cantidad: number
}

interface CitasPorDoctor {
  doctor: string
  cantidad: number
}

interface HorasPopulares {
  hora: string
  cantidad: number
}

interface Doctor {
  id_doctor: number
  full_name: string
}

const COLORES_ESTADOS = [
  "#3b82f6", // Azul
  "#10b981", // Verde
  "#f59e0b", // Amarillo
  "#ef4444", // Rojo
  "#8b5cf6", // Púrpura
  "#06b6d4", // Cyan
]

export default function AnalyticsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    totalCitas: 0,
    totalPacientes: 0,
    citasEnProceso: 0,
    citasCompletadas: 0,
  })
  const [citasPorEstado, setCitasPorEstado] = useState<CitasPorEstado[]>([])
  const [citasPorMes, setCitasPorMes] = useState<CitasPorMes[]>([])
  const [citasPorDoctor, setCitasPorDoctor] = useState<CitasPorDoctor[]>([])
  const [horasPopulares, setHorasPopulares] = useState<HorasPopulares[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      setLoading(true)
      setError("")

      // Fetch citas y doctores en paralelo
      const [appointmentsResponse, doctorsResponse] = await Promise.all([
        fetch("http://127.0.0.1:8000/appointments", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }),
        fetch("http://127.0.0.1:8000/doctors", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }),
      ])

      if (!appointmentsResponse.ok) {
        throw new Error("Error al cargar las citas")
      }

      if (!doctorsResponse.ok) {
        throw new Error("Error al cargar los doctores")
      }

      const appointmentsData: Appointment[] = await appointmentsResponse.json()
      const doctorsData: Doctor[] = await doctorsResponse.json()

      setAppointments(appointmentsData)
      setDoctors(doctorsData)
      processStats(appointmentsData, doctorsData)
    } catch (err) {
      console.error("Error fetching data:", err)
      setError(err instanceof Error ? err.message : "Error al cargar la información")
    } finally {
      setLoading(false)
    }
  }

  const processStats = (appointments: Appointment[], doctors: Doctor[]) => {
    // Calcular estadísticas básicas (código existente)
    const totalCitas = appointments.length
    const pacientesUnicos = new Set(appointments.map((apt) => apt.id_patient)).size
    const citasEnProceso = appointments.filter((apt) => apt.status.toLowerCase() === "in process").length
    const citasCompletadas = appointments.filter((apt) => apt.status.toLowerCase() === "completed").length

    setStats({
      totalCitas,
      totalPacientes: pacientesUnicos,
      citasEnProceso,
      citasCompletadas,
    })

    // Procesar datos para gráfica de estados (código existente)
    const estadosCount: { [key: string]: number } = {}
    appointments.forEach((apt) => {
      const estado = apt.status || "Sin estado"
      estadosCount[estado] = (estadosCount[estado] || 0) + 1
    })

    const estadosData: CitasPorEstado[] = Object.entries(estadosCount).map(([estado, cantidad], index) => ({
      estado,
      cantidad,
      color: COLORES_ESTADOS[index % COLORES_ESTADOS.length],
    }))

    setCitasPorEstado(estadosData)

    // Procesar datos para gráfica de meses (código corregido)
    const mesesCount: { [key: string]: number } = {}
    appointments.forEach((apt) => {
      // Extraer año y mes directamente de la cadena de fecha (formato YYYY-MM-DD)
      const [year, month] = apt.date.split("-").map(Number)

      // Crear un objeto Date con el primer día del mes para obtener el nombre del mes
      const fecha = new Date(year, month - 1, 1)

      // Formatear como "Mes YYYY" (ej: "Mayo 2024")
      const nombreMes = fecha.toLocaleDateString("es-ES", { month: "long" })
      const mesAno = `${nombreMes.charAt(0).toUpperCase() + nombreMes.slice(1)} ${year}`

      mesesCount[mesAno] = (mesesCount[mesAno] || 0) + 1
    })

    // Ordenar los meses cronológicamente
    const mesesData: CitasPorMes[] = Object.entries(mesesCount)
      .map(([mes, cantidad]) => ({ mes, cantidad }))
      .sort((a, b) => {
        // Extraer año y mes del formato "Mes YYYY"
        const [mesA, yearA] = a.mes.split(" ")
        const [mesB, yearB] = b.mes.split(" ")

        // Convertir a números para comparación
        const yearNumA = Number.parseInt(yearA)
        const yearNumB = Number.parseInt(yearB)

        // Primero comparar por año
        if (yearNumA !== yearNumB) {
          return yearNumA - yearNumB
        }

        // Si el año es el mismo, comparar por mes
        const meses = [
          "Enero",
          "Febrero",
          "Marzo",
          "Abril",
          "Mayo",
          "Junio",
          "Julio",
          "Agosto",
          "Septiembre",
          "Octubre",
          "Noviembre",
          "Diciembre",
        ]
        return meses.indexOf(mesA) - meses.indexOf(mesB)
      })

    setCitasPorMes(mesesData)

    // Procesar datos para gráfica de citas por doctor
    const doctoresCount: { [key: number]: number } = {}
    appointments.forEach((apt) => {
      doctoresCount[apt.id_doctor] = (doctoresCount[apt.id_doctor] || 0) + 1
    })

    const doctoresData: CitasPorDoctor[] = Object.entries(doctoresCount)
      .map(([doctorId, cantidad]) => {
        const doctor = doctors.find((d) => d.id_doctor === Number.parseInt(doctorId))
        return {
          doctor: doctor ? `Dr. ${doctor.full_name}` : `Doctor ${doctorId}`,
          cantidad,
        }
      })
      .sort((a, b) => b.cantidad - a.cantidad)
      .slice(0, 10) // Top 10 doctores

    setCitasPorDoctor(doctoresData)

    // Procesar datos para gráfica de horas populares
    const horasCount: { [key: string]: number } = {}
    appointments.forEach((apt) => {
      const hora = apt.time.substring(0, 5) // Obtener HH:MM
      horasCount[hora] = (horasCount[hora] || 0) + 1
    })

    const horasData: HorasPopulares[] = Object.entries(horasCount)
      .map(([hora, cantidad]) => ({ hora, cantidad }))
      .sort((a, b) => {
        // Ordenar por hora (de menor a mayor)
        const [horaA, minutoA] = a.hora.split(":").map(Number)
        const [horaB, minutoB] = b.hora.split(":").map(Number)
        const tiempoA = horaA * 60 + minutoA
        const tiempoB = horaB * 60 + minutoB
        return tiempoA - tiempoB
      })

    setHorasPopulares(horasData)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Analítico</h2>
          <p className="text-muted-foreground">Visualiza tus métricas de salud y actividad médica.</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Cargando estadísticas del dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Dashboard Analítico</h2>
          <p className="text-muted-foreground">Visualiza tus métricas de salud y actividad médica.</p>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard Analítico</h2>
        <p className="text-muted-foreground">Visualiza tus métricas de salud y actividad médica.</p>
      </div>

      {/* Estadísticas Principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Citas</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCitas}</div>
            <p className="text-xs text-muted-foreground">Citas registradas en el sistema</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Pacientes</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPacientes}</div>
            <p className="text-xs text-muted-foreground">Pacientes únicos registrados</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Citas en Proceso</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.citasEnProceso}</div>
            <p className="text-xs text-muted-foreground">Citas actualmente en proceso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Citas Completadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.citasCompletadas}</div>
            <p className="text-xs text-muted-foreground">Citas finalizadas exitosamente</p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficas */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Gráfica de Citas por Estado */}
        <Card>
          <CardHeader>
            <CardTitle>Citas por Estado</CardTitle>
            <CardDescription>Distribución de citas según su estado actual</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={citasPorEstado}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ estado, cantidad, percent }) => `${estado}: ${cantidad} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="cantidad"
                  >
                    {citasPorEstado.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfica de Citas por Mes */}
        <Card>
          <CardHeader>
            <CardTitle>Citas por Mes</CardTitle>
            <CardDescription>Número de citas programadas por mes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={citasPorMes}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="cantidad" fill="#3b82f6" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficas Adicionales */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Gráfica de Citas por Doctor */}
        <Card>
          <CardHeader>
            <CardTitle>Citas por Doctor</CardTitle>
            <CardDescription>Distribución de citas entre doctores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={citasPorDoctor}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ doctor, cantidad, percent }) => `${doctor}: ${cantidad} (${(percent * 100).toFixed(0)}%)`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="cantidad"
                  >
                    {citasPorDoctor.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORES_ESTADOS[index % COLORES_ESTADOS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} citas`, ""]} labelFormatter={(label) => label} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Gráfica de Horas Populares */}
        <Card>
          <CardHeader>
            <CardTitle>Horas Más Populares</CardTitle>
            <CardDescription>Horarios con mayor demanda de citas (ordenados por hora)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={horasPopulares}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="hora" />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="cantidad" fill="#f59e0b" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
