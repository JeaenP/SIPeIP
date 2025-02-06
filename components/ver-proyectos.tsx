"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { useState, useEffect } from "react"

interface Proyecto {
  _id: string
  cup: string
  nombre: string
  monto: number
  montoSolicitado: number
  montoAsignado: number
  montoCodificado: number
}

interface VerProyectosProps {
  programaId: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VerProyectos({ programaId, open, onOpenChange }: VerProyectosProps) {
  const [proyectos, setProyectos] = useState<Proyecto[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (open) {
      loadProyectos()
    }
  }, [open]) // Removed unnecessary dependency: programaId

  const loadProyectos = async () => {
    try {
      const response = await fetch(`/api/programas/${programaId}/proyectos`)
      if (!response.ok) throw new Error("Error al cargar proyectos")

      const data = await response.json()
      setProyectos(data.proyectosAsignados || [])
    } catch (error) {
      console.error("Error loading proyectos:", error)
      toast.error("Error al cargar los proyectos")
    } finally {
      setIsLoading(false)
    }
  }

  const formatMonto = (monto: number) => {
    return new Intl.NumberFormat("es-EC", {
      style: "currency",
      currency: "USD",
    }).format(monto)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Proyectos Asignados</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>CUP</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead className="text-right">Monto Solicitado</TableHead>
                  <TableHead className="text-right">Monto Asignado</TableHead>
                  <TableHead className="text-right">Monto Codificado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proyectos.map((proyecto) => (
                  <TableRow key={proyecto._id}>
                    <TableCell>{proyecto.cup}</TableCell>
                    <TableCell>{proyecto.nombre}</TableCell>
                    <TableCell className="text-right">{formatMonto(proyecto.monto)}</TableCell>
                    <TableCell className="text-right">{formatMonto(proyecto.montoSolicitado)}</TableCell>
                    <TableCell className="text-right">{formatMonto(proyecto.montoAsignado)}</TableCell>
                    <TableCell className="text-right">{formatMonto(proyecto.montoCodificado)}</TableCell>
                  </TableRow>
                ))}
                {proyectos.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center text-muted-foreground py-6">
                      No hay proyectos asignados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

