"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { Plus, Trash2, Save, Edit } from "lucide-react"
import type { ObjetivoEstrategico, Estrategia, Indicador } from "@/lib/models/types"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const esquemaEstrategia = z.object({
  descripcion: z.string().min(1, "La descripción es requerida"),
})

const esquemaIndicador = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  descripcion: z.string().min(1, "La descripción es requerida"),
  formula: z.string().min(1, "La fórmula es requerida"),
  unidad_medida: z.string().min(1, "La unidad de medida es requerida"),
  patron: z.string().min(1, "El patrón es requerido"),
  linea_base: z.number().min(0, "La línea base debe ser mayor o igual a 0"),
  fecha_linea_base: z.string().min(1, "La fecha de línea base es requerida"),
  meta_total: z.number().min(0, "La meta total debe ser mayor o igual a 0"),
  fuente_informacion: z.string().min(1, "La fuente de información es requerida"),
  periodicidad: z.enum(["ANUAL", "SEMESTRAL"]),
  metas: z.array(
    z.object({
      periodo: z.string().min(1, "El periodo es requerido"),
      valor: z.number().min(0, "El valor debe ser mayor o igual a 0"),
    }),
  ),
})

const esquemaFormulario = z.object({
  descripcion: z.string().min(1, "La descripción es requerida"),
  tipo: z.string().min(1, "El tipo es requerido"),
  prioridad: z.string().min(1, "La prioridad es requerida"),
})

interface PropiedadesEditarFormularioObjetivo {
  objetivo: ObjetivoEstrategico
  onClose: () => void
  onUpdate: () => void
}

export function EditarFormularioObjetivo({ objetivo, onClose, onUpdate }: PropiedadesEditarFormularioObjetivo) {
  const [estrategias, setEstrategias] = useState<Estrategia[]>(objetivo.estrategias || [])
  const [indicadores, setIndicadores] = useState<Indicador[]>(objetivo.indicadores || [])
  const [nuevaEstrategia, setNuevaEstrategia] = useState("")
  const [estaEnviando, setEstaEnviando] = useState(false)
  const [indiceIndicadorEditando, setIndiceIndicadorEditando] = useState<number | null>(null)
  const [indiceEstrategiaEditando, setIndiceEstrategiaEditando] = useState<number | null>(null)

  const formulario = useForm<z.infer<typeof esquemaFormulario>>({
    resolver: zodResolver(esquemaFormulario),
    defaultValues: {
      descripcion: objetivo.descripcion,
      tipo: objetivo.tipo,
      prioridad: objetivo.prioridad,
    },
  })

  const formularioIndicador = useForm<z.infer<typeof esquemaIndicador>>({
    resolver: zodResolver(esquemaIndicador),
    defaultValues: {
      nombre: "",
      descripcion: "",
      formula: "",
      unidad_medida: "PORCENTAJE",
      patron: "ASCENDENTE",
      linea_base: 0,
      fecha_linea_base: new Date().toISOString().split("T")[0],
      meta_total: 0,
      fuente_informacion: "",
      periodicidad: "ANUAL",
      metas: [],
    },
  })

  const manejarAgregarEstrategia = () => {
    if (!nuevaEstrategia.trim()) {
      toast.error("La descripción de la estrategia es requerida")
      return
    }

    if (indiceEstrategiaEditando !== null) {
      const estrategiasActualizadas = [...estrategias]
      estrategiasActualizadas[indiceEstrategiaEditando] = { descripcion: nuevaEstrategia }
      setEstrategias(estrategiasActualizadas)
      setIndiceEstrategiaEditando(null)
    } else {
      setEstrategias([...estrategias, { descripcion: nuevaEstrategia }])
    }

    setNuevaEstrategia("")
  }

  const manejarEliminarEstrategia = (indice: number) => {
    setEstrategias(estrategias.filter((_, i) => i !== indice))
  }

  const manejarAgregarOActualizarIndicador = (datos: z.infer<typeof esquemaIndicador>) => {
    if (indiceIndicadorEditando !== null) {
      const indicadoresActualizados = [...indicadores]
      indicadoresActualizados[indiceIndicadorEditando] = {
        ...indicadores[indiceIndicadorEditando],
        ...datos,
        metas: datos.metas || [],
      }
      setIndicadores(indicadoresActualizados)
      setIndiceIndicadorEditando(null)
    } else {
      setIndicadores([...indicadores, { ...datos, metas: datos.metas || [] }])
    }
    formularioIndicador.reset({
      nombre: "",
      descripcion: "",
      formula: "",
      unidad_medida: "PORCENTAJE",
      patron: "ASCENDENTE",
      linea_base: 0,
      fecha_linea_base: new Date().toISOString().split("T")[0],
      meta_total: 0,
      fuente_informacion: "",
      periodicidad: "ANUAL",
      metas: [],
    })
  }

  const manejarEliminarIndicador = (indice: number) => {
    setIndicadores(indicadores.filter((_, i) => i !== indice))
  }

  const manejarEditarIndicador = (indice: number) => {
    const indicador = indicadores[indice]
    setIndiceIndicadorEditando(indice)
    formularioIndicador.reset({
      ...indicador,
      metas: indicador.metas || [],
      linea_base: indicador.linea_base || 0,
      meta_total: indicador.meta_total || 0,
      fecha_linea_base: indicador.fecha_linea_base?.split("T")[0] || new Date().toISOString().split("T")[0],
    })
  }

  const manejarEditarEstrategia = (indice: number) => {
    setNuevaEstrategia(estrategias[indice].descripcion)
    setIndiceEstrategiaEditando(indice)
  }

  const manejarCancelarEdicionEstrategia = () => {
    setNuevaEstrategia("")
    setIndiceEstrategiaEditando(null)
  }

  const alEnviar = async (valores: z.infer<typeof esquemaFormulario>) => {
    try {
      setEstaEnviando(true)

      const respuesta = await fetch(`/api/objetivos/${objetivo._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...valores,
          estrategias,
          indicadores,
        }),
      })

      if (!respuesta.ok) throw new Error("Error al actualizar objetivo")

      toast.success("Objetivo actualizado exitosamente")
      onUpdate()
      onClose()
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al actualizar el objetivo")
    } finally {
      setEstaEnviando(false)
    }
  }

  const manejarAgregarMeta = () => {
    const metasActuales = formularioIndicador.getValues("metas") || []
    const nuevasMetas = [...metasActuales, { periodo: "", valor: 0 }]
    formularioIndicador.setValue("metas", nuevasMetas)
  }

  const manejarEliminarMeta = (indice: number) => {
    const metas = formularioIndicador.getValues("metas")
    formularioIndicador.setValue(
      "metas",
      metas.filter((_, i) => i !== indice),
    )
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
              <Form {...formulario}>
                <form onSubmit={formulario.handleSubmit(alEnviar)} className="space-y-4">
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
                              <SelectItem value="Fortalecimiento Institucional">
                                Fortalecimiento Institucional
                              </SelectItem>
                              <SelectItem value="Razón de Ser">Razón de Ser</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

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

                  <div className="space-y-4">
                    <div className="flex items-end gap-2">
                      <div className="flex-1">
                        <FormLabel>
                          {indiceEstrategiaEditando !== null ? "Editar Estrategia" : "Nueva Estrategia"}
                        </FormLabel>
                        <Textarea
                          value={nuevaEstrategia}
                          onChange={(e) => setNuevaEstrategia(e.target.value)}
                          placeholder="Descripción de la estrategia"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button type="button" onClick={manejarAgregarEstrategia} variant="default">
                          {indiceEstrategiaEditando !== null ? (
                            <Save className="h-4 w-4" />
                          ) : (
                            <Plus className="h-4 w-4" />
                          )}
                        </Button>
                        {indiceEstrategiaEditando !== null && (
                          <Button type="button" variant="ghost" onClick={manejarCancelarEdicionEstrategia}>
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

        <TabsContent value="indicadores" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>{indiceIndicadorEditando !== null ? "Editar Indicador" : "Gestión de Indicadores"}</CardTitle>
            </CardHeader>
            <CardContent>
              <Form {...formularioIndicador}>
                <form
                  onSubmit={formularioIndicador.handleSubmit(manejarAgregarOActualizarIndicador)}
                  className="space-y-4"
                >
                  <FormField
                    control={formularioIndicador.control}
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
                    control={formularioIndicador.control}
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
                  <FormField
                    control={formularioIndicador.control}
                    name="formula"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Fórmula</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Ej: (X/Y)*100" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-2 gap-4">
                    <FormField
                      control={formularioIndicador.control}
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
                      control={formularioIndicador.control}
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
                      control={formularioIndicador.control}
                      name="linea_base"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Línea Base</FormLabel>
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
                      control={formularioIndicador.control}
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
                    control={formularioIndicador.control}
                    name="meta_total"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Meta Total</FormLabel>
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
                    control={formularioIndicador.control}
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
                    control={formularioIndicador.control}
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
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <FormLabel>Metas</FormLabel>
                      {objetivo.tipo === "Fortalecimiento Institucional" && (
                        <Button
                          type="button"
                          variant="default"
                          size="sm"
                          onClick={manejarAgregarMeta}
                          disabled={!formularioIndicador.getValues("periodicidad")}
                        >
                          <Plus className="h-4 w-4 mr-2" /> Añadir Meta
                        </Button>
                      )}
                    </div>

                    {objetivo.tipo === "Fortalecimiento Institucional" && (
                      <div className="space-y-4">
                        {formularioIndicador.watch("metas")?.map((meta, index) => (
                          <div key={index} className="flex gap-4">
                            <FormField
                              control={formularioIndicador.control}
                              name={`metas.${index}.periodo`}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormLabel>Periodo</FormLabel>
                                  <FormControl>
                                    <Input {...field} placeholder="Ej: 2025, Semestre 1, Año 2025" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />

                            <FormField
                              control={formularioIndicador.control}
                              name={`metas.${index}.valor`}
                              render={({ field }) => (
                                <FormItem className="flex-1">
                                  <FormLabel>Valor</FormLabel>
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

                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="mt-8"
                              onClick={() => manejarEliminarMeta(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

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
                            formula: "",
                            unidad_medida: "PORCENTAJE",
                            patron: "ASCENDENTE",
                            linea_base: 0,
                            fecha_linea_base: new Date().toISOString().split("T")[0],
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
                      {indiceIndicadorEditando !== null ? "Guardar Indicador" : "Añadir Indicador"}
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
                            <Button variant="ghost" size="sm" onClick={() => manejarEditarIndicador(indice)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => manejarEliminarIndicador(indice)}>
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
            {estaEnviando ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </div>
    </div>
  )
}

