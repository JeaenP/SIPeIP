"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { Plus, Trash2 } from "lucide-react"
import type { Programa, Proyecto } from "@/lib/models/types"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"

const formSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  descripcion: z.string().min(1, "La descripción es requerida"),
  codigoMF: z.string().min(1, "El código es requerido"),
  tipo: z.string().min(1, "El tipo es requerido"),
})

const productoSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  descripcion: z.string().min(1, "La descripción es requerida"),
})

interface EditProgramaFormProps {
  programa: Programa
  onClose: () => void
  onUpdate: () => void
}

interface Producto {
  _id?: string
  nombre: string
  descripcion: string
  programaId: string
  rucEntidad: string
}

export function EditProgramaForm({ programa, onClose, onUpdate }: EditProgramaFormProps) {
  const [proyectosDisponibles, setProyectosDisponibles] = useState<Proyecto[]>([])
  const [proyectosAsignados, setProyectosAsignados] = useState<Proyecto[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isUpdatingProjects, setIsUpdatingProjects] = useState(false)
  const [isLoadingProducts, setIsLoadingProducts] = useState(true)
  const [showAddProduct, setShowAddProduct] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: programa.nombre,
      descripcion: programa.descripcion,
      codigoMF: programa.codigoMF,
      tipo: programa.tipo,
    },
  })

  const productoForm = useForm<z.infer<typeof productoSchema>>({
    resolver: zodResolver(productoSchema),
    defaultValues: {
      nombre: "",
      descripcion: "",
    },
  })

  useEffect(() => {
    loadProyectos()
    loadProductos()
  }, [])

  useEffect(() => {
    form.reset({
      nombre: programa.nombre,
      descripcion: programa.descripcion,
      codigoMF: programa.codigoMF,
      tipo: programa.tipo,
    })
  }, [programa, form])

  const loadProyectos = async () => {
    try {
      const response = await fetch(`/api/programas/${programa._id}/proyectos`)
      if (!response.ok) throw new Error("Error al cargar proyectos")

      const data = await response.json()
      setProyectosDisponibles(data.proyectosDisponibles)
      setProyectosAsignados(data.proyectosAsignados)
    } catch (error) {
      console.error("Error loading proyectos:", error)
      toast.error("Error al cargar los proyectos")
    }
  }

  const loadProductos = async () => {
    try {
      setIsLoadingProducts(true)
      const programResponse = await fetch(`/api/programas/${programa._id}`)
      if (!programResponse.ok) throw new Error("Error al cargar programa")
      const programData = await programResponse.json()

      if (!programData.productos?.length) {
        setProductos([])
        return
      }

      const productosData = await Promise.all(
        programData.productos.map(async (productoId: string) => {
          const response = await fetch(`/api/productos/${productoId}`)
          if (!response.ok) return null
          return response.json()
        }),
      )

      setProductos(productosData.filter(Boolean))
    } catch (error) {
      console.error("Error loading productos:", error)
    } finally {
      setIsLoadingProducts(false)
    }
  }

  const handleAddProduct = async (data: z.infer<typeof productoSchema>) => {
    try {
      const response = await fetch("/api/productos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          programaId: programa._id,
          rucEntidad: programa.rucEntidad[0],
        }),
      })

      if (!response.ok) throw new Error("Error al crear producto")

      setShowAddProduct(false)
      productoForm.reset()
      await loadProductos()
      toast.success("Producto creado exitosamente")
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al crear el producto")
    }
  }

  const handleDeleteProduct = async (productoId: string) => {
    try {
      const response = await fetch(`/api/productos/${productoId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Error al eliminar producto")

      await loadProductos()
      toast.success("Producto eliminado exitosamente")
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al eliminar el producto")
    }
  }

  const handleAssignProject = async (proyectoId: string) => {
    try {
      setIsUpdatingProjects(true)
      const response = await fetch(`/api/programas/${programa._id}/proyectos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ proyectoId }),
      })

      if (!response.ok) throw new Error("Error al asignar proyecto")

      toast.success("Proyecto asignado exitosamente")
      await loadProyectos()
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al asignar el proyecto")
    } finally {
      setIsUpdatingProjects(false)
    }
  }

  const handleUnassignProject = async (proyectoId: string) => {
    try {
      setIsUpdatingProjects(true)
      const response = await fetch(`/api/programas/${programa._id}/proyectos/${proyectoId}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Error al desasignar proyecto")

      toast.success("Proyecto desasignado exitosamente")
      await loadProyectos()
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al desasignar el proyecto")
    } finally {
      setIsUpdatingProjects(false)
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true)

      const response = await fetch(`/api/programas/${programa._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        throw new Error("Error al actualizar programa")
      }

      // Fetch updated program data
      const updatedResponse = await fetch(`/api/programas/${programa._id}`)
      if (updatedResponse.ok) {
        const updatedPrograma = await updatedResponse.json()
        form.reset({
          nombre: updatedPrograma.nombre,
          descripcion: updatedPrograma.descripcion,
          codigoMF: updatedPrograma.codigoMF,
          tipo: updatedPrograma.tipo,
        })
      }

      toast.success("Información del programa actualizada exitosamente")
      if (onUpdate) {
        onUpdate()
      }
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al actualizar el programa")
    } finally {
      setIsSubmitting(false)
    }
  }

  const formatMonto = (monto: number) => {
    return new Intl.NumberFormat("es-EC", {
      style: "currency",
      currency: "USD",
    }).format(monto)
  }

  return (
    <div className="space-y-6">
      {/* Proyectos Section */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h3 className="font-medium">Proyectos Asignados</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>CUP</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proyectosAsignados.map((proyecto) => (
                  <TableRow key={proyecto._id}>
                    <TableCell>{proyecto.cup}</TableCell>
                    <TableCell>{proyecto.nombre}</TableCell>
                    <TableCell className="text-right">{formatMonto(proyecto.monto)}</TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => proyecto._id && handleUnassignProject(proyecto._id)}
                        disabled={isUpdatingProjects}
                      >
                        Desasignar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {proyectosAsignados.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No hay proyectos asignados
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="space-y-4 mt-6">
            <h3 className="font-medium">Proyectos Disponibles</h3>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>CUP</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                  <TableHead className="text-center">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {proyectosDisponibles.map((proyecto) => (
                  <TableRow key={proyecto._id}>
                    <TableCell>{proyecto.cup}</TableCell>
                    <TableCell>{proyecto.nombre}</TableCell>
                    <TableCell className="text-right">{formatMonto(proyecto.monto)}</TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => proyecto._id && handleAssignProject(proyecto._id)}
                        disabled={isUpdatingProjects}
                      >
                        Asignar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {proyectosDisponibles.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-muted-foreground">
                      No hay proyectos disponibles
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Productos Section */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Productos</CardTitle>
          <Dialog open={showAddProduct} onOpenChange={setShowAddProduct}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Añadir Producto
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuevo Producto</DialogTitle>
              </DialogHeader>
              <Form {...productoForm}>
                <form onSubmit={productoForm.handleSubmit(handleAddProduct)} className="space-y-4">
                  <FormField
                    control={productoForm.control}
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
                    control={productoForm.control}
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
                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setShowAddProduct(false)}>
                      Cancelar
                    </Button>
                    <Button type="submit">Guardar</Button>
                  </div>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nombre</TableHead>
                <TableHead>Descripción</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoadingProducts ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4">
                    Cargando productos...
                  </TableCell>
                </TableRow>
              ) : productos.length > 0 ? (
                productos.map((producto) => (
                  <TableRow key={producto._id}>
                    <TableCell>{producto.nombre}</TableCell>
                    <TableCell>{producto.descripcion}</TableCell>
                    <TableCell className="text-center">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => producto._id && handleDeleteProduct(producto._id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={3} className="text-center text-muted-foreground">
                    No hay productos registrados
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Program Info Section */}
      <Card>
        <CardHeader>
          <CardTitle>Información del Programa</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6">
                <FormField
                  control={form.control}
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
                  control={form.control}
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
                    control={form.control}
                    name="codigoMF"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Código MF</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

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
                            <SelectItem value="INVERSIÓN">Inversión</SelectItem>
                            <SelectItem value="GASTO CORRIENTE">Gasto Corriente</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={onClose}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Guardando..." : "Guardar"}
                  </Button>
                </div>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

