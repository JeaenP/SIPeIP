"use client"

import { FileDown } from "lucide-react"
import { toast } from "sonner"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"

interface GenerarReporteProps {
  objetivoId: string
}

export function GenerarReporte({ objetivoId }: GenerarReporteProps) {
  const handleGenerarReporte = async (formato: "excel" | "pdf") => {
    try {
      const response = await fetch("/api/reportes/generar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          objetivoId,
          formato,
        }),
      })

      if (!response.ok) throw new Error("Error al generar reporte")

      // Get filename from Content-Disposition header
      const contentDisposition = response.headers.get("Content-Disposition")
      const filename = contentDisposition ? contentDisposition.split("filename=")[1] : `reporte.${formato}`

      // Convert response to blob
      const blob = await response.blob()

      // Create download link
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = filename
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success("Reporte generado exitosamente")
    } catch (error) {
      console.error("Error:", error)
      toast.error("Error al generar el reporte")
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <FileDown className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleGenerarReporte("excel")}>Exportar a Excel</DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleGenerarReporte("pdf")}>Exportar a PDF</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

