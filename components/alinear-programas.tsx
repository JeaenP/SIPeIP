"use client"

import { useState, useEffect } from "react"
import { Plus, Minus } from "lucide-react"
import { toast } from "sonner"
import type { Programa } from "@/lib/models/types"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

interface PropiedadesAlinearProgramas {
  objetivoId: string
  descripcionOEI: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AlinearProgramas({ objetivoId, descripcionOEI, open, onOpenChange }: PropiedadesAlinearProgramas) {
  const [programasAlineados, setProgramasAlineados] = useState<Programa[]>([])
  const [programasDisponibles, setProgramasDisponibles] = useState<Programa[]>([])
  const [estaCargando, setEstaCargando] = useState(true)
  const [showConfirmDialog, setShowConfirmDialog] = useState(false)
  const [programaToAlign, setProgramaToAlign] = useState<string | null>(null)
  const [programaToUnalign, setProgramaToUnalign] = useState<string | null>(null)

  useEffect(() => {
    if (open) {
      cargarProgramas()
    }
  }, [open]) // Removed unnecessary dependency: objetivoId

  useEffect(() => {
    if (!open) {
      setProgramasAlineados([])
      setProgramasDisponibles([])
      setEstaCargando(true)
    }
  }, [open])

  const cargarProgramas = async () => {
    try {
      const respuesta = await fetch(`/api/objetivos/${objetivoId}/programas`)
      if (!respuesta.ok) throw new Error("Error al cargar programas")

      const datos = await respuesta.json()
      setProgramasAlineados(datos.programasAlineados)
      setProgramasDisponibles(datos.programasDisponibles)
    } catch (error) {
      console.error("Error loading programas:", error)
      toast.error("Error al cargar los programas")
    } finally {
      setEstaCargando(false)
    }
  }

  const handleAlinearPrograma = async (programaId: string) => {
    // If there's already an aligned program, show confirmation dialog
    if (programasAlineados.length > 0) {
      setProgramaToAlign(programaId)
      setProgramaToUnalign(programasAlineados[0]._id)
      setShowConfirmDialog(true)
      return
    }

    // If no program is aligned, proceed with alignment
    await alinearPrograma(programaId)
  }

  const handleConfirmRealignment = async () => {
    if (programaToAlign && programaToUnalign) {
      // First desalinear the current program
      await desalinearPrograma(programaToUnalign)
      // Then alinear the new program
      await alinearPrograma(programaToAlign)
    }
    setShowConfirmDialog(false)
    setProgramaToAlign(null)
    setProgramaToUnalign(null)
  }

  const alinearPrograma = async (programaId: string) => {
    try {
      const respuesta = await fetch(`/api/objetivos/${objetivoId}/programas`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ programaId }),
      })

      if (!respuesta.ok) throw new Error("Error al alinear programa")

      toast.success("Programa alineado exitosamente")
      await cargarProgramas()
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al alinear el programa")
    }
  }

  const desalinearPrograma = async (programaId: string) => {
    try {
      const respuesta = await fetch(`/api/objetivos/${objetivoId}/programas/${programaId}`, {
        method: "DELETE",
      })

      if (!respuesta.ok) throw new Error("Error al desalinear programa")

      toast.success("Programa desalineado exitosamente")
      await cargarProgramas()
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al desalinear el programa")
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Alinear Programas</DialogTitle>
          </DialogHeader>

          {estaCargando ? (
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
                  <CardTitle>Programas Alineados</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No.</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Código</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Estado</TableHead>
                        <TableHead className="text-center">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {programasAlineados.map((programa, indice) => (
                        <TableRow key={programa._id}>
                          <TableCell>{indice + 1}</TableCell>
                          <TableCell>{programa.nombre}</TableCell>
                          <TableCell>{programa.codigoMF}</TableCell>
                          <TableCell>{programa.tipo}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-700">
                              {programa.estado}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex justify-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => programa._id && desalinearPrograma(programa._id)}
                              >
                                <Minus className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {programasAlineados.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center text-muted-foreground">
                            No hay programas alineados
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Programas Disponibles</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No.</TableHead>
                        <TableHead>Nombre</TableHead>
                        <TableHead>Código</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead className="text-center">Acciones</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {programasDisponibles.map((programa, indice) => (
                        <TableRow key={programa._id}>
                          <TableCell>{indice + 1}</TableCell>
                          <TableCell>{programa.nombre}</TableCell>
                          <TableCell>{programa.codigoMF}</TableCell>
                          <TableCell>{programa.tipo}</TableCell>
                          <TableCell>
                            <div className="flex justify-center">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => programa._id && handleAlinearPrograma(programa._id)}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {programasDisponibles.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="text-center text-muted-foreground">
                            No hay programas disponibles
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

      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar cambio de alineación</AlertDialogTitle>
            <AlertDialogDescription>
              El objetivo estratégico ya está alineado a un programa. Los objetivos estratégicos solo se pueden alinear
              a un solo programa. ¿Desea alinear el programa y eliminar el programa anterior?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmRealignment}>Aceptar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}

