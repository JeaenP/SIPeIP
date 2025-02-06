"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { toast } from "sonner"
import type { ObjetivoEstrategico } from "@/lib/models/types"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

// Import existing components for viewing details
import { VerIndicadores } from "./ver-indicadores"
import { VerProgramaAlineado } from "./ver-programa-alineado"
import { VerAlineacionPNBV } from "./ver-alineacion-pnbv"
import { VerObjetivo } from "./ver-objetivo"
import { GenerarReporte } from "./generar-reporte"

interface ConsultarAlineacionesTableProps {
  userRucEntidad: string
}

export function ConsultarAlineacionesTable({ userRucEntidad }: ConsultarAlineacionesTableProps) {
  const [objetivos, setObjetivos] = useState<ObjetivoEstrategico[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedObjetivo, setSelectedObjetivo] = useState<ObjetivoEstrategico | null>(null)
  const [showIndicadores, setShowIndicadores] = useState(false)
  const [showProgramas, setShowProgramas] = useState(false)
  const [showPNBV, setShowPNBV] = useState(false)
  const [showDetalles, setShowDetalles] = useState(false)

  useEffect(() => {
    loadObjetivos()
  }, [])

  const loadObjetivos = async () => {
    try {
      const response = await fetch(`/api/objetivos?rucEntidad=${userRucEntidad}`)
      if (!response.ok) throw new Error("Error al cargar objetivos")

      const data = await response.json()
      setObjetivos(data)
    } catch (error) {
      console.error("Error loading objetivos:", error)
      toast.error("Error al cargar los objetivos estratégicos")
    } finally {
      setIsLoading(false)
    }
  }

  const handleVerIndicadores = (objetivo: ObjetivoEstrategico) => {
    setSelectedObjetivo(objetivo)
    setShowIndicadores(true)
  }

  const handleVerProgramas = (objetivo: ObjetivoEstrategico) => {
    setSelectedObjetivo(objetivo)
    setShowProgramas(true)
  }

  const handleVerPNBV = (objetivo: ObjetivoEstrategico) => {
    setSelectedObjetivo(objetivo)
    setShowPNBV(true)
  }

  const handleVerDetalles = (objetivo: ObjetivoEstrategico) => {
    setSelectedObjetivo(objetivo)
    setShowDetalles(true)
  }

  if (isLoading) {
    return <Spinner />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary">Consulta de Alineaciones</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No.</TableHead>
                <TableHead>Nombre OEI</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-center">Indicadores</TableHead>
                <TableHead className="text-center">Alineación Programa</TableHead>
                <TableHead className="text-center">Alineación PNBV</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {objetivos.map((objetivo, index) => (
                <TableRow key={objetivo._id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell className="max-w-md truncate">{objetivo.descripcion}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        objetivo.estado === "ELIMINADO" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                      }`}
                    >
                      {objetivo.estado}
                    </span>
                  </TableCell>
                  <TableCell>{objetivo.tipo}</TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="sm" onClick={() => handleVerIndicadores(objetivo)}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="sm" onClick={() => handleVerProgramas(objetivo)}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="sm" onClick={() => handleVerPNBV(objetivo)}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleVerDetalles(objetivo)}>
                        <Search className="h-4 w-4" />
                      </Button>
                      {objetivo._id && <GenerarReporte objetivoId={objetivo._id} />}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {objetivos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-6">
                    No se encontraron objetivos estratégicos
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {/* Dialogs for viewing details */}
      {selectedObjetivo && (
        <>
          <VerIndicadores objetivo={selectedObjetivo} open={showIndicadores} onOpenChange={setShowIndicadores} />

          <VerProgramaAlineado
            objetivoId={selectedObjetivo._id || ""}
            descripcionOEI={selectedObjetivo.descripcion}
            open={showProgramas}
            onOpenChange={setShowProgramas}
          />

          <VerAlineacionPNBV objetivo={selectedObjetivo} open={showPNBV} onOpenChange={setShowPNBV} />

          <VerObjetivo objetivo={selectedObjetivo} open={showDetalles} onOpenChange={setShowDetalles} />
        </>
      )}
    </Card>
  )
}

