"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { toast } from "sonner"
import type { ObjetivoEstrategico } from "@/lib/models/types"
import { VerIndicadoresMetas } from "./ver-indicadores-metas"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

interface MetasSemestralesTableProps {
  userRucEntidad: string
}

export function MetasSemestralesTable({ userRucEntidad }: MetasSemestralesTableProps) {
  const [objetivos, setObjetivos] = useState<ObjetivoEstrategico[]>([])
  const [estaCargando, setEstaCargando] = useState(true)
  const [objetivoSeleccionado, setObjetivoSeleccionado] = useState<ObjetivoEstrategico | null>(null)
  const [mostrarIndicadores, setMostrarIndicadores] = useState(false)

  useEffect(() => {
    cargarObjetivos()
  }, []) // Removed unnecessary dependency: userRucEntidad

  const cargarObjetivos = async () => {
    try {
      const respuesta = await fetch(`/api/objetivos/razon-ser?rucEntidad=${userRucEntidad}`)
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

  const manejarVerIndicadores = (objetivo: ObjetivoEstrategico) => {
    setObjetivoSeleccionado(objetivo)
    setMostrarIndicadores(true)
  }

  if (estaCargando) {
    return <Spinner />
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-primary">Registro de Metas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No.</TableHead>
                <TableHead>Nombre OEI</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead className="text-center">Indicadores (Paso 1)</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {objetivos.map((objetivo, index) => (
                <TableRow key={objetivo._id}>
                  <TableCell>{index + 1}</TableCell>
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
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => manejarVerIndicadores(objetivo)}
                      disabled={objetivo.estado === "ELIMINADO"}
                    >
                      <Search className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {objetivos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-6">
                    No se encontraron objetivos de razón de ser
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      {objetivoSeleccionado && (
        <VerIndicadoresMetas
          objetivo={objetivoSeleccionado}
          open={mostrarIndicadores}
          onOpenChange={setMostrarIndicadores}
        />
      )}
    </Card>
  )
}

