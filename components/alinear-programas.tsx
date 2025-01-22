"use client"

import { useState, useEffect } from "react"
import { Plus, Minus } from 'lucide-react'
import { toast } from "sonner"
import type { Programa } from "@/lib/models/types"

// Importaciones de componentes UI
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

// Definición de la interfaz para las propiedades del componente
interface PropiedadesAlinearProgramas {
  objetivoId: string
  descripcionOEI: string
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AlinearProgramas({ 
  objetivoId, 
  descripcionOEI,
  open, 
  onOpenChange 
}: PropiedadesAlinearProgramas) {
  // Estados del componente
  const [programasAlineados, setProgramasAlineados] = useState<Programa[]>([])
  const [programasDisponibles, setProgramasDisponibles] = useState<Programa[]>([])
  const [estaCargando, setEstaCargando] = useState(true)

  // Efecto para cargar programas cuando se abre el diálogo
  useEffect(() => {
    if (open) {
      cargarProgramas()
    }
  }, [open, objetivoId])

  // Efecto para limpiar datos cuando se cierra el diálogo
  useEffect(() => {
    if (!open) {
      setProgramasAlineados([])
      setProgramasDisponibles([])
      setEstaCargando(true)
    }
  }, [open])

  // Función para cargar los programas
  const cargarProgramas = async () => {
    try {
      const respuesta = await fetch(`/api/objetivos/${objetivoId}/programas`)
      if (!respuesta.ok) throw new Error('Error al cargar programas')
      
      const datos = await respuesta.json()
      console.log(datos)
      setProgramasAlineados(datos.programasAlineados)
      setProgramasDisponibles(datos.programasDisponibles)
    } catch (error) {
      console.error('Error al cargar programas:', error)
      toast.error('Error al cargar los programas')
    } finally {
      setEstaCargando(false)
    }
  }

  // Función para alinear un programa
  const manejarAlinear = async (programaId: string) => {
    try {
      const respuesta = await fetch(`/api/objetivos/${objetivoId}/programas`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ programaId }),
      })

      if (!respuesta.ok) throw new Error('Error al alinear programa')
      
      toast.success('Programa alineado exitosamente')
      await cargarProgramas()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al alinear el programa')
    }
  }

  // Función para desalinear un programa
  const manejarDesalinear = async (programaId: string) => {
    try {
      const respuesta = await fetch(`/api/objetivos/${objetivoId}/programas/${programaId}`, {
        method: 'DELETE',
      })

      if (!respuesta.ok) throw new Error('Error al desalinear programa')
      
      toast.success('Programa desalineado exitosamente')
      await cargarProgramas()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al desalinear el programa')
    }
  }

  // Función para formatear montos en formato de moneda
  const formatearMonto = (monto: number) => {
    return new Intl.NumberFormat('es-EC', {
      style: 'currency',
      currency: 'USD'
    }).format(monto)
  }

  // Renderizado del componente
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Alinear Programas</DialogTitle>
        </DialogHeader>
        
        {estaCargando ? (
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <div className="space-y-4">
            {/* Sección de Objetivo Estratégico Institucional */}
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-2">Objetivo Estratégico Institucional:</h3>
              <p>{descripcionOEI}</p>
            </div>

            {/* Sección de Programas Alineados */}
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
                              onClick={() => programa._id && manejarDesalinear(programa._id)}
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

            {/* Sección de Programas Disponibles */}
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
                              onClick={() => programa._id && manejarAlinear(programa._id)}
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
  )
}

