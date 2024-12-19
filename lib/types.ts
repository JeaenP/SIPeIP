export interface Entidad {
  _id?: string
  codigoADM: string
  codigoEntidadFinanciera: string
  consejo: string
  descripcionTipoNorma: string
  estado: string
  estructuraOrganizacional: string
  funcion: string
  funcionInstitucional: string
  gpr: boolean
  mision: string
  nombre: string
  nombreEnteSector: string
  numeroEntidad: number
  numeroRegistroOficial: number
  programas: string[]
  razonSocial: string
  rucEntidad: string
  sector: string
  tipoInstitucion: string
  tipoNorma: string
  vision: string
  zona: string
}

export interface Programa {
  _id?: string
  numero: number
  nombre: string
  estado: 'ACTIVO' | 'INACTIVO'
  descripcion: string
  tipo: 'INSTITUCIONAL' | 'OTRO'
  monto: number
  proyectos: string[]
  productos: string[]
  rucEntidad: string
  codigoMF: string
  entidad: string
}

export interface Proyecto {
  _id?: string
  cup: string
  nombre: string
  monto: number
  rucEntidad: string
}

export interface Producto {
  _id?: string
  nombre: string
  descripcion: string
  programaId: string
  rucEntidad: string
}

export interface Perfil {
  _id?: string
  nombre: string
}

export interface Usuario {
  _id?: string
  cedula: string
  contraseña: string
  ruc: string
  rucEntidad: string
  tipoUsuario: string
}

