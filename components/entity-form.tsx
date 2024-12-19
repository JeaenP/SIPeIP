"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useState, useEffect } from "react"
import { updateEntidad, getEntidadByRuc } from "@/app/actions"
import type { Entidad } from "@/lib/models/types"

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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { toast } from "sonner"

const formSchema = z.object({
  nombreEnteSector: z.string(),
  rucEntidad: z.string(),
  codigoEntidadFinanciera: z.string(),
  codigoADM: z.string(),
  numeroRegistroOficial: z.string(),
  consejo: z.string(),
  zona: z.string(),
  tipoNorma: z.string(),
  descripcionTipoNorma: z.string(),
  razonSocial: z.string(),
  funcionInstitucional: z.string(),
  sector: z.string(),
  mision: z.string(),
  vision: z.string(),
  estructuraOrganizacional: z.string().optional(),
  estado: z.string(),
  gpr: z.boolean(),
  numeroNorma: z.string(),
  nombre: z.string(),
  tipoInstitucion: z.string(),
  numeroEntidad: z.string(),
  funcion: z.string(),
})

interface EntityFormProps {
  userRucEntidad: string;
}

export function EntityForm({ userRucEntidad }: EntityFormProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nombreEnteSector: "",
      rucEntidad: "",
      codigoEntidadFinanciera: "",
      codigoADM: "",
      numeroRegistroOficial: "",
      consejo: "",
      zona: "",
      tipoNorma: "",
      descripcionTipoNorma: "",
      razonSocial: "",
      funcionInstitucional: "",
      sector: "",
      mision: "",
      vision: "",
      estructuraOrganizacional: "",
      estado: "",
      gpr: false,
      numeroNorma: "",
      nombre: "",
      tipoInstitucion: "",
      numeroEntidad: "",
      funcion: "",
    },
  })

  useEffect(() => {
    async function loadEntityData() {
      try {
        const result = await getEntidadByRuc(userRucEntidad)
        if (result.success && result.data) {
          const entidad = result.data
          form.reset({
            nombreEnteSector: entidad.nombreEnteSector,
            rucEntidad: entidad.rucEntidad,
            codigoEntidadFinanciera: entidad.codigoEntidadFinanciera,
            codigoADM: entidad.codigoADM,
            numeroRegistroOficial: entidad.numeroRegistroOficial.toString(),
            consejo: entidad.consejo,
            zona: entidad.zona,
            tipoNorma: entidad.tipoNorma,
            descripcionTipoNorma: entidad.descripcionTipoNorma,
            razonSocial: entidad.razonSocial,
            funcionInstitucional: entidad.funcionInstitucional,
            sector: entidad.sector,
            mision: entidad.mision,
            vision: entidad.vision,
            estructuraOrganizacional: entidad.estructuraOrganizacional,
            estado: entidad.estado,
            gpr: entidad.gpr,
            numeroNorma: entidad.numeroNorma?.toString() ?? "",
            nombre: entidad.nombre ?? "",
            tipoInstitucion: entidad.tipoInstitucion,
            numeroEntidad: entidad.numeroEntidad.toString(),
            funcion: entidad.funcion,
          })
        } else {
          toast.error('Error al cargar los datos de la entidad')
        }
      } catch (error) {
        console.error('Error loading entity data:', error)
        toast.error('Error al cargar los datos de la entidad')
      } finally {
        setIsLoading(false)
      }
    }

    loadEntityData()
  }, [userRucEntidad, form])

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      setIsSubmitting(true)
      const formData = new FormData()
      
      Object.entries(values).forEach(([key, value]) => {
        formData.append(key, value.toString())
      })

      const result = await updateEntidad(formData)

      if (result.success) {
        toast.success(result.message)
      } else {
        toast.error(result.message)
      }
    } catch (error) {
      console.error('Error al procesar el formulario:', error)
      toast.error('Error al actualizar la entidad')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return <div>Cargando datos de la entidad...</div>
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card className="w-full">
          <CardHeader>
            <CardTitle>Información de la Entidad</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="nombreEnteSector"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Ente Sector</FormLabel>
                      <FormControl>
                        <Input 
                          {...field} 
                          disabled 
                          className="bg-gray-100 w-full"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="rucEntidad"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>RUC Entidad</FormLabel>
                      <FormControl>
                        <Input placeholder="RUC" {...field} disabled className="bg-gray-100 w-full"/>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="codigoEntidadFinanciera"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código Entidad Financiera</FormLabel>
                      <FormControl>
                        <Input placeholder="Código" {...field} className="w-full" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="codigoADM"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Código ADM</FormLabel>
                      <FormControl>
                        <Input placeholder="Código ADM" {...field} className="w-full" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="numeroRegistroOficial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Número Registro Oficial</FormLabel>
                      <FormControl>
                        <Input placeholder="Número Registro" {...field} className="w-full" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="consejo"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Consejo</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} className="w-full">
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un consejo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="consejo1">Consejo 1</SelectItem>
                          <SelectItem value="consejo2">Consejo 2</SelectItem>
                          <SelectItem value="consejo3">Consejo 3</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="zona"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Zona</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} className="w-full">
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione una zona" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="zona1">Zona 1</SelectItem>
                          <SelectItem value="zona2">Zona 2</SelectItem>
                          <SelectItem value="zona3">Zona 3</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tipoNorma"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo Norma</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} className="w-full">
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione tipo de norma" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="decreto">Decreto</SelectItem>
                          <SelectItem value="ley">Ley</SelectItem>
                          <SelectItem value="reglamento">Reglamento</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="razonSocial"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Razón Social</FormLabel>
                      <FormControl>
                        <Input placeholder="Razón Social" {...field} className="w-full" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="funcionInstitucional"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Función Institucional</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} className="w-full">
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione una función institucional" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="funcion1">Función Institucional 1</SelectItem>
                          <SelectItem value="funcion2">Función Institucional 2</SelectItem>
                          <SelectItem value="funcion3">Función Institucional 3</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sector"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Sector</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} className="w-full">
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un sector" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ministerio">Ministerio</SelectItem>
                          <SelectItem value="secretaria">Secretaría</SelectItem>
                          <SelectItem value="instituto">Instituto</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estado"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estado</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} className="w-full">
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione un estado" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="activo">Activo</SelectItem>
                          <SelectItem value="inactivo">Inactivo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="gpr"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>GPR</FormLabel>
                      <Select onValueChange={(value) => field.onChange(value === 'true')} defaultValue={field.value.toString()} className="w-full">
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione GPR" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="true">Sí</SelectItem>
                          <SelectItem value="false">No</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="estructuraOrganizacional"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Estructura Organizacional (PDF)</FormLabel>
                      <FormControl>
                        <Input type="file" accept=".pdf" onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            field.onChange(file);
                          }
                        }} className="w-full" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nombre"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre" {...field} className="w-full" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tipoInstitucion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo Institución</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} className="w-full">
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione tipo de institución" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="publica">Pública</SelectItem>
                          <SelectItem value="privada">Privada</SelectItem>
                          <SelectItem value="mixta">Mixta</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="funcion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Función</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value} className="w-full">
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccione una función" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="ejecutiva">Ejecutiva</SelectItem>
                          <SelectItem value="legislativa">Legislativa</SelectItem>
                          <SelectItem value="judicial">Judicial</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="descripcionTipoNorma"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descripción Tipo Norma</FormLabel>
                      <FormControl>
                        <Input placeholder="Descripción Tipo Norma" {...field} className="w-full" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="mt-6 space-y-4">
              <FormField
                control={form.control}
                name="mision"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Misión</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ingrese la misión de la entidad"
                        className="w-full min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="vision"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visión</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Ingrese la visión de la entidad"
                        className="w-full min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="mt-6 flex justify-end">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Actualizando...' : 'Actualizar Información'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </Form>
  )
}

