"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowLeft, User, Heart } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface RegisterData {
  user: {
    full_name: string
    email: string
    password: string
  }
  patient: {
    age: number
    phone: string
    address: string
    blood_type: string
    gender: string
  }
}

export function RegisterForm() {
  const [formData, setFormData] = useState<RegisterData>({
    user: {
      full_name: "",
      email: "",
      password: "",
    },
    patient: {
      age: 0,
      phone: "",
      address: "",
      blood_type: "",
      gender: "",
    },
  })
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleUserChange = (field: keyof RegisterData["user"], value: string) => {
    setFormData((prev) => ({
      ...prev,
      user: {
        ...prev.user,
        [field]: value,
      },
    }))
  }

  const handlePatientChange = (field: keyof RegisterData["patient"], value: string | number) => {
    setFormData((prev) => ({
      ...prev,
      patient: {
        ...prev.patient,
        [field]: value,
      },
    }))
  }

  const validateForm = () => {
    if (!formData.user.full_name.trim()) {
      setError("El nombre completo es requerido")
      return false
    }
    if (!formData.user.email.trim()) {
      setError("El email es requerido")
      return false
    }
    if (!/\S+@\S+\.\S+/.test(formData.user.email)) {
      setError("El email no es válido")
      return false
    }
    if (formData.user.password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return false
    }
    if (formData.user.password !== confirmPassword) {
      setError("Las contraseñas no coinciden")
      return false
    }
    if (formData.patient.age < 1 || formData.patient.age > 120) {
      setError("La edad debe estar entre 1 y 120 años")
      return false
    }
    if (!formData.patient.phone.trim()) {
      setError("El teléfono es requerido")
      return false
    }
    if (!formData.patient.address.trim()) {
      setError("La dirección es requerida")
      return false
    }
    if (!formData.patient.blood_type) {
      setError("El tipo de sangre es requerido")
      return false
    }
    if (!formData.patient.gender) {
      setError("El género es requerido")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      const response = await fetch("http://127.0.0.1:8000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || errorData.message || "Error al registrar usuario")
      }

      setSuccess(true)
      setTimeout(() => {
        router.push("/login")
      }, 2000)
    } catch (err) {
      console.error("Error de registro:", err)
      setError(err instanceof Error ? err.message : "Error al registrar usuario")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="w-full max-w-md">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Heart className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">¡Registro Exitoso!</h3>
              <p className="text-gray-600 mb-4">
                Tu cuenta ha sido creada correctamente. Serás redirigido al login en unos segundos.
              </p>
              <Link href="/login">
                <Button>Ir al Login</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="w-full max-w-2xl">
      <div className="mb-6">
        <Link href="/" className="inline-flex items-center text-blue-600 hover:text-blue-700">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Volver al inicio
        </Link>
      </div>

      <Card>
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">M</span>
            </div>
          </div>
          <CardTitle className="text-2xl">Crear Cuenta</CardTitle>
          <CardDescription>Únete a MedQuick y comienza a cuidar tu salud de manera inteligente</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Información del Usuario */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <User className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Información Personal</h3>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="full_name">Nombre Completo *</Label>
                  <Input
                    id="full_name"
                    type="text"
                    placeholder="Juan Pérez"
                    value={formData.user.full_name}
                    onChange={(e) => handleUserChange("full_name", e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="juan@ejemplo.com"
                    value={formData.user.email}
                    onChange={(e) => handleUserChange("email", e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">Contraseña *</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Mínimo 6 caracteres"
                    value={formData.user.password}
                    onChange={(e) => handleUserChange("password", e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm_password">Confirmar Contraseña *</Label>
                  <Input
                    id="confirm_password"
                    type="password"
                    placeholder="Repite tu contraseña"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {/* Información Médica */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <Heart className="h-5 w-5 text-blue-600" />
                <h3 className="text-lg font-semibold">Información Médica</h3>
              </div>

              <div className="grid md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="age">Edad *</Label>
                  <Input
                    id="age"
                    type="number"
                    placeholder="25"
                    min="1"
                    max="120"
                    value={formData.patient.age || ""}
                    onChange={(e) => handlePatientChange("age", Number.parseInt(e.target.value) || 0)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="gender">Género *</Label>
                  <Select
                    value={formData.patient.gender}
                    onValueChange={(value) => handlePatientChange("gender", value)}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="M">Masculino</SelectItem>
                      <SelectItem value="F">Femenino</SelectItem>
                      <SelectItem value="Otro">Otro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="blood_type">Tipo de Sangre *</Label>
                  <Select
                    value={formData.patient.blood_type}
                    onValueChange={(value) => handlePatientChange("blood_type", value)}
                    disabled={loading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="A+">A+</SelectItem>
                      <SelectItem value="A-">A-</SelectItem>
                      <SelectItem value="B+">B+</SelectItem>
                      <SelectItem value="B-">B-</SelectItem>
                      <SelectItem value="AB+">AB+</SelectItem>
                      <SelectItem value="AB-">AB-</SelectItem>
                      <SelectItem value="O+">O+</SelectItem>
                      <SelectItem value="O-">O-</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Teléfono *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={formData.patient.phone}
                    onChange={(e) => handlePatientChange("phone", e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="address">Dirección *</Label>
                  <Input
                    id="address"
                    type="text"
                    placeholder="Calle 123, Ciudad, País"
                    value={formData.patient.address}
                    onChange={(e) => handlePatientChange("address", e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Creando cuenta...
                </>
              ) : (
                "Crear Cuenta"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿Ya tienes una cuenta?{" "}
              <Link href="/login" className="text-blue-600 hover:text-blue-700 font-medium">
                Inicia sesión aquí
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Al crear una cuenta, aceptas nuestros</p>
        <p>
          <a href="#" className="text-blue-600 hover:text-blue-700">
            Términos de Servicio
          </a>
          {" y "}
          <a href="#" className="text-blue-600 hover:text-blue-700">
            Política de Privacidad
          </a>
        </p>
      </div>
    </div>
  )
}
