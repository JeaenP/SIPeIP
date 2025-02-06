"use client"

import { useState, useEffect } from "react"
import { Edit, Search } from "lucide-react"
import { toast } from "sonner"
import type { Programa } from "@/lib/models/types"
import { Spinner } from "@/components/ui/spinner"

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { EditProgramaForm } from "./edit-programa-form"
import { VerProyectos } from "./ver-proyectos"

interface ProgramasTableProps {
  userRucEntidad: string
}

export function ProgramasTable({ userRucEntidad }: ProgramasTableProps) {
  const [programas, setProgramas] = useState<Programa[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedPrograma, setSelectedPrograma] = useState<Programa | null>(null)
  const [selectedProgramData, setSelectedProgramData] = useState<Programa | null>(null)
  const [showProyectos, setShowProyectos] = useState(false)
  const [selectedProgramaId, setSelectedProgramaId] = useState<string | null>(null)

  useEffect(() => {
    loadProgramas()
  }, []) // Removed userRucEntidad from dependencies

  const loadProgramas = async () => {
    try {
      const response = await fetch(`/api/programas?rucEntidad=${userRucEntidad}`)
      if (!response.ok) throw new Error("Error al cargar programas")

      const data = await response.json()
      setProgramas(data)
    } catch (error) {
      console.error("Error loading programas:", error)
      toast.error("Error al cargar los programas")
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("¿Está seguro de eliminar este programa?")) return

    try {
      const response = await fetch(`/api/programas?id=${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Error al eliminar programa")

      toast.success("Programa eliminado exitosamente")
      loadProgramas()
    } catch (error) {
      console.error("Error deleting programa:", error)
      toast.error("Error al eliminar el programa")
    }
  }

  const handleEdit = async (programa: Programa) => {
    try {
      const response = await fetch(`/api/programas/${programa._id}`)
      if (!response.ok) throw new Error("Error al cargar programa")
      const updatedPrograma = await response.json()
      setSelectedProgramData(updatedPrograma)
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al cargar el programa")
      setSelectedProgramData(programa) // Fallback to passed data if fetch fails
    }
  }

  const handleVerProyectos = (programaId: string) => {
    setSelectedProgramaId(programaId)
    setShowProyectos(true)
  }

  const formatMonto = (monto: number) => {
    return new Intl.NumberFormat("es-EC", {
      style: "currency",
      currency: "USD",
    }).format(monto)
  }

  if (isLoading) {
    return <Spinner />
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-primary">Lista de Programas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>No.</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead className="text-right">Monto ($)</TableHead>
                <TableHead className="text-center">Proyectos</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {programas.map((programa) => (
                <TableRow key={programa._id}>
                  <TableCell>{programa.numero}</TableCell>
                  <TableCell>{programa.nombre}</TableCell>
                  <TableCell>{programa.estado}</TableCell>
                  <TableCell className="max-w-md truncate">{programa.descripcion}</TableCell>
                  <TableCell>{programa.tipo}</TableCell>
                  <TableCell className="text-right">{formatMonto(programa.monto)}</TableCell>
                  <TableCell className="text-center">
                    <Button variant="ghost" size="sm" onClick={() => programa._id && handleVerProyectos(programa._id)}>
                      <Search className="h-4 w-4" />
                    </Button>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-center gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEdit(programa)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={!!selectedProgramData} onOpenChange={(open) => !open && setSelectedProgramData(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Programa</DialogTitle>
          </DialogHeader>
          {selectedProgramData && (
            <EditProgramaForm
              programa={selectedProgramData}
              onClose={() => setSelectedProgramData(null)}
              onUpdate={() => {
                loadProgramas()
                setSelectedProgramData(null)
              }}
            />
          )}
        </DialogContent>
      </Dialog>
      {selectedProgramaId && (
        <VerProyectos programaId={selectedProgramaId} open={showProyectos} onOpenChange={setShowProyectos} />
      )}
    </Card>
  )
}

