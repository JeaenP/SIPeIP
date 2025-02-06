"use client"

import { useState, useEffect } from "react"
import { ChevronLeft, Search, Info } from "lucide-react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import type { ObjetivoEstrategico } from "@/lib/models/types"
import { toast } from "sonner"
import { Spinner } from "@/components/ui/spinner"

interface VerIndicadoresMetasProps {
  objetivo: ObjetivoEstrategico
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface PresupuestoDialogProps {
  programa: any
  open: boolean
  onClose: () => void
}

interface CoEjecucionDialogProps {
  proyecto: any
  open: boolean
  onClose: () => void
}

const metaSchema = z.object({
  año: z.string(),
  primerSemestre: z.number().min(0, "El valor debe ser mayor o igual a 0"),
  segundoSemestre: z.number().min(0, "El valor debe ser mayor o igual a 0"),
})

function PresupuestoDialog({ programa, open, onClose }: PresupuestoDialogProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [proyectos, setProyectos] = useState<any[]>([])

  useEffect(() => {
    if (open && programa._id) {
      loadProyectos()
    }
  }, [open, programa._id])

  const loadProyectos = async () => {
    try {
      const response = await fetch(`/api/programas/${programa._id}/proyectos`)
      if (!response.ok) throw new Error("Error al cargar proyectos")
      const data = await response.json()
      setProyectos(data.proyectosAsignados || [])
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al cargar los proyectos")
    } finally {
      setIsLoading(false)
    }
  }

  if (!open) return null

  const totalPresupuesto = proyectos.reduce((acc, proyecto) => acc + proyecto.montoCodificado, 0)

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Presupuesto del Programa</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Programa:</h3>
            <p className="text-sm mt-1">{programa.nombre}</p>
            <p className="text-sm text-muted-foreground mt-1">Código: {programa.codigoMF}</p>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-4">
              <Spinner />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No.</TableHead>
                  <TableHead>Proyecto</TableHead>
                  <TableHead className="text-right">Monto Codificado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proyectos.map((proyecto, index) => (
                  <TableRow key={proyecto._id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{proyecto.nombre}</TableCell>
                    <TableCell className="text-right">
                      {new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" }).format(
                        proyecto.montoCodificado,
                      )}
                    </TableCell>
                  </TableRow>
                ))}
                {proyectos.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground py-4">
                      No hay proyectos asignados a este programa
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}

          <div className="flex justify-between items-center pt-4 border-t">
            <span className="font-medium">Total Presupuesto:</span>
            <span className="font-medium">
              {new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" }).format(totalPresupuesto)}
            </span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function CoEjecucionDialog({ proyecto, open, onClose }: CoEjecucionDialogProps) {
  const [coejecutores, setCoejecutores] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (open && proyecto._id) {
      loadCoejecutores()
    }
  }, [open, proyecto._id])

  const loadCoejecutores = async () => {
    try {
      const response = await fetch(`/api/proyectos/${proyecto._id}/coejecutores`)
      if (!response.ok) throw new Error("Error al cargar coejecutores")
      const data = await response.json()
      setCoejecutores(data)
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al cargar la información de co-ejecución")
    } finally {
      setIsLoading(false)
    }
  }

  if (!open) return null

  return (
    <Dialog open={open} onOpenChange={() => onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Información de Co-ejecución</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">Nombre del Proyecto:</h3>
            <p className="text-sm mt-1">{proyecto.nombre}</p>
          </div>

          <div>
            <h3 className="font-medium mb-2">Entidades:</h3>
            {isLoading ? (
              <div className="flex justify-center py-4">
                <Spinner />
              </div>
            ) : (
              <div className="space-y-2">
                {coejecutores.map((entidad) => (
                  <div key={entidad.rucEntidad} className="p-4 bg-muted rounded-lg">
                    <p className="font-medium">{entidad.razonSocial}</p>
                    <p className="text-sm text-muted-foreground">RUC: {entidad.rucEntidad}</p>
                  </div>
                ))}
                {coejecutores.length === 0 && (
                  <p className="text-sm text-muted-foreground">No hay entidades co-ejecutoras registradas</p>
                )}
              </div>
            )}
          </div>

          <div className="pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="font-medium">Valor Codificado:</span>
              <span className="font-medium">
                {new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" }).format(
                  proyecto.montoCodificado,
                )}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function VerIndicadoresMetas({ objetivo, open, onOpenChange }: VerIndicadoresMetasProps) {
  const [showListView, setShowListView] = useState(true)
  const [selectedIndicador, setSelectedIndicador] = useState(objetivo.indicadores?.[0])
  const currentYear = new Date().getFullYear().toString()
  const [isLoadingProgramas, setIsLoadingProgramas] = useState(false)
  const [isLoadingProyectos, setIsLoadingProyectos] = useState(false)
  const [isLoadingGastoCorriente, setIsLoadingGastoCorriente] = useState(false)
  const [gastoCorrienteAsignado, setGastoCorrienteAsignado] = useState(0)
  const [gastoCorrienteCodificado, setGastoCorrienteCodificado] = useState(0)
  const [programasAlineados, setProgramasAlineados] = useState<any[]>([])
  const [proyectosPrograma, setProyectosPrograma] = useState<any[]>([])
  const [showPresupuesto, setShowPresupuesto] = useState(false)
  const [showCoEjecucion, setShowCoEjecucion] = useState(false)
  const [selectedPrograma, setSelectedPrograma] = useState<any>(null)
  const [selectedProyecto, setSelectedProyecto] = useState<any>(null)

  const form = useForm<z.infer<typeof metaSchema>>({
    resolver: zodResolver(metaSchema),
    defaultValues: {
      año: currentYear,
      primerSemestre: 0,
      segundoSemestre: 0,
    },
  })

  useEffect(() => {
    if (selectedIndicador?.metas?.length) {
      const primerSemestre = selectedIndicador.metas.find((m) => m.periodo.includes("Semestre 1"))?.valor || 0
      const segundoSemestre = selectedIndicador.metas.find((m) => m.periodo.includes("Semestre 2"))?.valor || 0

      form.reset({
        año: currentYear,
        primerSemestre,
        segundoSemestre,
      })
    }
  }, [selectedIndicador, form, currentYear])

  useEffect(() => {
    if (open && objetivo._id) {
      loadProgramasAlineados()
      loadGastoCorriente()
    }
  }, [open, objetivo._id])

  const loadProgramasAlineados = async () => {
    try {
      setIsLoadingProgramas(true)
      const response = await fetch(`/api/objetivos/${objetivo._id}/programas`)
      if (!response.ok) throw new Error("Error al cargar programas")

      const data = await response.json()
      setProgramasAlineados(data.programasAlineados || [])

      if (data.programasAlineados?.length > 0) {
        await loadProyectosPrograma(data.programasAlineados[0]._id)
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al cargar los programas alineados")
    } finally {
      setIsLoadingProgramas(false)
    }
  }

  const loadProyectosPrograma = async (programaId: string) => {
    try {
      setIsLoadingProyectos(true)
      const response = await fetch(`/api/programas/${programaId}/proyectos`)
      if (!response.ok) throw new Error("Error al cargar proyectos")

      const data = await response.json()
      setProyectosPrograma(data.proyectosAsignados || [])
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al cargar los proyectos del programa")
    } finally {
      setIsLoadingProyectos(false)
    }
  }

  const loadGastoCorriente = async () => {
    try {
      setIsLoadingGastoCorriente(true)
      const response = await fetch(`/api/entidades/gasto-corriente`)
      if (!response.ok) throw new Error("Error al cargar datos de gasto corriente")
      const data = await response.json()
      setGastoCorrienteAsignado(data.gastoCorrienteAsignado)
      setGastoCorrienteCodificado(data.gastoCorrienteCodificado)
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al cargar datos de gasto corriente")
    } finally {
      setIsLoadingGastoCorriente(false)
    }
  }

  const formatMonto = (monto: number) => {
    return new Intl.NumberFormat("es-EC", {
      style: "currency",
      currency: "USD",
    }).format(monto)
  }

  const onSubmit = async (values: z.infer<typeof metaSchema>) => {
    try {
      const response = await fetch(`/api/objetivos/${objetivo._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          indicadorIndex: objetivo.indicadores?.indexOf(selectedIndicador),
          metas: {
            año: values.año,
            primerSemestre: values.primerSemestre,
            segundoSemestre: values.segundoSemestre,
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Error al guardar las metas")
      }

      toast.success("Las metas han sido guardadas correctamente")
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al guardar las metas")
    }
  }

  const handleIndicadorClick = (indicador: any) => {
    setSelectedIndicador(indicador)
    setShowListView(false)
  }

  const handleVerPresupuesto = (programa: any) => {
    setSelectedPrograma(programa)
    setShowPresupuesto(true)
  }

  const handleVerCoEjecucion = (proyecto: any) => {
    setSelectedProyecto(proyecto)
    setShowCoEjecucion(true)
  }

  if (showListView) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-3xl">
          <DialogHeader>
            <DialogTitle>Lista de Indicadores</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-2">Objetivo Estratégico:</h3>
              <p className="text-sm">{objetivo.descripcion}</p>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>No.</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Unidad de Medida</TableHead>
                  <TableHead>Línea Base</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {objetivo.indicadores?.map((indicador, index) => (
                  <TableRow key={index}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{indicador.nombre}</TableCell>
                    <TableCell>{indicador.unidad_medida}</TableCell>
                    <TableCell>{indicador.linea_base}</TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="sm" onClick={() => handleIndicadorClick(indicador)}>
                        <Search className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="sm" onClick={() => setShowListView(true)}>
                <ChevronLeft className="h-4 w-4 mr-2" />
                Volver a la lista
              </Button>
              <DialogTitle>Gestión de Metas del Indicador</DialogTitle>
            </div>
          </DialogHeader>

          <Accordion type="single" collapsible className="w-full space-y-4">
            {/* Programación Anual Section */}
            <AccordionItem value="programacion-anual">
              <AccordionTrigger className="bg-primary text-primary-foreground hover:no-underline px-4 rounded-lg">
                Programación Anual
              </AccordionTrigger>
              <AccordionContent className="p-4 border rounded-lg mt-2">
                <div className="space-y-4">
                  <h3 className="font-medium">Lista de Programas</h3>
                  {isLoadingProgramas ? (
                    <div className="flex justify-center py-4">
                      <Spinner />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>No.</TableHead>
                          <TableHead>Código</TableHead>
                          <TableHead>Nombre</TableHead>
                          <TableHead className="text-right">Monto</TableHead>
                          <TableHead className="text-center">Ver Presupuesto</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {programasAlineados.map((programa, index) => (
                          <TableRow key={programa._id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{programa.codigoMF}</TableCell>
                            <TableCell>{programa.nombre}</TableCell>
                            <TableCell className="text-right">
                              {new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" }).format(
                                programa.monto,
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <Button variant="ghost" size="sm" onClick={() => handleVerPresupuesto(programa)}>
                                <Search className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {programasAlineados.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                              No hay programas alineados a este objetivo
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}

                  <h3 className="font-medium mt-6">Lista de Proyectos del Programa</h3>
                  {isLoadingProyectos ? (
                    <div className="flex justify-center py-4">
                      <Spinner />
                    </div>
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>No.</TableHead>
                          <TableHead>CUP</TableHead>
                          <TableHead>Nombre del Proyecto</TableHead>
                          <TableHead className="text-right">Monto Codificado ($)</TableHead>
                          <TableHead className="text-center">Co-ejecución</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {proyectosPrograma.map((proyecto, index) => (
                          <TableRow key={proyecto._id}>
                            <TableCell>{index + 1}</TableCell>
                            <TableCell>{proyecto.cup}</TableCell>
                            <TableCell>{proyecto.nombre}</TableCell>
                            <TableCell className="text-right">
                              {new Intl.NumberFormat("es-EC", { style: "currency", currency: "USD" }).format(
                                proyecto.montoCodificado,
                              )}
                            </TableCell>
                            <TableCell className="text-center">
                              <Button variant="ghost" size="sm" onClick={() => handleVerCoEjecucion(proyecto)}>
                                <Info className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {proyectosPrograma.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center text-muted-foreground py-4">
                              No hay proyectos asignados a este programa
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>

            {/* Gasto Corriente Section */}
            <AccordionItem value="gasto-corriente">
              <AccordionTrigger className="bg-primary text-primary-foreground hover:no-underline px-4 rounded-lg">
                Gasto Corriente Institucional
              </AccordionTrigger>
              <AccordionContent className="p-4 border rounded-lg mt-2">
                {isLoadingGastoCorriente ? (
                  <div className="flex justify-center py-4">
                    <Spinner />
                  </div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>No.</TableHead>
                        <TableHead>Nombre del Proyecto</TableHead>
                        <TableHead className="text-right">Monto asignado ($)</TableHead>
                        <TableHead className="text-right">Monto codificado ($)</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell>1</TableCell>
                        <TableCell>Gasto Corriente (5)</TableCell>
                        <TableCell className="text-right">{formatMonto(gastoCorrienteAsignado)}</TableCell>
                        <TableCell className="text-right">{formatMonto(gastoCorrienteCodificado)}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                )}
              </AccordionContent>
            </AccordionItem>

            {/* Ficha del Indicador y Metas Section */}
            <AccordionItem value="ficha-metas">
              <AccordionTrigger className="bg-primary text-primary-foreground hover:no-underline px-4 rounded-lg">
                Ficha del Indicador y Registrar Metas
              </AccordionTrigger>
              <AccordionContent className="p-4 border rounded-lg mt-2">
                <div className="space-y-6">
                  {/* Ficha del Indicador */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-medium mb-2">Nombre:</h4>
                      <p className="text-sm">{selectedIndicador?.nombre}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Fórmula:</h4>
                      <p className="text-sm">{selectedIndicador?.formula}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Descripción:</h4>
                      <p className="text-sm">{selectedIndicador?.descripcion}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Unidad de Medida:</h4>
                      <p className="text-sm">{selectedIndicador?.unidad_medida}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Línea Base:</h4>
                      <p className="text-sm">{selectedIndicador?.linea_base}</p>
                    </div>
                    <div>
                      <h4 className="font-medium mb-2">Periodicidad:</h4>
                      <p className="text-sm">{selectedIndicador?.periodicidad}</p>
                    </div>
                  </div>

                  {/* Registrar Metas */}
                  <div className="border-t pt-6">
                    <h3 className="font-medium mb-4">Registrar Metas</h3>
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="año"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Año</FormLabel>
                                <FormControl>
                                  <Input {...field} disabled value={currentYear} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="primerSemestre"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{`${currentYear} (Semestre 1)`}</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    {...field}
                                    onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="segundoSemestre"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>{`${currentYear} (Semestre 2)`}</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    {...field}
                                    onChange={(e) => field.onChange(Number.parseFloat(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>

                        <div className="flex justify-end">
                          <Button type="submit">Guardar Metas</Button>
                        </div>
                      </form>
                    </Form>
                  </div>
                </div>
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </DialogContent>
      </Dialog>

      {selectedPrograma && (
        <PresupuestoDialog
          programa={selectedPrograma}
          open={showPresupuesto}
          onClose={() => {
            setShowPresupuesto(false)
            setSelectedPrograma(null)
          }}
        />
      )}

      {selectedProyecto && (
        <CoEjecucionDialog
          proyecto={selectedProyecto}
          open={showCoEjecucion}
          onClose={() => {
            setShowCoEjecucion(false)
            setSelectedProyecto(null)
          }}
        />
      )}
    </>
  )
}

