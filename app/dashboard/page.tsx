"use client"

import { CardDescription } from "@/components/ui/card"

import { CardContent } from "@/components/ui/card"

import { CardTitle } from "@/components/ui/card"

import { CardHeader } from "@/components/ui/card"

import { Card } from "@/components/ui/card"

import { Calendar, MessageSquare, UserCheck } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const services = [
    {
      title: "Citas Médicas",
      description: "Agenda y gestiona tus citas médicas de forma rápida y sencilla",
      icon: Calendar,
      href: "/dashboard/citas",
      color: "bg-blue-500",
    },
    {
      title: "Doctores",
      description: "Explora nuestro directorio de profesionales médicos especializados",
      icon: UserCheck,
      href: "/dashboard/doctores",
      color: "bg-green-500",
    },
    {
      title: "Chatbot Médico",
      description: "Obtén recomendaciones de medicina preventiva las 24 horas",
      icon: MessageSquare,
      href: "/dashboard/chatbot",
      color: "bg-purple-500",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Bienvenido a MedQuick</h2>
        <p className="text-muted-foreground">Accede a todos nuestros servicios de salud desde aquí.</p>
      </div>

      {/* Servicios Principales */}
      <div className="grid gap-6 md:grid-cols-2">
        {services.map((service) => (
          <Link key={service.title} href={service.href}>
            <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div
                    className={`p-3 rounded-lg ${service.color} text-white group-hover:scale-110 transition-transform`}
                  >
                    <service.icon className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="group-hover:text-blue-600 transition-colors">{service.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base">{service.description}</CardDescription>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
