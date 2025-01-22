"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import type { ObjetivoEstrategico, Programa, PNBVAlineacion, PNBV, ObjetivoPNBV, Proyecto } from "@/lib/models/types"

// Importaciones de componentes UI
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

// Interfaces y tipos
interface PropiedadesAlinearPNBV {
  objetivo: ObjetivoEstrategico
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Esquema de validación del formulario
const esquemaFormulario = z.object({
  objetivoId: z.string().min(1, "El objetivo es requerido"),
  objetivo: z.string().min(1, "El objetivo es requerido"),
  politica: z.string().min(1, "La política es requerida"),
  metaPrincipal: z.string().min(1, "La meta principal es requerida"),
  programaNacional: z.string().min(1, "El programa nacional es requerido"),
})

// Interfaz extendida para programas con sus proyectos
interface ProgramaConProyectos extends Programa {
  proyectosData?: Proyecto[];
}

export function AlinearPNBV({ objetivo, open, onOpenChange }: PropiedadesAlinearPNBV) {
  // Estados del componente
  const [estaCargando, setEstaCargando] = useState(true)
  const [programasAlineados, setProgramasAlineados] = useState<ProgramaConProyectos[]>([])
  const [objetivoSeleccionado, setObjetivoSeleccionado] = useState<ObjetivoPNBV | null>(null)
  const [datosPNBV, setDatosPNBV] = useState<PNBV | null>(null)
  const [programasExpandidos, setProgramasExpandidos] = useState<Set<string>>(new Set())

  // Configuración del formulario
  const formulario = useForm<z.infer<typeof esquemaFormulario>>({
    resolver: zodResolver(esquemaFormulario),
    defaultValues: {
      objetivoId: "",
      objetivo: "",
      politica: "",
      metaPrincipal: "",
      programaNacional: "",
    },
  })

  // Efectos para cargar datos cuando se abre el diálogo
  useEffect(() => {
    if (open) {
      cargarDatos()
    }
  }, [open, objetivo._id])

  // Efecto para limpiar datos cuando se cierra el diálogo
  useEffect(() => {
    if (!open) {
      setEstaCargando(true)
      setProgramasAlineados([])
      setObjetivoSeleccionado(null)
      formulario.reset()
    }
  }, [open, formulario])

  // Función para cargar los proyectos de un programa
  const cargarProyectosPrograma = async (programa: Programa) => {
    if (!programa.proyectos?.length) return [];
    
    try {
      const promesasProyectos = programa.proyectos.map(async (proyectoId) => {
        const respuesta = await fetch(`/api/proyectos/${proyectoId}`);
        if (!respuesta.ok) throw new Error('Error al cargar proyecto');
        return respuesta.json();
      });

      return await Promise.all(promesasProyectos);
    } catch (error) {
      console.error('Error al cargar proyectos:', error);
      toast.error('Error al cargar los proyectos');
      return [];
    }
  };

  // Manejador para expandir/contraer programas
  const manejarExpandirPrograma = async (programaId: string) => {
    const nuevosExpandidos = new Set(programasExpandidos);
    
    if (!programasExpandidos.has(programaId)) {
      // Cargar proyectos al expandir
      const programa = programasAlineados.find(p => p._id === programaId);
      if (programa && !programa.proyectosData) {
        const proyectos = await cargarProyectosPrograma(programa);
        setProgramasAlineados(prev => 
          prev.map(p => 
            p._id === programaId 
              ? { ...p, proyectosData: proyectos }
              : p
          )
        );
      }
      nuevosExpandidos.add(programaId);
    } else {
      nuevosExpandidos.delete(programaId);
    }
    
    setProgramasExpandidos(nuevosExpandidos);
  }

  // Función principal para cargar todos los datos necesarios
  const cargarDatos = async () => {
    try {
      // Cargar datos del PNBV
      const respuestaPNBV = await fetch('/api/pnbv')
      if (!respuestaPNBV.ok) throw new Error('Error al cargar PNBV')
      const pnbvs = await respuestaPNBV.json()
      
      if (pnbvs && pnbvs.length > 0) {
        setDatosPNBV(pnbvs[0]) // Usar el primer PNBV
        
        // Si es tipo Fortalecimiento Institucional, seleccionar automáticamente Objetivo 7
        if (objetivo.tipo === "Fortalecimiento Institucional") {
          const obj7 = pnbvs[0].objetivos.find((obj: ObjetivoPNBV) => obj.numero === 7)
          if (obj7) {
            setObjetivoSeleccionado(obj7)
            formulario.setValue("objetivoId", "7")
            formulario.setValue("objetivo", obj7.nombre)
          }
        }
      }

      // Cargar programas alineados
      const respuestaProgramas = await fetch(`/api/objetivos/${objetivo._id}/programas`)
      if (!respuestaProgramas.ok) throw new Error('Error al cargar programas')
      const datosProgramas = await respuestaProgramas.json()
      setProgramasAlineados(datosProgramas.programasAlineados || [])

      // Cargar alineación PNBV existente
      const respuestaAlineacionPNBV = await fetch(`/api/objetivos/${objetivo._id}/pnbv`)
      if (respuestaAlineacionPNBV.ok) {
        const datosAlineacionPNBV = await respuestaAlineacionPNBV.json()
        if (datosAlineacionPNBV) {
          formulario.reset(datosAlineacionPNBV)
          if (pnbvs && pnbvs.length > 0) {
            const objetivoEncontrado = pnbvs[0].objetivos.find(
              (obj: ObjetivoPNBV) => obj.numero.toString() === datosAlineacionPNBV.objetivoId
            )
            if (objetivoEncontrado) {
              setObjetivoSeleccionado(objetivoEncontrado)
            }
          }
        }
      }
    } catch (error) {
      console.error('Error al cargar datos:', error)
      toast.error('Error al cargar los datos')
    } finally {
      setEstaCargando(false)
    }
  }

  // Manejador para cambio de objetivo
  const manejarCambioObjetivo = (valor: string) => {
    if (!datosPNBV) return

    const objetivo = datosPNBV.objetivos.find(obj => obj.numero.toString() === valor)
    if (!objetivo) return

    setObjetivoSeleccionado(objetivo)
    formulario.setValue("objetivoId", valor)
    formulario.setValue("objetivo", objetivo.nombre)
    formulario.setValue("politica", "")
    formulario.setValue("metaPrincipal", "")
  }

  // Manejador para envío del formulario
  const manejarEnvio = async (valores: z.infer<typeof esquemaFormulario>) => {
    try {
      const respuesta = await fetch(`/api/objetivos/${objetivo._id}/pnbv`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(valores),
      })

      if (!respuesta.ok) throw new Error('Error al guardar alineación')
      
      toast.success('Alineación PNBV guardada exitosamente')
      onOpenChange(false)
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al guardar la alineación')
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
          <DialogTitle>Alineación Plan Nacional</DialogTitle>
        </DialogHeader>
        
        {estaCargando ? (
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <div className="space-y-6">
            {/* Sección de Programas Alineados */}
            <Card>
              <CardHeader>
                <CardTitle>Información Alineación Programas</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Objetivo Estratégico Institucional:</h3>
                    <p className="text-sm">{objetivo.descripcion}</p>
                  </div>

                  <div>
                    <h3 className="font-medium mb-2">Programas Alineados:</h3>
                    {programasAlineados.length > 0 ? (
                      <Accordion
                        type="single"
                        collapsible
                        className="w-full"
                        onValueChange={(value) => {
                          if (value) manejarExpandirPrograma(value);
                        }}
                      >
                        {programasAlineados.map((programa) => (
                          <AccordionItem key={programa._id} value={programa._id || ''}>
                            <AccordionTrigger className="text-sm">
                              {programa.nombre}
                            </AccordionTrigger>
                            <AccordionContent>
                              <div className="space-y-4">
                                {/* Información del programa */}
                                <div className="space-y-2 p-4 bg-muted rounded-md">
                                  <p><span className="font-medium">Código:</span> {programa.codigoMF}</p>
                                  <p><span className="font-medium">Tipo:</span> {programa.tipo}</p>
                                  <p><span className="font-medium">Descripción:</span> {programa.descripcion}</p>
                                  <p><span className="font-medium">Monto:</span> {formatearMonto(programa.monto)}</p>
                                </div>

                                {/* Tabla de proyectos */}
                                <div className="pt-4">
                                  <h4 className="font-medium mb-2">Proyectos Asignados:</h4>
                                  {programa.proyectosData ? (
                                    programa.proyectosData.length > 0 ? (
                                      <Table>
                                        <TableHeader>
                                          <TableRow>
                                            <TableHead>CUP</TableHead>
                                            <TableHead>Nombre</TableHead>
                                            <TableHead className="text-right">Monto</TableHead>
                                          </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                          {programa.proyectosData.map((proyecto) => (
                                            <TableRow key={proyecto._id}>
                                              <TableCell>{proyecto.cup}</TableCell>
                                              <TableCell>{proyecto.nombre}</TableCell>
                                              <TableCell className="text-right">
                                                {formatearMonto(proyecto.monto)}
                                              </TableCell>
                                            </TableRow>
                                          ))}
                                        </TableBody>
                                      </Table>
                                    ) : (
                                      <p className="text-sm text-muted-foreground">No hay proyectos asignados</p>
                                    )
                                  ) : (
                                    <div className="flex justify-center py-4">
                                      <Spinner />
                                    </div>
                                  )}
                                </div>
                              </div>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                      </Accordion>
                    ) : (
                      <p className="text-sm text-muted-foreground">No hay programas alineados</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Sección de Plan Nacional */}
            <Card>
              <CardHeader>
                <CardTitle>Información Plan Nacional</CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...formulario}>
                  <form onSubmit={formulario.handleSubmit(manejarEnvio)} className="space-y-4">
                    {/* Campo de Objetivo Plan Nacional */}
                    <FormField
                      control={formulario.control}
                      name="objetivoId"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Objetivo Plan Nacional</FormLabel>
                          <Select
                            onValueChange={manejarCambioObjetivo}
                            defaultValue={field.value}
                            disabled={objetivo.tipo === "Fortalecimiento Institucional"}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione un objetivo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {datosPNBV?.objetivos.map((obj) => (
                                <SelectItem 
                                  key={obj.numero} 
                                  value={obj.numero.toString()}
                                >
                                  {`Objetivo ${obj.numero}: ${obj.nombre}`}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {objetivoSeleccionado && (
                      <>
                        {/* Campo de Política Nacional */}
                        <FormField
                          control={formulario.control}
                          name="politica"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Política Nacional</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccione una política" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {objetivoSeleccionado.politicas?.map((politica, index) => (
                                    <SelectItem 
                                      key={index} 
                                      value={index.toString()}
                                    >
                                      {politica}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Campo de Meta Principal */}
                        <FormField
                          control={formulario.control}
                          name="metaPrincipal"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Meta Principal</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccione una meta" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {objetivoSeleccionado.metas?.map((meta, index) => (
                                    <SelectItem 
                                      key={index} 
                                      value={index.toString()}
                                    >
                                      {meta}
                                    </SelectItem>
                                  ))}
                                  <SelectItem value="sin-meta">Sin meta principal</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        {/* Campo de Programa Nacional */}
                        <FormField
                          control={formulario.control}
                          name="programaNacional"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Programa Nacional</FormLabel>
                              <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Seleccione un programa" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  {datosPNBV?.objetivos.flatMap((obj, index) => (
                                    <SelectItem 
                                      key={index} 
                                      value={`PSN-${index + 1}`}
                                    >
                                      {`PSN - ${index + 1}: ${obj.nombre.substring(0, 50)}...`}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </>
                    )}

                    {/* Botones de acción */}
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit">
                        Guardar
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

