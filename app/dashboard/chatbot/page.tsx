"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, Send, Stethoscope, AlertCircle, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ScrollArea } from "@/components/ui/scroll-area"

// Lista de síntomas comunes
const SINTOMAS_COMUNES = [
  { id: "dolor_cabeza", label: "Dolor de cabeza" },
  { id: "fiebre", label: "Fiebre" },
  { id: "tos", label: "Tos" },
  { id: "dolor_garganta", label: "Dolor de garganta" },
  { id: "congestion", label: "Congestión nasal" },
  { id: "dificultad_respirar", label: "Dificultad para respirar" },
  { id: "fatiga", label: "Fatiga o cansancio" },
  { id: "dolor_muscular", label: "Dolor muscular" },
  { id: "nauseas", label: "Náuseas o vómitos" },
  { id: "diarrea", label: "Diarrea" },
  { id: "perdida_gusto", label: "Pérdida del gusto o del olfato" },
  { id: "dolor_abdominal", label: "Dolor abdominal" },
  { id: "mareos", label: "Mareos o vértigo" },
  { id: "erupciones", label: "Erupciones cutáneas" },
]

// Duración de síntomas
const DURACION_SINTOMAS = [
  { id: "menos_24h", label: "Menos de 24 horas" },
  { id: "1_3_dias", label: "1-3 días" },
  { id: "4_7_dias", label: "4-7 días" },
  { id: "1_2_semanas", label: "1-2 semanas" },
  { id: "mas_2_semanas", label: "Más de 2 semanas" },
]

interface Mensaje {
  tipo: "usuario" | "sistema"
  contenido: string
  timestamp: Date
}

// Función para procesar texto con formato de negritas y cursiva
const procesarTextoConNegritas = (texto: string) => {
  // Primero procesar negritas **texto** y luego cursiva *texto*
  // Usar una expresión regular que capture ambos patrones
  const partes = texto.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g)

  return partes.map((parte, index) => {
    if (parte.startsWith("**") && parte.endsWith("**")) {
      // Remover los asteriscos dobles y aplicar negrita
      const textoNegrita = parte.slice(2, -2)
      return <strong key={index}>{textoNegrita}</strong>
    } else if (parte.startsWith("*") && parte.endsWith("*") && !parte.startsWith("**")) {
      // Remover los asteriscos simples y aplicar cursiva
      const textoCursiva = parte.slice(1, -1)
      return <em key={index}>{textoCursiva}</em>
    }
    return parte
  })
}

export default function ChatbotPage() {
  // Estado para la pestaña activa
  const [activeTab, setActiveTab] = useState("sintomas")

  // Estados para el chatbot de síntomas
  const [sintomasSeleccionados, setSintomasSeleccionados] = useState<string[]>([])
  const [duracionSintomas, setDuracionSintomas] = useState("")
  const [comentariosAdicionales, setComentariosAdicionales] = useState("")
  const [respuestaSintomas, setRespuestaSintomas] = useState("")
  const [loadingSintomas, setLoadingSintomas] = useState(false)
  const [errorSintomas, setErrorSintomas] = useState("")

  // Estados para el chatbot de historial
  const [mensajes, setMensajes] = useState<Mensaje[]>([
    {
      tipo: "sistema",
      contenido: "¡Hola! Soy tu asistente médico virtual. Puedes preguntarme sobre tu historial médico.",
      timestamp: new Date(),
    },
  ])
  const [preguntaActual, setPreguntaActual] = useState("")
  const [loadingHistorial, setLoadingHistorial] = useState(false)
  const [errorHistorial, setErrorHistorial] = useState("")

  // Ref para el scroll automático del chat
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Efecto para hacer scroll al final del chat cuando hay nuevos mensajes
  useEffect(() => {
    if (chatEndRef.current) {
      chatEndRef.current.scrollIntoView({ behavior: "smooth" })
    }
  }, [mensajes])

  // Manejar cambios en los síntomas seleccionados
  const handleSintomaChange = (checked: boolean, id: string) => {
    if (checked) {
      setSintomasSeleccionados([...sintomasSeleccionados, id])
    } else {
      setSintomasSeleccionados(sintomasSeleccionados.filter((item) => item !== id))
    }
  }

  // Enviar consulta de síntomas
  const enviarConsultaSintomas = async () => {
    if (sintomasSeleccionados.length === 0 || !duracionSintomas) {
      setErrorSintomas("Por favor, selecciona al menos un síntoma y la duración")
      return
    }

    try {
      setLoadingSintomas(true)
      setErrorSintomas("")

      const userId = localStorage.getItem("id_user") || "usuario_desconocido"
      const fechaActual = new Date().toISOString().split("T")[0]

      // Construir el string de síntomas
      const sintomasTexto = sintomasSeleccionados
        .map((id) => SINTOMAS_COMUNES.find((s) => s.id === id)?.label)
        .join(", ")

      const duracionTexto = DURACION_SINTOMAS.find((d) => d.id === duracionSintomas)?.label || ""

      const sintomasCompleto = `Síntomas: ${sintomasTexto}. Duración: ${duracionTexto}. ${comentariosAdicionales ? `Comentarios adicionales: ${comentariosAdicionales}` : ""}`

      const response = await fetch("http://127.0.0.1:8000/chatbot/guardar-y-recomendar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario: userId,
          sintomas: sintomasCompleto,
          fecha: fechaActual,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al procesar la consulta")
      }

      const data = await response.text()

      // Procesar la respuesta para extraer solo la recomendación
      let recomendacionLimpia = data
      try {
        const jsonResponse = JSON.parse(data)
        if (jsonResponse.recomendacion) {
          recomendacionLimpia = jsonResponse.recomendacion
        }
      } catch (error) {
        // Si no es JSON válido, usar la respuesta completa
        console.log("Respuesta no es JSON válido, usando texto completo")
      }

      setRespuestaSintomas(recomendacionLimpia)
    } catch (error) {
      console.error("Error en la consulta de síntomas:", error)
      setErrorSintomas(error instanceof Error ? error.message : "Error al procesar la consulta")
    } finally {
      setLoadingSintomas(false)
    }
  }

  // Enviar pregunta al chatbot de historial
  const enviarPreguntaHistorial = async () => {
    if (!preguntaActual.trim()) return

    const nuevaPregunta = preguntaActual.trim()
    setPreguntaActual("")

    // Agregar la pregunta del usuario al chat
    setMensajes([
      ...mensajes,
      {
        tipo: "usuario",
        contenido: nuevaPregunta,
        timestamp: new Date(),
      },
    ])

    try {
      setLoadingHistorial(true)
      setErrorHistorial("")

      const userId = localStorage.getItem("id_user") || "usuario_desconocido"

      const response = await fetch("http://127.0.0.1:8000/chatbot/preguntar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          usuario: userId,
          pregunta: nuevaPregunta,
        }),
      })

      if (!response.ok) {
        throw new Error("Error al procesar la pregunta")
      }

      const respuestaCompleta = await response.text()

      // Extraer solo la respuesta del modelo del JSON
      let respuestaLimpia = respuestaCompleta
      try {
        const jsonResponse = JSON.parse(respuestaCompleta)
        if (jsonResponse.respuesta) {
          respuestaLimpia = jsonResponse.respuesta
        }
      } catch (error) {
        // Si no es JSON válido, usar la respuesta completa
        console.log("Respuesta no es JSON válido, usando texto completo")
      }

      // Agregar la respuesta del sistema al chat
      setMensajes((prev) => [
        ...prev,
        {
          tipo: "sistema",
          contenido: respuestaLimpia,
          timestamp: new Date(),
        },
      ])
    } catch (error) {
      console.error("Error en la consulta al historial:", error)
      setErrorHistorial(error instanceof Error ? error.message : "Error al procesar la pregunta")

      // Agregar mensaje de error al chat
      setMensajes((prev) => [
        ...prev,
        {
          tipo: "sistema",
          contenido: "Lo siento, ha ocurrido un error al procesar tu pregunta. Por favor, intenta nuevamente.",
          timestamp: new Date(),
        },
      ])
    } finally {
      setLoadingHistorial(false)
    }
  }

  // Manejar envío con Enter en el chat
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      enviarPreguntaHistorial()
    }
  }

  // Reiniciar formulario de síntomas
  const reiniciarFormularioSintomas = () => {
    setSintomasSeleccionados([])
    setDuracionSintomas("")
    setComentariosAdicionales("")
    setRespuestaSintomas("")
    setErrorSintomas("")
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Chatbot Médico</h2>
        <p className="text-muted-foreground">
          Obtén recomendaciones de medicina preventiva y respuestas a tus consultas.
        </p>
      </div>

      <Tabs defaultValue="sintomas" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="sintomas" className="flex items-center">
            <Stethoscope className="mr-2 h-4 w-4" />
            Consulta de Síntomas
          </TabsTrigger>
          <TabsTrigger value="historial" className="flex items-center">
            <MessageSquare className="mr-2 h-4 w-4" />
            Historial Médico
          </TabsTrigger>
        </TabsList>

        {/* Pestaña de Consulta de Síntomas */}
        <TabsContent value="sintomas">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center">
                <Stethoscope className="mr-2 h-5 w-5" />
                Consulta de Síntomas
              </CardTitle>
              <CardDescription>Selecciona tus síntomas y recibe recomendaciones personalizadas</CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden">
              {!respuestaSintomas ? (
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-6">
                    {/* Selección de síntomas */}
                    <div className="space-y-3">
                      <h3 className="font-medium text-sm">Selecciona tus síntomas:</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {SINTOMAS_COMUNES.map((sintoma) => (
                          <div key={sintoma.id} className="flex items-center space-x-2">
                            <Checkbox
                              id={sintoma.id}
                              checked={sintomasSeleccionados.includes(sintoma.id)}
                              onCheckedChange={(checked) => handleSintomaChange(checked as boolean, sintoma.id)}
                            />
                            <Label htmlFor={sintoma.id}>{sintoma.label}</Label>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Duración de los síntomas */}
                    <div className="space-y-3">
                      <h3 className="font-medium text-sm">¿Cuánto tiempo llevas con estos síntomas?</h3>
                      <RadioGroup value={duracionSintomas} onValueChange={setDuracionSintomas}>
                        {DURACION_SINTOMAS.map((duracion) => (
                          <div key={duracion.id} className="flex items-center space-x-2">
                            <RadioGroupItem value={duracion.id} id={duracion.id} />
                            <Label htmlFor={duracion.id}>{duracion.label}</Label>
                          </div>
                        ))}
                      </RadioGroup>
                    </div>

                    {/* Comentarios adicionales */}
                    <div className="space-y-3">
                      <h3 className="font-medium text-sm">Comentarios adicionales (opcional):</h3>
                      <Textarea
                        placeholder="Describe cualquier otro detalle relevante sobre tus síntomas..."
                        value={comentariosAdicionales}
                        onChange={(e) => setComentariosAdicionales(e.target.value)}
                        rows={3}
                      />
                    </div>

                    {errorSintomas && (
                      <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{errorSintomas}</AlertDescription>
                      </Alert>
                    )}
                  </div>
                </ScrollArea>
              ) : (
                <ScrollArea className="flex-1 pr-4">
                  <div className="space-y-4">
                    <div className="p-4 bg-blue-50 rounded-lg">
                      <h3 className="font-medium mb-2">Síntomas reportados:</h3>
                      <ul className="list-disc pl-5 space-y-1 text-sm">
                        {sintomasSeleccionados.map((id) => (
                          <li key={id}>{SINTOMAS_COMUNES.find((s) => s.id === id)?.label}</li>
                        ))}
                      </ul>
                      <p className="mt-2 text-sm">
                        <strong>Duración:</strong> {DURACION_SINTOMAS.find((d) => d.id === duracionSintomas)?.label}
                      </p>
                      {comentariosAdicionales && (
                        <div className="mt-2 text-sm">
                          <strong>Comentarios adicionales:</strong>
                          <p className="mt-1">{comentariosAdicionales}</p>
                        </div>
                      )}
                    </div>

                    <div className="p-4 bg-green-50 rounded-lg">
                      <h3 className="font-medium mb-2 flex items-center">
                        <Stethoscope className="mr-2 h-4 w-4" />
                        Recomendación médica:
                      </h3>
                      <div className="whitespace-pre-line">{procesarTextoConNegritas(respuestaSintomas)}</div>
                    </div>

                    <div className="text-xs text-gray-500 italic">
                      Esta recomendación es generada automáticamente y no reemplaza la consulta con un profesional
                      médico.
                    </div>
                  </div>
                </ScrollArea>
              )}

              <div className="mt-4 pt-4 border-t">
                {!respuestaSintomas ? (
                  <Button
                    onClick={enviarConsultaSintomas}
                    className="w-full"
                    disabled={loadingSintomas || sintomasSeleccionados.length === 0 || !duracionSintomas}
                  >
                    {loadingSintomas ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Procesando...
                      </>
                    ) : (
                      "Enviar consulta"
                    )}
                  </Button>
                ) : (
                  <Button onClick={reiniciarFormularioSintomas} className="w-full">
                    Nueva consulta
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pestaña de Historial Médico */}
        <TabsContent value="historial">
          <Card className="h-[600px] flex flex-col">
            <CardHeader>
              <CardTitle className="flex items-center">
                <MessageSquare className="mr-2 h-5 w-5" />
                Consulta de Historial Médico
              </CardTitle>
              <CardDescription>
                Haz preguntas sobre tu historial médico y recibe respuestas personalizadas
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 flex flex-col overflow-hidden">
              <div className="flex-1 overflow-hidden">
                <ScrollArea className="h-full pr-4">
                  <div className="space-y-4 p-1">
                    {mensajes.map((mensaje, index) => (
                      <div
                        key={index}
                        className={`flex ${mensaje.tipo === "usuario" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 break-words word-wrap ${
                            mensaje.tipo === "usuario" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-800"
                          }`}
                          style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
                        >
                          <p className="whitespace-pre-line">{procesarTextoConNegritas(mensaje.contenido)}</p>
                          <p
                            className={`text-xs mt-1 ${mensaje.tipo === "usuario" ? "text-blue-100" : "text-gray-500"}`}
                          >
                            {mensaje.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>
                      </div>
                    ))}
                    {loadingHistorial && (
                      <div className="flex justify-start">
                        <div className="bg-gray-100 rounded-lg p-3 flex items-center space-x-2">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>Escribiendo...</span>
                        </div>
                      </div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                </ScrollArea>
              </div>

              {errorHistorial && (
                <Alert variant="destructive" className="mt-4">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{errorHistorial}</AlertDescription>
                </Alert>
              )}

              <div className="flex space-x-2 mt-4 pt-4 border-t">
                <Input
                  placeholder="Escribe tu pregunta sobre tu historial médico..."
                  value={preguntaActual}
                  onChange={(e) => setPreguntaActual(e.target.value)}
                  onKeyDown={handleKeyPress}
                  disabled={loadingHistorial}
                  className="flex-1"
                />
                <Button onClick={enviarPreguntaHistorial} disabled={!preguntaActual.trim() || loadingHistorial}>
                  <Send className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
