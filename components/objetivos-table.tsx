"use client"

import { useState, useEffect } from "react"
import { Edit, AlignVerticalJustifyCenter, ChevronDown } from "lucide-react"
import { toast } from "sonner"
import type { ObjetivoEstrategico } from "@/lib/models/types"
import { EditarFormularioObjetivo as EditObjetivoForm } from "./editar-formulario-objetivo"
import { AlinearProgramas } from "./alinear-programas"
import { AlinearPNBV } from "./alinear-pnbv"
import { VerIndicadores } from "./ver-indicadores"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Spinner } from "@/components/ui/spinner"

interface PropiedadesTablaObjetivos {
  userRucEntidad: string
}

export function TablaObjetivos({ userRucEntidad }: PropiedadesTablaObjetivos) {
  const [objetivos, setObjetivos] = useState<ObjetivoEstrategico[]>([])
  const [estaCargando, setEstaCargando] = useState(true)
  const [objetivoSeleccionado, setObjetivoSeleccionado] = useState<ObjetivoEstrategico | null>(null)
  const [mostrarAlinearProgramas, setMostrarAlinearProgramas] = useState(false)
  const [mostrarAlinearPNBV, setMostrarAlinearPNBV] = useState(false)
  const [mostrarIndicadores, setMostrarIndicadores] = useState(false)
  const [objetivoSeleccionadoParaProgramas, setObjetivoSeleccionadoParaProgramas] =
    useState<ObjetivoEstrategico | null>(null)
  const [objetivoSeleccionadoParaPNBV, setObjetivoSeleccionadoParaPNBV] = useState<ObjetivoEstrategico | null>(null)
  const [objetivoSeleccionadoParaIndicadores, setObjetivoSeleccionadoParaIndicadores] =
    useState<ObjetivoEstrategico | null>(null)

  useEffect(() => {
    cargarObjetivos()
  }, [])

  const cargarObjetivos = async () => {
    try {
      const respuesta = await fetch("/api/objetivos")
      if (!respuesta.ok) throw new Error("Error al cargar objetivos")

      const datos = await respuesta.json()
      setObjetivos(datos)
    } catch (error) {
      console.error("Error al cargar objetivos:", error)
      toast.error("Error al cargar los objetivos estratégicos")
    } finally {
      setEstaCargando(false)
    }
  }

  const manejarAlinearProgramas = (objetivo: ObjetivoEstrategico) => {
    setObjetivoSeleccionadoParaProgramas(objetivo)
    setMostrarAlinearProgramas(true)
  }

  const manejarAlinearPNBV = (objetivo: ObjetivoEstrategico) => {
    setObjetivoSeleccionadoParaPNBV(objetivo)
    setMostrarAlinearPNBV(true)
  }

  const manejarVerIndicadores = (objetivo: ObjetivoEstrategico) => {
    setObjetivoSeleccionadoParaIndicadores(objetivo)
    setMostrarIndicadores(true)
  }

  if (estaCargando) {
    return <Spinner />
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-primary">Lista de Objetivos Estratégicos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Prioridad</TableHead>
                <TableHead>Nombre OEI</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
                <TableHead className="text-center">Alineación Programa</TableHead>
                <TableHead className="text-center">Alineación PNBV</TableHead>
                <TableHead className="text-center">Indicadores</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {objetivos.map((objetivo) => (
                <TableRow key={objetivo._id}>
                  <TableCell>Prioridad {objetivo.prioridad}</TableCell>
                  <TableCell className="max-w-md truncate">{objetivo.descripcion}</TableCell>
                  <TableCell>{objetivo.tipo}</TableCell>
                  <TableCell>
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        objetivo.estado === "ELIMINADO" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                      }`}
                    >
                      {objetivo.estado}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setObjetivoSeleccionado(objetivo)}
                        disabled={objetivo.estado === "ELIMINADO"}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={objetivo.estado === "ELIMINADO"}
                      onClick={() => manejarAlinearProgramas(objetivo)}
                    >
                      <AlignVerticalJustifyCenter className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={objetivo.estado === "ELIMINADO"}
                      onClick={() => manejarAlinearPNBV(objetivo)}
                    >
                      <AlignVerticalJustifyCenter className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={objetivo.estado === "ELIMINADO"}
                      onClick={() => manejarVerIndicadores(objetivo)}
                    >
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={!!objetivoSeleccionado} onOpenChange={(open) => !open && setObjetivoSeleccionado(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto px-6 py-0">
          <DialogHeader>
            <DialogTitle className="py-6">Editar Objetivo Estratégico</DialogTitle>
          </DialogHeader>
          {objetivoSeleccionado && (
            <EditObjetivoForm
              objetivo={objetivoSeleccionado}
              onClose={() => setObjetivoSeleccionado(null)}
              onUpdate={cargarObjetivos}
            />
          )}
        </DialogContent>
      </Dialog>

      {objetivoSeleccionadoParaProgramas && (
        <AlinearProgramas
          objetivoId={objetivoSeleccionadoParaProgramas._id || ""}
          descripcionOEI={objetivoSeleccionadoParaProgramas.descripcion}
          open={mostrarAlinearProgramas}
          onOpenChange={setMostrarAlinearProgramas}
        />
      )}

      {objetivoSeleccionadoParaPNBV && (
        <AlinearPNBV
          objetivo={objetivoSeleccionadoParaPNBV}
          open={mostrarAlinearPNBV}
          onOpenChange={setMostrarAlinearPNBV}
        />
      )}

      {objetivoSeleccionadoParaIndicadores && (
        <VerIndicadores
          objetivo={objetivoSeleccionadoParaIndicadores}
          open={mostrarIndicadores}
          onOpenChange={setMostrarIndicadores}
        />
      )}
    </Card>
  )
}

export { TablaObjetivos as ObjetivosTable }

