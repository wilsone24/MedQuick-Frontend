"use client"

import { useState } from "react"
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
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Plus, Loader2, AlertCircle } from "lucide-react"

interface Specialty {
  id_specialty: number
  name: string
  description: string
}

interface AddDoctorModalProps {
  specialties: Specialty[]
  onDoctorAdded: () => void
}

interface DoctorFormData {
  id_specialty: number
  full_name: string
  email: string
  phone: string
  room: string
  skills_description: string
}

export function AddDoctorModal({ specialties, onDoctorAdded }: AddDoctorModalProps) {
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<DoctorFormData>({
    id_specialty: 0,
    full_name: "",
    email: "",
    phone: "",
    room: "",
    skills_description: "",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleInputChange = (field: keyof DoctorFormData, value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      setError("El nombre completo es requerido")
      return false
    }
    if (!formData.email.trim()) {
      setError("El email es requerido")
      return false
    }
    if (!/\S+@\S+\.\S+/.test(formData.email)) {
      setError("El email no es válido")
      return false
    }
    if (!formData.phone.trim()) {
      setError("El teléfono es requerido")
      return false
    }
    if (!formData.room.trim()) {
      setError("El consultorio es requerido")
      return false
    }
    if (!formData.skills_description.trim()) {
      setError("La descripción de habilidades es requerida")
      return false
    }
    if (formData.id_specialty === 0) {
      setError("Debe seleccionar una especialidad")
      return false
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) {
      return
    }

    try {
      setLoading(true)
      setError("")

      const token = localStorage.getItem("access_token")

      const response = await fetch("http://127.0.0.1:8000/doctors", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || errorData.message || "Error al crear el doctor")
      }

      // Resetear formulario
      setFormData({
        id_specialty: 0,
        full_name: "",
        email: "",
        phone: "",
        room: "",
        skills_description: "",
      })
      setOpen(false)

      // Notificar que se creó el doctor
      onDoctorAdded()
    } catch (err) {
      console.error("Error creating doctor:", err)
      setError(err instanceof Error ? err.message : "Error al crear el doctor")
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      id_specialty: 0,
      full_name: "",
      email: "",
      phone: "",
      room: "",
      skills_description: "",
    })
    setError("")
  }

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen)
    if (!newOpen) {
      resetForm()
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Agregar Doctor
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Agregar Nuevo Doctor</DialogTitle>
          <DialogDescription>Completa la información para registrar un nuevo doctor en el sistema.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Nombre Completo *</Label>
              <Input
                id="full_name"
                type="text"
                placeholder="Dr. Juan Pérez"
                value={formData.full_name}
                onChange={(e) => handleInputChange("full_name", e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email *</Label>
              <Input
                id="email"
                type="email"
                placeholder="doctor@ejemplo.com"
                value={formData.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="phone">Teléfono *</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="room">Consultorio *</Label>
              <Input
                id="room"
                type="text"
                placeholder="101"
                value={formData.room}
                onChange={(e) => handleInputChange("room", e.target.value)}
                disabled={loading}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="specialty">Especialidad *</Label>
            <Select
              value={formData.id_specialty.toString()}
              onValueChange={(value) => handleInputChange("id_specialty", Number.parseInt(value))}
              disabled={loading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona una especialidad" />
              </SelectTrigger>
              <SelectContent>
                {specialties.map((specialty) => (
                  <SelectItem key={specialty.id_specialty} value={specialty.id_specialty.toString()}>
                    {specialty.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills_description">Descripción de Habilidades *</Label>
            <Textarea
              id="skills_description"
              placeholder="Describe las habilidades y experiencia del doctor..."
              value={formData.skills_description}
              onChange={(e) => handleInputChange("skills_description", e.target.value)}
              rows={3}
              disabled={loading}
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
          <Button
            onClick={handleSubmit}
            disabled={
              loading ||
              !formData.full_name ||
              !formData.email ||
              !formData.phone ||
              !formData.room ||
              !formData.skills_description ||
              formData.id_specialty === 0
            }
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creando...
              </>
            ) : (
              "Crear Doctor"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
