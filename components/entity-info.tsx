"use client"

import { useEffect, useState } from "react"
import type { Entidad } from "@/lib/models/types"

interface EntityInfoProps {
  rucEntidad: string
}

export function EntityInfo({ rucEntidad }: EntityInfoProps) {
  const [entityData, setEntityData] = useState<Entidad | null>(null)

  useEffect(() => {
    async function loadEntityData() {
      try {
        const response = await fetch(`/api/entidades/${rucEntidad}`)
        if (response.ok) {
          const data = await response.json()
          setEntityData(data)
        }
      } catch (error) {
        console.error('Error loading entity data:', error)
      }
    }

    if (rucEntidad) {
      loadEntityData()
    }
  }, [rucEntidad])

  if (!entityData) {
    return null
  }

  return (
    <>
      <p className="text-sm text-muted-foreground">{entityData.razonSocial}</p>
      <p className="text-xs text-muted-foreground">RUC: {entityData.rucEntidad}</p>
    </>
  )
}

