"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MessageSquare, Shield, Clock, Users, Star, Heart, Plus } from "lucide-react"
import Link from "next/link"

// MedQuick Logo Component
const MedQuickLogo = ({ size = "w-8 h-8" }) => (
  <img 
    src="https://i.ibb.co/5xTG1VJ7/logomedquick.png" // Replace with your actual logo image path
    alt="MedQuick Logo" 
    className={`${size} object-contain`}
  />
)

export function LandingPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // Note: In production, use proper state management instead of localStorage
    // localStorage is not available in Claude artifacts
    setIsLoggedIn(false)
  }, [])

  const handleLogout = () => {
    setIsLoggedIn(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <MedQuickLogo />
            <h1 className="text-2xl font-bold text-blue-600">MedQuick</h1>
          </div>
          <nav className="flex items-center space-x-4">
            {isLoggedIn ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">Bienvenido</span>
                <Button onClick={handleLogout} variant="outline">
                  Cerrar Sesión
                </Button>
              </div>
            ) : (
              <Link href="/login">
                <Button>Iniciar Sesión</Button>
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section with Image Banner */}
      <section className="relative py-20 px-4 overflow-hidden">
        {/* Background Image Banner */}
        <div className="absolute inset-0 z-0">
          <div className="relative w-full h-full">
            {/* Placeholder for custom image - replace src with your image URL */}
            <img 
              src="https://i.ibb.co/kV9crsZ8/banner-1.jpg"
              alt="Banner"
              className="w-full h-full object-cover"
            />
            {/* Overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-blue-900/80 via-blue-800/70 to-transparent"></div>
          </div>
        </div>

        {/* Content */}
        <div className="container mx-auto text-center relative z-10">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-5xl font-bold text-white mb-6 drop-shadow-lg">
              Tu salud, nuestra prioridad
            </h2>
            <p className="text-xl text-blue-50 mb-8 max-w-3xl mx-auto drop-shadow-md">
              Agenda citas médicas de forma rápida y sencilla. Recibe recomendaciones personalizadas de medicina
              preventiva con nuestro chatbot inteligente.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isLoggedIn ? (
                <Link href="/dashboard">
                  <Button size="lg" className="text-lg px-8 py-4 bg-white text-blue-600 hover:bg-blue-50 shadow-lg">
                    <Calendar className="mr-2 h-5 w-5" />
                    Ir al Dashboard
                  </Button>
                </Link>
              ) : (
                <Link href="/login">
                  <Button size="lg" className="text-lg px-8 py-4 bg-white text-blue-600 hover:bg-blue-50 shadow-lg">
                    Comenzar Ahora
                  </Button>
                </Link>
              )}
              <Button variant="outline" size="lg" className="text-lg px-8 py-4 bg-transparent border-white text-white hover:bg-white hover:text-blue-600 shadow-lg">
                <MessageSquare className="mr-2 h-5 w-5" />
                Hablar con Chatbot
              </Button>
            </div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-10 left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl"></div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-white">
        <div className="container mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">¿Por qué elegir MedQuick?</h3>
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <Calendar className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Citas Rápidas</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Agenda tu cita médica en menos de 2 minutos. Disponibilidad en tiempo real.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <MessageSquare className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Chatbot Inteligente</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Recibe recomendaciones personalizadas de medicina preventiva las 24 horas.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <Shield className="h-12 w-12 text-blue-600 mx-auto mb-4" />
                <CardTitle>Medicina Preventiva</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription>
                  Mantente saludable con chequeos regulares y consejos médicos preventivos.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 bg-blue-50">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-blue-600 mr-2" />
                <span className="text-4xl font-bold text-gray-900">10,000+</span>
              </div>
              <p className="text-gray-600">Pacientes Satisfechos</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-4">
                <Clock className="h-8 w-8 text-blue-600 mr-2" />
                <span className="text-4xl font-bold text-gray-900">24/7</span>
              </div>
              <p className="text-gray-600">Disponibilidad</p>
            </div>
            <div>
              <div className="flex items-center justify-center mb-4">
                <Star className="h-8 w-8 text-blue-600 mr-2" />
                <span className="text-4xl font-bold text-gray-900">4.9</span>
              </div>
              <p className="text-gray-600">Calificación Promedio</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-blue-600 text-white">
        <div className="container mx-auto text-center">
          <h3 className="text-3xl font-bold mb-6">¿Listo para cuidar tu salud?</h3>
          <p className="text-xl mb-8 opacity-90">
            Únete a miles de usuarios que ya confían en MedQuick para su bienestar.
          </p>
          {!isLoggedIn && (
            <Link href="/register">
              <Button size="lg" variant="secondary" className="text-lg px-8 py-4">
                Crear Cuenta Gratis
              </Button>
            </Link>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4">
        <div className="container mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <MedQuickLogo />
                <h4 className="text-xl font-bold">MedQuick</h4>
              </div>
              <p className="text-gray-400">Tu plataforma de confianza para el cuidado de la salud.</p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Servicios</h5>
              <ul className="space-y-2 text-gray-400">
                <li>Citas Médicas</li>
                <li>Medicina Preventiva</li>
                <li>Consulta Virtual</li>
                <li>Chatbot Médico</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Soporte</h5>
              <ul className="space-y-2 text-gray-400">
                <li>Centro de Ayuda</li>
                <li>Contacto</li>
                <li>FAQ</li>
                <li>Términos de Uso</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Contacto</h5>
              <ul className="space-y-2 text-gray-400">
                <li>info@medquick.com</li>
                <li>+1 (555) 123-4567</li>
                <li>Lun - Vie: 8AM - 6PM</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 MedQuick. Todos los derechos reservados.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}