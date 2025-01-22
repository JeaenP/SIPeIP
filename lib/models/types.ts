// Interfaces para el Plan Nacional del Buen Vivir
export interface PNBV {
  _id?: string
  plan: string
  objetivos: ObjetivoPNBV[]
}

export interface ObjetivoPNBV {
  numero: number
  nombre: string
  politicas: PoliticaPNBV[]
  metas: MetaPNBV[]
}

export interface PoliticaPNBV {
  numero: number
  descripcion: string
}

export interface MetaPNBV {
  numero: number
  descripcion: string
}

// Interfaces para Programas y Proyectos
export interface Programa {
  _id?: string
  nombre: string
  descripcion: string
  codigoMF: string
  tipo: string
  estado: string
  monto: number
  rucEntidad: string
  alineadoOEI: boolean
  proyectos?: string[] // Array de IDs de proyectos
}

export interface Proyecto {
  _id?: string
  cup: string // Código Único de Proyecto
  nombre: string
  monto: number
  estado?: string
  descripcion?: string
  asignado?: string
}

// Interfaces para Alineación y Objetivos
export interface PNBVAlineacion {
  objetivoId: string
  objetivo: string
  politica: string
  metaPrincipal: string
  programaNacional: string
}

export interface ObjetivoEstrategico {
  _id?: string
  descripcion: string
  tipo: string
  prioridad: string
  estado: string
  estrategias: Estrategia[]
  indicadores: Indicador[]
  programas?: string[]
  rucEntidad: string
  alineacionPNBV?: PNBVAlineacion
}

// Interfaces para Estrategias e Indicadores
export interface Estrategia {
  descripcion: string
}

export interface Indicador {
  nombre: string
  descripcion: string
  unidad_medida: string
  patron: string
  linea_base: number
  fecha_linea_base: string
  meta_total: number
  fuente_informacion: string
  periodicidad: "ANUAL" | "SEMESTRAL" | "TRIMESTRAL" | "MENSUAL"
  metas?: Meta[]
}

export interface Meta {
  periodo: string
  valor: number
}

