"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import type { Programa } from "@/lib/models/types"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

interface VerProgramaAlineadoProps {
  objetivoId: string
  descripcionOEI: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VerProgramaAlineado({ objetivoId, descripcionOEI, open, onOpenChange }: VerProgramaAlineadoProps) {
  const [programasAlineados, setProgramasAlineados] = useState<Programa[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (open) {
      cargarProgramas()
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      setProgramasAlineados([])
      setIsLoading(true)
    }
  }, [open])

  const cargarProgramas = async () => {
    try {
      const respuesta = await fetch(`/api/objetivos/${objetivoId}/programas`)
      if (!respuesta.ok) throw new Error("Error al cargar programas")

      const datos = await respuesta.json()
      setProgramasAlineados(datos.programasAlineados)
    } catch (error) {
      console.error("Error loading programas:", error)
      toast.error("Error al cargar los programas")
    } finally {
      setIsLoading(false)
    }
  }

  const formatearMonto = (monto: number) => {
    return new Intl.NumberFormat("es-EC", {
      style: "currency",
      currency: "USD",
    }).format(monto)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Programa Alineado</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-2">Objetivo Estratégico Institucional:</h3>
              <p>{descripcionOEI}</p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Programa Alineado</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="text-right">Monto</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {programasAlineados.map((programa) => (
                      <TableRow key={programa._id}>
                        <TableCell>{programa.codigoMF}</TableCell>
                        <TableCell>{programa.nombre}</TableCell>
                        <TableCell>{programa.tipo}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-700">
                            {programa.estado}
                          </span>
                        </TableCell>
                        <TableCell className="text-right">{formatearMonto(programa.monto)}</TableCell>
                      </TableRow>
                    ))}
                    {programasAlineados.length === 0 && (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground">
                          No hay programas alineados
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

