"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Clock, FileText, Loader2, AlertCircle, Trash2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { NewAppointmentModal } from "@/components/new-appointment-modal"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface Appointment {
  id_appointment: number
  id_doctor: number
  id_patient: number
  date: string
  time: string
  description: string
  status: string
}

interface Doctor {
  id_specialty: number
  full_name: string
  email: string
  phone: string
  room: string
  skills_description: string
  id_doctor: number
}

export default function CitasPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError("")

      const token = localStorage.getItem("access_token")
      const userId = localStorage.getItem("id_user")

      if (!token || !userId) {
        throw new Error("No se encontró información de autenticación")
      }

      // Fetch citas y doctores en paralelo
      const [appointmentsResponse, doctorsResponse] = await Promise.all([
        fetch(`http://127.0.0.1:8000/appointments/${userId}`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch("http://127.0.0.1:8000/doctors", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
      ])

      if (!appointmentsResponse.ok) {
        if (appointmentsResponse.status === 401) {
          throw new Error("Sesión expirada. Por favor, inicia sesión nuevamente.")
        }
        throw new Error("Error al cargar las citas")
      }

      if (!doctorsResponse.ok) {
        throw new Error("Error al cargar la información de los doctores")
      }

      const appointmentsData = await appointmentsResponse.json()
      const doctorsData = await doctorsResponse.json()

      setAppointments(appointmentsData)
      setDoctors(doctorsData)
    } catch (err) {
      console.error("Error fetching data:", err)
      setError(err instanceof Error ? err.message : "Error al cargar la información")
    } finally {
      setLoading(false)
    }
  }

  const getDoctorName = (doctorId: number) => {
    const doctor = doctors.find((d) => d.id_doctor === doctorId)
    return doctor ? doctor.full_name : "Doctor no encontrado"
  }

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(":")
    return `${hours}:${minutes}`
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmada":
      case "confirmed":
        return "bg-green-100 text-green-800"
      case "pendiente":
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "cancelada":
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "completada":
      case "completed":
        return "bg-blue-100 text-blue-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getStatusText = (status: string) => {
    switch (status.toLowerCase()) {
      case "confirmed":
        return "Confirmada"
      case "pending":
        return "Pendiente"
      case "cancelled":
        return "Cancelada"
      case "completed":
        return "Completada"
      default:
        return status
    }
  }

  const sortedAppointments = appointments.sort((a, b) => {
    // Comparar fechas sin conversión de zona horaria
    const [yearA, monthA, dayA] = a.date.split("-").map(Number)
    const [yearB, monthB, dayB] = b.date.split("-").map(Number)
    const [hoursA, minutesA] = a.time.split(":").map(Number)
    const [hoursB, minutesB] = b.time.split(":").map(Number)

    const dateA = new Date(yearA, monthA - 1, dayA, hoursA, minutesA)
    const dateB = new Date(yearB, monthB - 1, dayB, hoursB, minutesB)

    return dateA.getTime() - dateB.getTime()
  })

  const upcomingAppointments = sortedAppointments.filter((apt) => {
    const [year, month, day] = apt.date.split("-").map(Number)
    const [hours, minutes] = apt.time.split(":").map(Number)
    const appointmentDate = new Date(year, month - 1, day, hours, minutes)
    return appointmentDate > new Date()
  })

  const pastAppointments = sortedAppointments.filter((apt) => {
    const [year, month, day] = apt.date.split("-").map(Number)
    const [hours, minutes] = apt.time.split(":").map(Number)
    const appointmentDate = new Date(year, month - 1, day, hours, minutes)
    return appointmentDate <= new Date()
  })

  const handleDeleteAppointment = async (appointmentId: number) => {
    try {
      setDeletingId(appointmentId)
      const token = localStorage.getItem("access_token")

      if (!token) {
        throw new Error("No se encontró información de autenticación")
      }

      const response = await fetch(`http://127.0.0.1:8000/appointments/${appointmentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Error al eliminar la cita")
      }

      // Actualizar la lista de citas
      setAppointments(appointments.filter((apt) => apt.id_appointment !== appointmentId))
    } catch (err) {
      console.error("Error deleting appointment:", err)
      setError(err instanceof Error ? err.message : "Error al eliminar la cita")
    } finally {
      setDeletingId(null)
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Citas Médicas</h2>
            <p className="text-muted-foreground">Gestiona tus citas médicas y programa nuevas consultas.</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Cargando tus citas y doctores...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Citas Médicas</h2>
            <p className="text-muted-foreground">Gestiona tus citas médicas y programa nuevas consultas.</p>
          </div>
        </div>
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
        <div className="text-center">
          <Button onClick={fetchData} variant="outline">
            Reintentar
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Citas Médicas</h2>
          <p className="text-muted-foreground">
            Gestiona tus citas médicas y programa nuevas consultas. ({appointments.length} citas en total)
          </p>
        </div>
        <NewAppointmentModal onAppointmentCreated={fetchData} />
      </div>

      {appointments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">No tienes citas programadas</p>
            <p className="text-sm text-gray-400 mb-4">Programa tu primera cita médica</p>
            <NewAppointmentModal onAppointmentCreated={fetchData} />
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Próximas Citas */}
          {upcomingAppointments.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Próximas Citas ({upcomingAppointments.length})</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {upcomingAppointments.map((appointment) => (
                  <Card key={appointment.id_appointment} className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">Cita #{appointment.id_appointment}</CardTitle>
                          <CardDescription className="font-medium text-blue-600">
                            Dr. {getDoctorName(appointment.id_doctor)}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(appointment.status)}>
                            {getStatusText(appointment.status)}
                          </Badge>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                disabled={deletingId === appointment.id_appointment}
                              >
                                {deletingId === appointment.id_appointment ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Se eliminará permanentemente la cita #
                                  {appointment.id_appointment}.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteAppointment(appointment.id_appointment)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">{appointment.date}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">{formatTime(appointment.time)}</span>
                      </div>
                      {appointment.description && (
                        <div className="flex items-start space-x-2 text-sm">
                          <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-gray-600 font-medium">Descripción:</p>
                            <p className="text-gray-600">{appointment.description}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Citas Pasadas */}
          {pastAppointments.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-4">Historial de Citas ({pastAppointments.length})</h3>
              <div className="grid gap-4 md:grid-cols-2">
                {pastAppointments.map((appointment) => (
                  <Card key={appointment.id_appointment} className="opacity-75 hover:opacity-100 transition-opacity">
                    <CardHeader>
                      <div className="flex justify-between items-start">
                        <div>
                          <CardTitle className="text-lg">Cita #{appointment.id_appointment}</CardTitle>
                          <CardDescription className="font-medium text-blue-600">
                            Dr. {getDoctorName(appointment.id_doctor)}
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={getStatusColor(appointment.status)}>
                            {getStatusText(appointment.status)}
                          </Badge>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                disabled={deletingId === appointment.id_appointment}
                              >
                                {deletingId === appointment.id_appointment ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Trash2 className="h-4 w-4" />
                                )}
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Esta acción no se puede deshacer. Se eliminará permanentemente la cita #
                                  {appointment.id_appointment}.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                <AlertDialogAction
                                  onClick={() => handleDeleteAppointment(appointment.id_appointment)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Eliminar
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm">
                        <Calendar className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">{appointment.date}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm">
                        <Clock className="h-4 w-4 text-gray-500" />
                        <span className="text-gray-600">{formatTime(appointment.time)}</span>
                      </div>
                      {appointment.description && (
                        <div className="flex items-start space-x-2 text-sm">
                          <FileText className="h-4 w-4 text-gray-500 mt-0.5" />
                          <div>
                            <p className="text-gray-600 font-medium">Descripción:</p>
                            <p className="text-gray-600">{appointment.description}</p>
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
