"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { Plus, Trash2, Save, Edit } from 'lucide-react'
import type { ObjetivoEstrategico, Estrategia, Indicador } from "@/lib/models/types"

// Importaciones de componentes UI
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

// Esquema de validación para estrategia
const esquemaEstrategia = z.object({
  descripcion: z.string().min(1, "La descripción es requerida"),
})

// Esquema de validación para indicador
const esquemaIndicador = z.object({
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

// Esquema de validación para el formulario principal
const esquemaFormulario = z.object({
  descripcion: z.string().min(1, "La descripción es requerida"),
  tipo: z.string().min(1, "El tipo es requerido"),
  prioridad: z.string().min(1, "La prioridad es requerida"),
})

// Interfaz para las propiedades del componente
interface PropiedadesEditarFormularioObjetivo {
  objetivo: ObjetivoEstrategico
  onClose: () => void
  onUpdate: () => void
}

export function EditarFormularioObjetivo({ objetivo, onClose, onUpdate }: PropiedadesEditarFormularioObjetivo) {
  // Estados del componente
  const [estrategias, setEstrategias] = useState<Estrategia[]>(objetivo.estrategias || [])
  const [indicadores, setIndicadores] = useState<Indicador[]>(objetivo.indicadores || [])
  const [nuevaEstrategia, setNuevaEstrategia] = useState("")
  const [estaEnviando, setEstaEnviando] = useState(false)
  const [indiceIndicadorEditando, setIndiceIndicadorEditando] = useState<number | null>(null);
  const [indiceEstrategiaEditando, setIndiceEstrategiaEditando] = useState<number | null>(null)

  // Configuración del formulario principal
  const formulario = useForm<z.infer<typeof esquemaFormulario>>({
    resolver: zodResolver(esquemaFormulario),
    defaultValues: {
      descripcion: objetivo.descripcion,
      tipo: objetivo.tipo,
      prioridad: objetivo.prioridad,
    },
  })

  // Configuración del formulario de indicador
  const formularioIndicador = useForm<z.infer<typeof esquemaIndicador>>({
    resolver: zodResolver(esquemaIndicador),
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

  // Función para agregar o actualizar una estrategia
  const manejarAgregarEstrategia = () => {
    if (!nuevaEstrategia.trim()) {
      toast.error("La descripción de la estrategia es requerida")
      return
    }

    if (indiceEstrategiaEditando !== null) {
      // Actualizar estrategia existente
      const estrategiasActualizadas = [...estrategias]
      estrategiasActualizadas[indiceEstrategiaEditando] = { descripcion: nuevaEstrategia }
      setEstrategias(estrategiasActualizadas)
      setIndiceEstrategiaEditando(null)
    } else {
      // Agregar nueva estrategia
      setEstrategias([...estrategias, { descripcion: nuevaEstrategia }])
    }
    
    setNuevaEstrategia("")
  }

  // Función para eliminar una estrategia
  const manejarEliminarEstrategia = (indice: number) => {
    setEstrategias(estrategias.filter((_, i) => i !== indice))
  }

  // Función para agregar o actualizar un indicador
  const manejarAgregarOActualizarIndicador = (datos: z.infer<typeof esquemaIndicador>) => {
    if (indiceIndicadorEditando !== null) {
      // Actualizar indicador existente
      const indicadoresActualizados = [...indicadores];
      indicadoresActualizados[indiceIndicadorEditando] = {
        ...indicadores[indiceIndicadorEditando],
        ...datos,
        metas: datos.metas || [],
      };
      setIndicadores(indicadoresActualizados);
      setIndiceIndicadorEditando(null);
    } else {
      // Agregar nuevo indicador
      setIndicadores([...indicadores, { ...datos, metas: datos.metas || [] }]);
    }
    formularioIndicador.reset({
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

  // Función para eliminar un indicador
  const manejarEliminarIndicador = (indice: number) => {
    setIndicadores(indicadores.filter((_, i) => i !== indice))
  }

  // Función para editar un indicador
  const manejarEditarIndicador = (indice: number) => {
    const indicador = indicadores[indice];
    setIndiceIndicadorEditando(indice);
    formularioIndicador.reset({
      ...indicador,
      metas: indicador.metas || [],
      linea_base: indicador.linea_base || 0,
      meta_total: indicador.meta_total || 0,
      fecha_linea_base: indicador.fecha_linea_base?.split('T')[0] || new Date().toISOString().split('T')[0],
    });
  };

  // Función para editar una estrategia
  const manejarEditarEstrategia = (indice: number) => {
    setNuevaEstrategia(estrategias[indice].descripcion)
    setIndiceEstrategiaEditando(indice)
  }

  // Función para cancelar la edición de una estrategia
  const manejarCancelarEdicionEstrategia = () => {
    setNuevaEstrategia("")
    setIndiceEstrategiaEditando(null)
  }

  // Función para manejar el envío del formulario principal
  const alEnviar = async (valores: z.infer<typeof esquemaFormulario>) => {
    try {
      setEstaEnviando(true)
      
      const respuesta = await fetch(`/api/objetivos/${objetivo._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...valores,
          estrategias,
          indicadores,
        }),
      })

      if (!respuesta.ok) throw new Error('Error al actualizar objetivo')
      
      toast.success('Objetivo actualizado exitosamente')
      onUpdate()
      onClose()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al actualizar el objetivo')
    } finally {
      setEstaEnviando(false)
    }
  }

  // Función para agregar una nueva meta a un indicador
  const manejarAgregarMeta = () => {
    const metasActuales = formularioIndicador.getValues('metas') || []
    const nuevasMetas = [...metasActuales, { periodo: '', valor: 0 }]
    formularioIndicador.setValue('metas', nuevasMetas)
  }

  // Función para eliminar una meta de un indicador
  const manejarEliminarMeta = (indice: number) => {
    const metas = formularioIndicador.getValues('metas')
    formularioIndicador.setValue('metas', metas.filter((_, i) => i !== indice))
  }

  // Renderizado del componente
  return (
    <div className="space-y-6">
      <Tabs defaultValue="objetivo" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="objetivo">Objetivo Estratégico</TabsTrigger>
          <TabsTrigger value="indicadores">Indicadores</TabsTrigger>
        </TabsList>
        
        {/* Contenido de la pestaña Objetivo Estratégico */}
        <TabsContent value="objetivo" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Información del Objetivo</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...formulario}>
                <form onSubmit={formulario.handleSubmit(alEnviar)} className="space-y-4">
                  {/* Campo de descripción del OEI */}
                  <FormField
                    control={formulario.control}
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
                    {/* Campo de tipo de objetivo */}
                    <FormField
                      control={formulario.control}
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

                    {/* Campo de prioridad del objetivo */}
                    <FormField
                      control={formulario.control}
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

                  {/* Sección de estrategias */}
                  <div className="space-y-4">
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <FormLabel>
                          {indiceEstrategiaEditando !== null ? 'Editar Estrategia' : 'Nueva Estrategia'}
                        </FormLabel>
                        <Textarea 
                          value={nuevaEstrategia}
                          onChange={(e) => setNuevaEstrategia(e.target.value)}
                          placeholder="Descripción de la estrategia"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          type="button" 
                          onClick={manejarAgregarEstrategia}
                          variant="default"
                        >
                          {indiceEstrategiaEditando !== null ? (
                            <Save className="h-4 w-4" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                        </Button>
                        {indiceEstrategiaEditando !== null && (
                          <Button 
                            type="button" 
                            variant="ghost"
                            onClick={manejarCancelarEdicionEstrategia}
                          >
                            Cancelar
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Tabla de estrategias */}
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Descripción</TableHead>
                          <TableHead>Estado</TableHead>
                          <TableHead className="w-[100px]">Acciones</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {estrategias.map((estrategia, indice) => (
                          <TableRow key={indice}>
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
                                  onClick={() => manejarEditarEstrategia(indice)}
                                  disabled={indiceEstrategiaEditando !== null}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => manejarEliminarEstrategia(indice)}
                                  disabled={indiceEstrategiaEditando !== null}
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

        {/* Contenido de la pestaña Indicadores */}
        <TabsContent value="indicadores" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>
                {indiceIndicadorEditando !== null ? 'Editar Indicador' : 'Gestión de Indicadores'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...formularioIndicador}>
                <form onSubmit={formularioIndicador.handleSubmit(manejarAgregarOActualizarIndicador)} className="space-y-4">
                  {/* Campos del formulario de indicador */}
                  {/* ... (los campos del formulario de indicador continúan aquí) ... */}

                  <div className="flex justify-end gap-2">
                    {indiceIndicadorEditando !== null && (
                      <Button 
                        type="button" 
                        variant="ghost"
                        onClick={() => {
                          setIndiceIndicadorEditando(null)
                          formularioIndicador.reset({
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
                      {indiceIndicadorEditando !== null ? (
                        <Save className="h-4 w-4 mr-2" />
                      ) : (
                        <Plus className="h-4 w-4 mr-2" />
                      )}
                      {indiceIndicadorEditando !== null ? 'Guardar Indicador' : 'Añadir Indicador'}
                    </Button>
                  </div>
                </form>
              </Form>

              {/* Tabla de indicadores */}
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
                    {indicadores.map((indicador, indice) => (
                      <TableRow key={indice}>
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
                              onClick={() => manejarEditarIndicador(indice)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => manejarEliminarIndicador(indice)}
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
          <Button onClick={formulario.handleSubmit(alEnviar)} disabled={estaEnviando}>
            {estaEnviando ? 'Guardando...' : 'Guardar'}
          </Button>
        </div>
      </div>
    </div>
  )
}

