"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { Plus, Trash2, Save, Edit } from 'lucide-react'
import type { ObjetivoEstrategico, Estrategia, Indicador } from "@/lib/models/types"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const estrategiaSchema = z.object({
  descripcion: z.string().min(1, "La descripción es requerida"),
})

const indicadorSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  descripcion: z.string().min(1, "La descripción es requerida"),
  unidad_medida: z.string().min(1, "La unidad de medida es requerida"),
  patron: z.string().min(1, "El patrón es requerido"),
  linea_base: z.number().min(0, "La línea base debe ser mayor o igual a 0"),
  fecha_linea_base: z.string().min(1, "La fecha de línea base es requerida"),
  meta_total: z.number().min(0, "La meta total debe ser mayor o igual a 0"),
  fuente_informacion: z.string().min(1, "La fuente de información es requerida"),
  periodicidad: z.enum(["ANUAL", "SEMESTRAL", "TRIMESTRAL", "MENSUAL"]),
  metas: z.array(z.object({
    periodo: z.string().min(1, "El periodo es requerido"),
    valor: z.number().min(0, "El valor debe ser mayor o igual a 0"),
  })),
})

const formSchema = z.object({
  descripcion: z.string().min(1, "La descripción es requerida"),
  tipo: z.string().min(1, "El tipo es requerido"),
  prioridad: z.string().min(1, "La prioridad es requerida"),
})

interface EditObjetivoFormProps {
  objetivo: ObjetivoEstrategico
  onClose: () => void
  onUpdate: () => void
}

export function EditObjetivoForm({ objetivo, onClose, onUpdate }: EditObjetivoFormProps) {
  const [estrategias, setEstrategias] = useState<Estrategia[]>(objetivo.estrategias || [])
  const [indicadores, setIndicadores] = useState<Indicador[]>(objetivo.indicadores || [])
  const [newEstrategia, setNewEstrategia] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingIndicadorIndex, setEditingIndicadorIndex] = useState<number | null>(null);
  const [editingEstrategiaIndex, setEditingEstrategiaIndex] = useState<number | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      descripcion: objetivo.descripcion,
      tipo: objetivo.tipo,
      prioridad: objetivo.prioridad,
    },
  })

  const indicadorForm = useForm<z.infer<typeof indicadorSchema>>({
    resolver: zodResolver(indicadorSchema),
    defaultValues: {
      nombre: "",
      descripcion: "",
      unidad_medida: "PORCENTAJE",
      patron: "ASCENDENTE",
      linea_base: 0,
      fecha_linea_base: new Date().toISOString().split('T')[0],
      meta_total: 0,
      fuente_informacion: "",
      periodicidad: "ANUAL",
      metas: [],
    },
  })

  const handleAddEstrategia = () => {
    if (!newEstrategia.trim()) {
      toast.error("La descripción de la estrategia es requerida")
      return
    }

    if (editingEstrategiaIndex !== null) {
      // Update existing estrategia
      const updatedEstrategias = [...estrategias]
      updatedEstrategias[editingEstrategiaIndex] = { descripcion: newEstrategia }
      setEstrategias(updatedEstrategias)
      setEditingEstrategiaIndex(null)
    } else {
      // Add new estrategia
      setEstrategias([...estrategias, { descripcion: newEstrategia }])
    }
    
    setNewEstrategia("")
  }

  const handleRemoveEstrategia = (index: number) => {
    setEstrategias(estrategias.filter((_, i) => i !== index))
  }

  const handleAddOrUpdateIndicador = (data: z.infer<typeof indicadorSchema>) => {
    if (editingIndicadorIndex !== null) {
      // Update existing indicador
      const updatedIndicadores = [...indicadores];
      updatedIndicadores[editingIndicadorIndex] = {
        ...indicadores[editingIndicadorIndex],
        ...data,
        metas: data.metas || [],
      };
      setIndicadores(updatedIndicadores);
      setEditingIndicadorIndex(null);
    } else {
      // Add new indicador
      setIndicadores([...indicadores, { ...data, metas: data.metas || [] }]);
    }
    indicadorForm.reset({
      nombre: "",
      descripcion: "",
      unidad_medida: "PORCENTAJE",
      patron: "ASCENDENTE",
      linea_base: 0,
      fecha_linea_base: new Date().toISOString().split('T')[0],
      meta_total: 0,
      fuente_informacion: "",
      periodicidad: "ANUAL",
      metas: [],
    });
  }

  const handleRemoveIndicador = (index: number) => {
    setIndicadores(indicadores.filter((_, i) => i !== index))
  }

  const handleEditIndicador = (index: number) => {
    const indicador = indicadores[index];
    setEditingIndicadorIndex(index);
    indicadorForm.reset({
      ...indicador,
      metas: indicador.metas || [], // Ensure metas is initialized even if undefined
      linea_base: indicador.linea_base || 0,
      meta_total: indicador.meta_total || 0,
      fecha_linea_base: indicador.fecha_linea_base?.split('T')[0] || new Date().toISOString().split('T')[0],
    });
  };

  const handleEditEstrategia = (index: number) => {
    setNewEstrategia(estrategias[index].descripcion)
    setEditingEstrategiaIndex(index)
  }

  const handleCancelEditEstrategia = () => {
    setNewEstrategia("")
    setEditingEstrategiaIndex(null)
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true)
      
      const response = await fetch(`/api/objetivos/${objetivo._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          estrategias,
          indicadores,
        }),
      })

      if (!response.ok) throw new Error('Error al actualizar objetivo')
      
      toast.success('Objetivo actualizado exitosamente')
      onUpdate()
      onClose()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al actualizar el objetivo')
    } finally {
      setIsSubmitting(false)
    }
  }


  const handleAddMeta = () => {
    const currentMetas = indicadorForm.getValues('metas') || []
    const newMetas = [...currentMetas, { periodo: '', valor: 0 }]
    indicadorForm.setValue('metas', newMetas)
  }

  const handleRemoveMeta = (index: number) => {
    const metas = indicadorForm.getValues('metas')
    indicadorForm.setValue('metas', metas.filter((_, i) => i !== index))
  }

  return (
    <div className="space-y-6">
      <Tabs defaultValue="objetivo" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="objetivo">Objetivo Estratégico</TabsTrigger>
          <TabsTrigger value="indicadores">Indicadores</TabsTrigger>
        </TabsList>
        
        <TabsContent value="objetivo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información del Objetivo</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="descripcion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción OEI</FormLabel>
                        <FormControl>
                          <Textarea {...field} className="min-h-[100px]" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="tipo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tipo</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione un tipo" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Fortalecimiento Institucional">Fortalecimiento Institucional</SelectItem>
                              <SelectItem value="Desarrollo Social">Desarrollo Social</SelectItem>
                              <SelectItem value="Infraestructura">Infraestructura</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="prioridad"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Prioridad</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione la prioridad" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Alta">Alta</SelectItem>
                              <SelectItem value="Media">Media</SelectItem>
                              <SelectItem value="Baja">Baja</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="space-y-4">
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <FormLabel>
                          {editingEstrategiaIndex !== null ? 'Editar Estrategia' : 'Nueva Estrategia'}
                        </FormLabel>
                        <Textarea 
                          value={newEstrategia}
                          onChange={(e) => setNewEstrategia(e.target.value)}
                          placeholder="Descripción de la estrategia"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          type="button" 
                          onClick={handleAddEstrategia}
                          variant="default"
                        >
                          {editingEstrategiaIndex !== null ? (
                            <Save className="h-4 w-4" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                        </Button>
                        {editingEstrategiaIndex !== null && (
                          <Button 
                            type="button" 
                            variant="ghost"
                            onClick={handleCancelEditEstrategia}
                          >
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </div>

                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Descripción</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="w-[100px]">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {estrategias.map((estrategia, index) => (
                          <TableRow key={index}>
                            <TableCell>{estrategia.descripcion}</TableCell>
                            <TableCell>
                              <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-700">
                                APROBADO SENPLADES
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleEditEstrategia(index)}
                                  disabled={editingEstrategiaIndex !== null}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => handleRemoveEstrategia(index)}
                                  disabled={editingEstrategiaIndex !== null}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </form>
              </Form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="indicadores" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {editingIndicadorIndex !== null ? 'Editar Indicador' : 'Gestión de Indicadores'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...indicadorForm}>
                <form onSubmit={indicadorForm.handleSubmit(handleAddOrUpdateIndicador)} className="space-y-4">
                  <FormField
                    control={indicadorForm.control}
                    name="nombre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={indicadorForm.control}
                    name="descripcion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Descripción</FormLabel>
                        <FormControl>
                          <Textarea {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={indicadorForm.control}
                      name="unidad_medida"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Unidad de Medida</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione la unidad" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="PORCENTAJE">Porcentaje</SelectItem>
                              <SelectItem value="NUMERO">Número</SelectItem>
                              <SelectItem value="TASA">Tasa</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={indicadorForm.control}
                      name="patron"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Patrón</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Seleccione el patrón" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="ASCENDENTE">Ascendente</SelectItem>
                              <SelectItem value="DESCENDENTE">Descendente</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={indicadorForm.control}
                      name="linea_base"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Línea Base</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              {...field}
                              onChange={e => field.onChange(parseFloat(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={indicadorForm.control}
                      name="fecha_linea_base"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Fecha Línea Base</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={indicadorForm.control}
                    name="meta_total"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Total</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field}
                            onChange={e => field.onChange(parseFloat(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={indicadorForm.control}
                    name="fuente_informacion"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fuente de Información</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={indicadorForm.control}
                    name="periodicidad"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Periodicidad</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccione la periodicidad" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ANUAL">Anual</SelectItem>
                            <SelectItem value="SEMESTRAL">Semestral</SelectItem>
                            <SelectItem value="TRIMESTRAL">Trimestral</SelectItem>
                            <SelectItem value="MENSUAL">Mensual</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <FormLabel>Metas</FormLabel>
                      <Button 
                        type="button" 
                        variant="default" 
                        size="sm" 
                        onClick={handleAddMeta}
                        disabled={!indicadorForm.getValues('periodicidad')}
                      >
                        <Plus className="h-4 w-4 mr-2" /> Añadir Meta
                      </Button>
                    </div>
                    
                    <div className="space-y-4">
                      {indicadorForm.watch('metas')?.map((meta, index) => (
                        <div key={index} className="flex gap-4">
                          <FormField
                            control={indicadorForm.control}
                            name={`metas.${index}.periodo`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel>Periodo</FormLabel>
                                <FormControl>
                                  <Input 
                                    {...field}
                                    placeholder="Ej: 2025, Trimestre 1, Enero 2025"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={indicadorForm.control}
                            name={`metas.${index}.valor`}
                            render={({ field }) => (
                              <FormItem className="flex-1">
                                <FormLabel>Valor</FormLabel>
                                <FormControl>
                                  <Input
                                    type="number"
                                    {...field}
                                    onChange={(e) => field.onChange(parseFloat(e.target.value))}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="mt-8"
                            onClick={() => handleRemoveMeta(index)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    {editingIndicadorIndex !== null && (
                      <Button 
                        type="button" 
                        variant="ghost"
                        onClick={() => {
                          setEditingIndicadorIndex(null)
                          indicadorForm.reset({
                            nombre: "",
                            descripcion: "",
                            unidad_medida: "PORCENTAJE",
                            patron: "ASCENDENTE",
                            linea_base: 0,
                            fecha_linea_base: new Date().toISOString().split('T')[0],
                            meta_total: 0,
                            fuente_informacion: "",
                            periodicidad: "ANUAL",
                            metas: [],
                          })
                        }}
                      >
                        Cancelar
                      </Button>
                    )}
                    <Button type="submit" variant="default">
                      {editingIndicadorIndex !== null ? (
                        <Save className="h-4 w-4 mr-2" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      {editingIndicadorIndex !== null ? 'Guardar Indicador' : 'Añadir Indicador'}
                    </Button>
                  </div>
                </form>
              </Form>

              <div className="mt-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nombre</TableHead>
                      <TableHead>Unidad de Medida</TableHead>
                      <TableHead>Línea Base</TableHead>
                      <TableHead>Estado</TableHead>
                      <TableHead className="w-[100px]">Acciones</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {indicadores.map((indicador, index) => (
                      <TableRow key={index}>
                        <TableCell>{indicador.nombre}</TableCell>
                        <TableCell>{indicador.unidad_medida}</TableCell>
                        <TableCell>{indicador.linea_base}</TableCell>
                        <TableCell>
                          <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-700">
                            APROBADO SENPLADES
                          </span>
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditIndicador(index)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveIndicador(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      <div className="sticky bottom-0 flex justify-end gap-2 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75 p-4 mt-auto w-full z-50">
        <div className="flex justify-end gap-2 w-full max-w-[calc(100vw-2rem)]">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={form.handleSubmit(onSubmit)} disabled={isSubmitting}>
            {isSubmitting ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>
    </div>
  )
}

