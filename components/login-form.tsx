"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, ArrowLeft } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface LoginResponse {
  access_token: string
  token_type: string
  id_user: number
}

export function LoginForm() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")

    try {
      // Intentar primero con form-data (formato más común para login)
      const formData = new FormData()
      formData.append("username", username)
      formData.append("password", password)

      let response = await fetch("http://127.0.0.1:8000/login", {
        method: "POST",
        body: formData,
      })

      // Si falla con form-data, intentar con JSON
      if (!response.ok && response.status === 422) {
        response = await fetch("http://127.0.0.1:8000/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            password,
          }),
        })
      }

      // Si aún falla, intentar con application/x-www-form-urlencoded
      if (!response.ok && response.status === 422) {
        const params = new URLSearchParams()
        params.append("username", username)
        params.append("password", password)

        response = await fetch("http://127.0.0.1:8000/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: params,
        })
      }

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.detail || errorData.message || "Credenciales incorrectas")
      }

      const data: LoginResponse = await response.json()

      // Guardar en localStorage
      localStorage.setItem("access_token", data.access_token)
      localStorage.setItem("token_type", data.token_type)
      localStorage.setItem("id_user", data.id_user.toString())

      // Redirigir según el tipo de usuario
      if (data.id_user === 6) {
        // Admin: redirigir al dashboard analytics
        router.push("/dashboard/analytics")
      } else {
        // Usuario regular: redirigir al inicio
        router.push("/dashboard")
      }
    } catch (err) {
      console.error("Error de login:", err)
      setError(err instanceof Error ? err.message : "Error al iniciar sesión")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md">
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
          <CardTitle className="text-2xl">Iniciar Sesión</CardTitle>
          <CardDescription>
            Ingresa a tu cuenta de MedQuick para agendar citas y recibir recomendaciones médicas
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <Input
                id="username"
                type="text"
                placeholder="Ingresa tu usuario"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="Ingresa tu contraseña"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
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
                  Iniciando sesión...
                </>
              ) : (
                "Iniciar Sesión"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              ¿No tienes una cuenta?{" "}
              <Link href="/register" className="text-blue-600 hover:text-blue-700 font-medium">
                Regístrate aquí
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="mt-6 text-center text-sm text-gray-500">
        <p>Al iniciar sesión, aceptas nuestros</p>
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
