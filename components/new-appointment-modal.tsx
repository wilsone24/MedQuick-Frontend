"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Clock, Plus, Loader2, AlertCircle } from "lucide-react"

interface Doctor {
  id_specialty: number
  full_name: string
  email: string
  phone: string
  room: string
  skills_description: string
  id_doctor: number
}

interface NewAppointmentModalProps {
  onAppointmentCreated: () => void
}

export function NewAppointmentModal({ onAppointmentCreated }: NewAppointmentModalProps) {
  const [open, setOpen] = useState(false)
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<string>("")
  const [selectedDate, setSelectedDate] = useState<string>("")
  const [availableHours, setAvailableHours] = useState<string[]>([])
  const [selectedTime, setSelectedTime] = useState<string>("")
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [loadingHours, setLoadingHours] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    if (open) {
      fetchDoctors()
    }
  }, [open])

  useEffect(() => {
    if (selectedDoctor && selectedDate) {
      fetchAvailableHours()
    } else {
      setAvailableHours([])
      setSelectedTime("")
    }
  }, [selectedDoctor, selectedDate])

  const fetchDoctors = async () => {
    try {
      const token = localStorage.getItem("access_token")
      const response = await fetch("http://127.0.0.1:8000/doctors", {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      if (response.ok) {
        const data = await response.json()
        setDoctors(data)
      }
    } catch (err) {
      console.error("Error fetching doctors:", err)
    }
  }

  const fetchAvailableHours = async () => {
    if (!selectedDoctor || !selectedDate) return

    try {
      setLoadingHours(true)
      const token = localStorage.getItem("access_token")

      const response = await fetch("http://127.0.0.1:8000/doctors/schedule", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_doctor: Number.parseInt(selectedDoctor),
          date: selectedDate,
        }),
      })

      if (response.ok) {
        const hours = await response.json()
        setAvailableHours(hours)
        setSelectedTime("")
      } else {
        setAvailableHours([])
        setError("Error al cargar horarios disponibles")
      }
    } catch (err) {
      console.error("Error fetching available hours:", err)
      setAvailableHours([])
      setError("Error al cargar horarios disponibles")
    } finally {
      setLoadingHours(false)
    }
  }

  const handleSubmit = async () => {
    if (!selectedDoctor || !selectedDate || !selectedTime) {
      setError("Por favor completa todos los campos requeridos")
      return
    }

    try {
      setLoading(true)
      setError("")

      const token = localStorage.getItem("access_token")
      const patientId = localStorage.getItem("id_user")

      if (!token || !patientId) {
        throw new Error("No se encontró información de autenticación")
      }

      const response = await fetch("http://127.0.0.1:8000/appointments", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          id_doctor: Number.parseInt(selectedDoctor),
          id_patient: Number.parseInt(patientId),
          date: selectedDate,
          time: selectedTime,
          description: description.trim() || "",
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || errorData.message || "Error al crear la cita")
      }

      // Resetear formulario
      setSelectedDoctor("")
      setSelectedDate("")
      setSelectedTime("")
      setDescription("")
      setAvailableHours([])
      setOpen(false)

      // Notificar que se creó la cita
      onAppointmentCreated()
    } catch (err) {
      console.error("Error creating appointment:", err)
      setError(err instanceof Error ? err.message : "Error al crear la cita")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setSelectedDoctor("")
    setSelectedDate("")
    setSelectedTime("")
    setDescription("")
    setAvailableHours([])
    setError("")
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      resetForm()
    }
  }

  // Obtener la fecha actual en formato YYYY-MM-DD
  const today = new Date().toISOString().split("T")[0]

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Cita
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Agendar Nueva Cita</DialogTitle>
          <DialogDescription>Completa la información para programar tu cita médica.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Selección de Doctor */}
          <div className="space-y-2">
            <Label htmlFor="doctor">Doctor *</Label>
            <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map((doctor) => (
                  <SelectItem key={doctor.id_doctor} value={doctor.id_doctor.toString()}>
                    Dr. {doctor.full_name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Selección de Fecha */}
          <div className="space-y-2">
            <Label htmlFor="date">Fecha *</Label>
            <Input
              id="date"
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              min={today}
              className="w-full"
            />
          </div>

          {/* Selección de Hora */}
          <div className="space-y-2">
            <Label htmlFor="time">Hora *</Label>
            {loadingHours ? (
              <div className="flex items-center justify-center p-4 border rounded-md">
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                <span className="text-sm text-gray-600">Cargando horarios...</span>
              </div>
            ) : availableHours.length > 0 ? (
              <Select value={selectedTime} onValueChange={setSelectedTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecciona una hora" />
                </SelectTrigger>
                <SelectContent>
                  {availableHours.map((hour) => (
                    <SelectItem key={hour} value={hour}>
                      <div className="flex items-center">
                        <Clock className="mr-2 h-4 w-4" />
                        {hour}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : selectedDoctor && selectedDate ? (
              <div className="p-4 border rounded-md text-center text-gray-500">
                No hay horarios disponibles para esta fecha
              </div>
            ) : (
              <div className="p-4 border rounded-md text-center text-gray-400">
                Selecciona un doctor y fecha para ver horarios disponibles
              </div>
            )}
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <Label htmlFor="description">Descripción (opcional)</Label>
            <Textarea
              id="description"
              placeholder="Describe el motivo de la consulta..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={loading || !selectedDoctor || !selectedDate || !selectedTime}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando...
              </>
            ) : (
              "Agendar Cita"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
