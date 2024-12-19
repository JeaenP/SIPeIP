"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "sonner"
import { Plus, Minus } from 'lucide-react'
import type { Programa, Proyecto, Producto, Entidad } from "@/lib/models/types"

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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useForm as useFormProduct } from "react-hook-form"

const formSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  descripcion: z.string().min(1, "La descripción es requerida"),
  codigoMF: z.string().min(1, "El código MF es requerido"),
  tipo: z.string().min(1, "El tipo es requerido"),
})

const productFormSchema = z.object({
  nombre: z.string().min(1, "El nombre es requerido"),
  descripcion: z.string().min(1, "La descripción es requerida"),
})

interface EditProgramaFormProps {
  programa: Programa
  onClose: () => void
}

export function EditProgramaForm({ programa, onClose }: EditProgramaFormProps) {
  const [proyectosDisponibles, setProyectosDisponibles] = useState<Proyecto[]>([])
  const [proyectosAsignados, setProyectosAsignados] = useState<Proyecto[]>([])
  const [productos, setProductos] = useState<Producto[]>([])
  const [entidad, setEntidad] = useState<Entidad | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombre: programa.nombre,
      descripcion: programa.descripcion,
      codigoMF: programa.codigoMF || '',
      tipo: programa.tipo,
    },
  })

  const productForm = useFormProduct<z.infer<typeof productFormSchema>>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      nombre: "",
      descripcion: "",
    },
  })

  useEffect(() => {
    loadProyectos()
    loadProductos()
    loadEntidad()
  }, [programa._id])

  const loadEntidad = async () => {
    try {
      const response = await fetch(`/api/entidades/${programa.rucEntidad}`)
      if (!response.ok) throw new Error('Error al cargar entidad')
      
      const data = await response.json()
      setEntidad(data)
    } catch (error) {
      console.error('Error loading entidad:', error)
      toast.error('Error al cargar los datos de la entidad')
    }
  }

  const loadProyectos = async () => {
    try {
      const response = await fetch(`/api/proyectos?rucEntidad=${programa.rucEntidad}&programaId=${programa._id}`)
      if (!response.ok) throw new Error('Error al cargar proyectos')
      
      const proyectos = await response.json()
      setProyectosDisponibles(proyectos.filter((p: Proyecto & { asignado: boolean }) => !p.asignado))
      setProyectosAsignados(proyectos.filter((p: Proyecto & { asignado: boolean }) => p.asignado))
    } catch (error) {
      console.error('Error loading proyectos:', error)
      toast.error('Error al cargar los proyectos')
    }
  }

  const loadProductos = async () => {
    try {
      const response = await fetch(`/api/productos?programaId=${programa._id}`)
      if (!response.ok) throw new Error('Error al cargar productos')
      
      const data = await response.json()
      setProductos(data)
    } catch (error) {
      console.error('Error loading productos:', error)
      toast.error('Error al cargar los productos')
    }
  }

  const handleAsignarProyecto = async (proyectoId: string) => {
    try {
      const response = await fetch(`/api/programas/${programa._id}/proyectos`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ proyectoId }),
      })

      if (!response.ok) throw new Error('Error al asignar proyecto')
      
      toast.success('Proyecto asignado exitosamente')
      await loadProyectos()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al asignar el proyecto')
    }
  }

  const handleDesasignarProyecto = async (proyectoId: string) => {
    try {
      const response = await fetch(`/api/programas/${programa._id}/proyectos/${proyectoId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Error al desasignar proyecto')
      
      toast.success('Proyecto desasignado exitosamente')
      await loadProyectos()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al desasignar el proyecto')
    }
  }

  const handleAgregarProducto = async (data: z.infer<typeof productFormSchema>) => {
    try {
      const response = await fetch('/api/productos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...data,
          programaId: programa._id,
          rucEntidad: programa.rucEntidad,
        }),
      })

      if (!response.ok) throw new Error('Error al agregar producto')
      
      toast.success('Producto agregado exitosamente')
      loadProductos()
      productForm.reset()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al agregar el producto')
    }
  }

  const handleEliminarProducto = async (productoId: string) => {
    try {
      const response = await fetch(`/api/productos?id=${productoId}&programaId=${programa._id}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Error al eliminar producto')
      
      // First update local state
      setProductos(prev => prev.filter(p => p._id !== productoId))
      
      toast.success('Producto eliminado exitosamente')
      
      // Then refresh data from server to ensure consistency
      await loadProductos()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al eliminar el producto')
    }
  }

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true)
  
      // Realizar la actualización en la base de datos
      const response = await fetch(`/api/programas/${programa._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...values,
          entidad: entidad?.razonSocial,
        }),
      })
  
      if (!response.ok) throw new Error('Error al actualizar programa')
  
      toast.success('Programa actualizado exitosamente')
  
      // Obtener los datos actualizados desde la respuesta
      const updatedProgramData = await response.json()
  
      // Usar setValue para actualizar el formulario con los nuevos valores
      form.setValue('nombre', updatedProgramData.nombre)
      form.setValue('descripcion', updatedProgramData.descripcion)
      form.setValue('codigoMF', updatedProgramData.codigoMF || '')
      form.setValue('tipo', updatedProgramData.tipo)
  
      // Opcional: Recargar los proyectos, productos y entidad si es necesario
      loadProyectos()
      loadProductos()
      loadEntidad()
    } catch (error) {
      console.error('Error:', error)
      toast.error('Error al actualizar el programa')
    } finally {
      setIsSubmitting(false)
    }
  }
  
  

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Información del Programa</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre del Programa</FormLabel>
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
                          <SelectItem value="INSTITUCIONAL">Institucional</SelectItem>
                          <SelectItem value="OTRO">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormItem>
                <FormLabel>Entidad</FormLabel>
                <Input 
                  value={entidad?.razonSocial || ''} 
                  disabled 
                  className="bg-gray-100"
                />
              </FormItem>

              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Guardando...' : 'Guardar'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Proyectos Asignados</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CUP</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead className="text-right">Monto ($)</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proyectosAsignados.map((proyecto) => (
                <TableRow key={proyecto._id}>
                  <TableCell>{proyecto.cup}</TableCell>
                  <TableCell>{proyecto.nombre}</TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat('es-EC', {
                      style: 'currency',
                      currency: 'USD'
                    }).format(proyecto.monto)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => proyecto._id && handleDesasignarProyecto(proyecto._id)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Proyectos Disponibles</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>CUP</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead className="text-right">Monto ($)</TableHead>
                <TableHead className="text-center">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {proyectosDisponibles.map((proyecto) => (
                <TableRow key={proyecto._id}>
                  <TableCell>{proyecto.cup}</TableCell>
                  <TableCell>{proyecto.nombre}</TableCell>
                  <TableCell className="text-right">
                    {new Intl.NumberFormat('es-EC', {
                      style: 'currency',
                      currency: 'USD'
                    }).format(proyecto.monto)}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => proyecto._id && handleAsignarProyecto(proyecto._id)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Productos</CardTitle>
          <Dialog>
            <DialogTrigger asChild>
              <Button>Añadir Producto</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Nuevo Producto</DialogTitle>
              </DialogHeader>
              <Form {...productForm}>
                <form onSubmit={productForm.handleSubmit(handleAgregarProducto)} className="space-y-4">
                  <FormField
                    control={productForm.control}
                    name="nombre"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nombre del Producto</FormLabel>
                        <FormControl>
                          <Input {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={productForm.control}
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
                  <div className="flex justify-end">
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
              {productos.map((producto) => (
                <TableRow key={producto._id}>
                  <TableCell>{producto.nombre}</TableCell>
                  <TableCell>{producto.descripcion}</TableCell>
                  <TableCell className="text-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => producto._id && handleEliminarProducto(producto._id)}
                    >
                      <Minus className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

