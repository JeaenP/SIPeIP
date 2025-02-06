"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Card, CardContent } from "@/components/ui/card"
import type { ObjetivoEstrategico } from "@/lib/models/types"

interface VerObjetivoProps {
  objetivo: ObjetivoEstrategico
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VerObjetivo({ objetivo, open, onOpenChange }: VerObjetivoProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalles del Objetivo Estratégico</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <Card>
            <CardContent className="pt-6">
              <div className="grid gap-4">
                <div>
                  <h3 className="font-medium mb-2">Descripción:</h3>
                  <p className="text-sm">{objetivo.descripcion}</p>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium mb-2">Tipo:</h3>
                    <p className="text-sm">{objetivo.tipo}</p>
                  </div>
                  <div>
                    <h3 className="font-medium mb-2">Prioridad:</h3>
                    <p className="text-sm">{objetivo.prioridad}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium mb-2">Estado:</h3>
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      objetivo.estado === "ELIMINADO" ? "bg-red-100 text-red-700" : "bg-green-100 text-green-700"
                    }`}
                  >
                    {objetivo.estado}
                  </span>
                </div>

                {objetivo.estrategias && objetivo.estrategias.length > 0 && (
                  <div>
                    <h3 className="font-medium mb-2">Estrategias:</h3>
                    <ul className="list-disc list-inside space-y-2">
                      {objetivo.estrategias.map((estrategia, index) => (
                        <li key={index} className="text-sm">
                          {estrategia.descripcion}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  )
}

