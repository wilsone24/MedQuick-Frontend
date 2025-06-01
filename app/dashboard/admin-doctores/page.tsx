"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { UserCheck, Search, Phone, MapPin, Stethoscope, Loader2, Trash2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AddDoctorModal } from "@/components/add-doctor-modal"
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

interface Doctor {
  id_specialty: number
  full_name: string
  email: string
  phone: string
  room: string
  skills_description: string
  id_doctor: number
}

interface Specialty {
  id_specialty: number
  name: string
  description: string
}

export default function AdminDoctoresPage() {
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [specialties, setSpecialties] = useState<Specialty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [searchTerm, setSearchTerm] = useState("")
  const [deletingId, setDeletingId] = useState<number | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("access_token")

      // Fetch doctores y especialidades en paralelo
      const [doctorsResponse, specialtiesResponse] = await Promise.all([
        fetch("http://127.0.0.1:8000/doctors", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
        fetch("http://127.0.0.1:8000/specialties", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }),
      ])

      if (!doctorsResponse.ok) {
        throw new Error("Error al cargar los doctores")
      }

      if (!specialtiesResponse.ok) {
        throw new Error("Error al cargar las especialidades")
      }

      const doctorsData = await doctorsResponse.json()
      const specialtiesData = await specialtiesResponse.json()

      setDoctors(doctorsData)
      setSpecialties(specialtiesData)
    } catch (err) {
      console.error("Error fetching data:", err)
      setError(err instanceof Error ? err.message : "Error al cargar la información")
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteDoctor = async (doctorId: number) => {
    try {
      setDeletingId(doctorId)
      const token = localStorage.getItem("access_token")

      const response = await fetch(`http://127.0.0.1:8000/doctors/${doctorId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (!response.ok) {
        throw new Error("Error al eliminar el doctor")
      }

      // Actualizar la lista de doctores
      setDoctors(doctors.filter((doctor) => doctor.id_doctor !== doctorId))
    } catch (err) {
      console.error("Error deleting doctor:", err)
      setError(err instanceof Error ? err.message : "Error al eliminar el doctor")
    } finally {
      setDeletingId(null)
    }
  }

  const getSpecialtyName = (specialtyId: number) => {
    const specialty = specialties.find((s) => s.id_specialty === specialtyId)
    return specialty ? specialty.name : "Especialidad no encontrada"
  }

  const getInitials = (fullName: string) => {
    return fullName
      .split(" ")
      .map((name) => name.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const getRandomColor = (id: number) => {
    const colors = [
      "bg-blue-500",
      "bg-green-500",
      "bg-purple-500",
      "bg-orange-500",
      "bg-pink-500",
      "bg-indigo-500",
      "bg-teal-500",
      "bg-red-500",
    ]
    return colors[id % colors.length]
  }

  const filteredDoctors = doctors.filter(
    (doctor) =>
      doctor.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.skills_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      getSpecialtyName(doctor.id_specialty).toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Administrar Doctores</h2>
            <p className="text-muted-foreground">Gestiona el directorio de profesionales médicos.</p>
          </div>
        </div>
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Cargando doctores y especialidades...</p>
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
            <h2 className="text-3xl font-bold tracking-tight">Administrar Doctores</h2>
            <p className="text-muted-foreground">Gestiona el directorio de profesionales médicos.</p>
          </div>
        </div>
        <Alert variant="destructive">
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
          <h2 className="text-3xl font-bold tracking-tight">Administrar Doctores</h2>
          <p className="text-muted-foreground">
            Gestiona el directorio de profesionales médicos. ({doctors.length} doctores registrados)
          </p>
        </div>
        <AddDoctorModal specialties={specialties} onDoctorAdded={fetchData} />
      </div>

      <div className="flex items-center space-x-2">
        <Input
          placeholder="Buscar doctores o especialidades..."
          className="w-64"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <Button variant="outline">
          <Search className="h-4 w-4" />
        </Button>
      </div>

      {filteredDoctors.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <UserCheck className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-500">
              {searchTerm ? "No se encontraron doctores con ese criterio" : "No hay doctores registrados"}
            </p>
            {searchTerm && (
              <Button variant="outline" onClick={() => setSearchTerm("")} className="mt-4">
                Limpiar búsqueda
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredDoctors.map((doctor) => (
            <Card key={doctor.id_doctor} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-lg ${getRandomColor(
                        doctor.id_doctor,
                      )}`}
                    >
                      {getInitials(doctor.full_name)}
                    </div>
                    <div className="flex-1">
                      <CardTitle className="text-lg">{doctor.full_name}</CardTitle>
                      <CardDescription className="font-medium text-blue-600">
                        {getSpecialtyName(doctor.id_specialty)}
                      </CardDescription>
                    </div>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        disabled={deletingId === doctor.id_doctor}
                      >
                        {deletingId === doctor.id_doctor ? (
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
                          Esta acción no se puede deshacer. Se eliminará permanentemente al Dr. {doctor.full_name} del
                          sistema.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDeleteDoctor(doctor.id_doctor)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Eliminar
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-2 text-sm">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">{doctor.phone}</span>
                  </div>
                  <div className="flex items-center space-x-2 text-sm">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-gray-600">Consultorio {doctor.room}</span>
                  </div>
                  <div className="flex items-start space-x-2 text-sm">
                    <Stethoscope className="h-4 w-4 text-gray-500 mt-0.5" />
                    <div>
                      <p className="text-gray-600 font-medium">Habilidades:</p>
                      <p className="text-gray-600">{doctor.skills_description}</p>
                    </div>
                  </div>
                  <div className="text-sm">
                    <p className="text-gray-600 font-medium">Email:</p>
                    <p className="text-gray-600">{doctor.email}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
