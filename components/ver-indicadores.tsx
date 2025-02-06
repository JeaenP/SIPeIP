"use client"

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Card, CardContent } from "@/components/ui/card"
import type { ObjetivoEstrategico } from "@/lib/models/types"

interface PropiedadesVerIndicadores {
  objetivo: ObjetivoEstrategico
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VerIndicadores({ objetivo, open, onOpenChange }: PropiedadesVerIndicadores) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Indicadores del Objetivo</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Información del objetivo */}
          <div className="p-4 bg-muted rounded-lg">
            <h3 className="font-medium mb-2">Objetivo Estratégico:</h3>
            <p className="text-sm">{objetivo.descripcion}</p>
          </div>

          {/* Lista de indicadores */}
          <div className="space-y-2">
            <h3 className="font-medium">Lista de Indicadores:</h3>
            {objetivo.indicadores && objetivo.indicadores.length > 0 ? (
              <Accordion type="single" collapsible className="w-full">
                {objetivo.indicadores.map((indicador, index) => (
                  <AccordionItem key={index} value={`indicador-${index}`}>
                    <AccordionTrigger className="hover:no-underline">
                      <div className="flex flex-col items-start text-left">
                        <span className="font-medium">{indicador.nombre}</span>
                        <span className="text-sm text-muted-foreground">
                          {indicador.unidad_medida} - Línea base: {indicador.linea_base}
                        </span>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <Card>
                        <CardContent className="p-4 space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium mb-1">Descripción</h4>
                              <p className="text-sm">{indicador.descripcion}</p>
                            </div>
                            <div>
                              <h4 className="font-medium mb-1">Fórmula</h4>
                              <p className="text-sm">{indicador.formula}</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium mb-1">Fuente de Información</h4>
                              <p className="text-sm">{indicador.fuente_informacion}</p>
                            </div>
                            <div>
                              <h4 className="font-medium mb-1">Periodicidad</h4>
                              <p className="text-sm">{indicador.periodicidad}</p>
                            </div>
                          </div>

                          <div>
                            <h4 className="font-medium mb-2">Metas</h4>
                            {indicador.metas && indicador.metas.length > 0 ? (
                              <div className="grid gap-2">
                                {indicador.metas.map((meta, metaIndex) => (
                                  <div
                                    key={metaIndex}
                                    className="flex justify-between items-center p-2 bg-muted rounded-md"
                                  >
                                    <span className="text-sm font-medium">{meta.periodo}</span>
                                    <span className="text-sm">{meta.valor}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <p className="text-sm text-muted-foreground">No hay metas definidas</p>
                            )}
                          </div>

                          <div className="grid grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium mb-1">Línea Base</h4>
                              <p className="text-sm">{indicador.linea_base}</p>
                            </div>
                            <div>
                              <h4 className="font-medium mb-1">Meta Total</h4>
                              <p className="text-sm">{indicador.meta_total}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            ) : (
              <p className="text-sm text-muted-foreground p-4">Este objetivo no tiene indicadores definidos.</p>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

