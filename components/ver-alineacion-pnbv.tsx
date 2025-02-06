"use client"

import { useState, useEffect } from "react"
import { toast } from "sonner"
import type { ObjetivoEstrategico, PNBV } from "@/lib/models/types"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import { Spinner } from "@/components/ui/spinner"

interface VerAlineacionPNBVProps {
  objetivo: ObjetivoEstrategico
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VerAlineacionPNBV({ objetivo, open, onOpenChange }: VerAlineacionPNBVProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [datosPNBV, setDatosPNBV] = useState<PNBV | null>(null)
  const [alineacionPNBV, setAlineacionPNBV] = useState<any>(null)

  useEffect(() => {
    if (open) {
      cargarDatos()
    }
  }, [open])

  const cargarDatos = async () => {
    try {
      // Cargar datos del PNBV
      const respuestaPNBV = await fetch("/api/pnbv")
      if (!respuestaPNBV.ok) throw new Error("Error al cargar PNBV")
      const pnbvs = await respuestaPNBV.json()
      if (pnbvs && pnbvs.length > 0) {
        setDatosPNBV(pnbvs[0])
      }

      // Cargar alineación PNBV existente
      const respuestaAlineacionPNBV = await fetch(`/api/objetivos/${objetivo._id}/pnbv`)
      if (respuestaAlineacionPNBV.ok) {
        const datosAlineacionPNBV = await respuestaAlineacionPNBV.json()
        setAlineacionPNBV(datosAlineacionPNBV)
      }
    } catch (error) {
      console.error("Error al cargar datos:", error)
      toast.error("Error al cargar los datos")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Alineación Plan Nacional</DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Spinner />
          </div>
        ) : (
          <div className="space-y-6">
            <div className="p-4 bg-muted rounded-lg">
              <h3 className="font-medium mb-2">Objetivo Estratégico:</h3>
              <p className="text-sm">{objetivo.descripcion}</p>
            </div>

            <Card>
              <CardContent className="pt-6 space-y-4">
                {alineacionPNBV ? (
                  <>
                    <div>
                      <h4 className="font-medium mb-2">Objetivo del Plan Nacional:</h4>
                      <p className="text-sm">
                        Objetivo {alineacionPNBV.objetivoId}: {alineacionPNBV.objetivo}
                      </p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Política:</h4>
                      <p className="text-sm">{alineacionPNBV.politica}</p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Meta Principal:</h4>
                      <p className="text-sm">{alineacionPNBV.metaPrincipal}</p>
                    </div>

                    <div>
                      <h4 className="font-medium mb-2">Programa Nacional:</h4>
                      <p className="text-sm">{alineacionPNBV.programaNacional}</p>
                    </div>
                  </>
                ) : (
                  <p className="text-center text-muted-foreground py-4">
                    No hay alineación PNBV registrada para este objetivo
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

