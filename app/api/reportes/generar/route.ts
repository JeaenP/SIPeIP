import { NextResponse } from "next/server"
import { ObjectId } from "mongodb"
import clientPromise from "@/lib/mongodb"
import * as XLSX from "xlsx"

export async function POST(request: Request) {
  try {
    const { objetivoId, formato } = await request.json()

    if (!objetivoId || !formato) {
      return NextResponse.json({ error: "ID del objetivo y formato son requeridos" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("planificacion")

    // Get all required data
    const objetivo = await db.collection("objetivos").findOne({
      _id: new ObjectId(objetivoId),
    })

    if (!objetivo) {
      return NextResponse.json({ error: "Objetivo no encontrado" }, { status: 404 })
    }

    // Get program alignment
    const programaAlineado = await db.collection("programas").findOne({ _id: { $in: objetivo.programas || [] } })

    // Get PNBV alignment
    const alineacionPNBV = objetivo.alineacionPNBV || null

    // Prepare data for report
    const reportData = {
      objetivo: {
        descripcion: objetivo.descripcion,
        tipo: objetivo.tipo,
        prioridad: objetivo.prioridad,
        estado: objetivo.estado,
        estrategias: objetivo.estrategias || [],
      },
      indicadores: objetivo.indicadores || [],
      programa: programaAlineado
        ? {
            nombre: programaAlineado.nombre,
            codigoMF: programaAlineado.codigoMF,
            tipo: programaAlineado.tipo,
            monto: programaAlineado.monto,
            estado: programaAlineado.estado,
          }
        : null,
      pnbv: alineacionPNBV,
    }

    if (formato === "excel") {
      const workbook = XLSX.utils.book_new()

      // Objetivo sheet
      const objetivoSheet = [
        ["OBJETIVO ESTRATÉGICO INSTITUCIONAL"],
        ["Descripción", reportData.objetivo.descripcion],
        ["Tipo", reportData.objetivo.tipo],
        ["Prioridad", reportData.objetivo.prioridad],
        ["Estado", reportData.objetivo.estado],
        [],
        ["ESTRATEGIAS"],
        ...reportData.objetivo.estrategias.map((e: any) => [e.descripcion]),
      ]
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(objetivoSheet), "Objetivo")

      // Indicadores sheet
      const indicadoresSheet = [
        ["INDICADORES"],
        ["Nombre", "Descripción", "Unidad de Medida", "Línea Base", "Meta Total"],
        ...reportData.indicadores.map((i: any) => [
          i.nombre,
          i.descripcion,
          i.unidad_medida,
          i.linea_base,
          i.meta_total,
        ]),
      ]
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(indicadoresSheet), "Indicadores")

      // Programa sheet
      const programaSheet = reportData.programa
        ? [
            ["PROGRAMA ALINEADO"],
            ["Nombre", reportData.programa.nombre],
            ["Código MF", reportData.programa.codigoMF],
            ["Tipo", reportData.programa.tipo],
            ["Monto", reportData.programa.monto],
            ["Estado", reportData.programa.estado],
          ]
        : [["No hay programa alineado"]]
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(programaSheet), "Programa")

      // PNBV sheet
      const pnbvSheet = reportData.pnbv
        ? [
            ["ALINEACIÓN PNBV"],
            ["Objetivo", reportData.pnbv.objetivo],
            ["Política", reportData.pnbv.politica],
            ["Meta Principal", reportData.pnbv.metaPrincipal],
            ["Programa Nacional", reportData.pnbv.programaNacional],
          ]
        : [["No hay alineación PNBV"]]
      XLSX.utils.book_append_sheet(workbook, XLSX.utils.aoa_to_sheet(pnbvSheet), "PNBV")

      const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" })

      return new NextResponse(buffer, {
        headers: {
          "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
          "Content-Disposition": "attachment; filename=reporte.xlsx",
        },
      })
    } else if (formato === "pdf") {
      // Simple PDF generation without relying on external libraries
      const pdfContent = generateSimplePDF(reportData)

      return new NextResponse(pdfContent, {
        headers: {
          "Content-Type": "application/pdf",
          "Content-Disposition": "attachment; filename=reporte.pdf",
        },
      })
    }

    return NextResponse.json({ error: "Formato no soportado" }, { status: 400 })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({ error: "Error al generar el reporte" }, { status: 500 })
  }
}

function generateSimplePDF(data: any): Buffer {
  // Helper function to encode text for PDF
  function encodePDFText(text: string): string {
    return text
      .replace(/\\/g, '\\\\')
      .replace(/\(/g, '\\(')
      .replace(/\)/g, '\\)')
      .split('')
      .map(char => {
        const code = char.charCodeAt(0);
        return code > 127 ? `\\${code.toString(8)}` : char;
      })
      .join('');
  }

  // Calculate positions for xref table
  let pos = 0;
  const positions: number[] = [];

  // Basic PDF structure
  const parts: string[] = [];
  
  // Header
  parts.push('%PDF-1.4\n');
  positions.push(pos);
  pos += parts[parts.length - 1].length;

  // Catalog
  parts.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  positions.push(pos);
  pos += parts[parts.length - 1].length;

  // Pages
  parts.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
  positions.push(pos);
  pos += parts[parts.length - 1].length;

  // Page
  parts.push('3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R\n/Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>\nendobj\n');
  positions.push(pos);
  pos += parts[parts.length - 1].length;

  // Content
  const content = [
    'BT',
    '/F1 16 Tf',
    '50 750 Td',
    `(${encodePDFText('OBJETIVO ESTRATÉGICO INSTITUCIONAL')}) Tj`,
    '/F2 12 Tf',
    '0 -30 Td',
    `(${encodePDFText('Descripción: ' + data.objetivo.descripcion)}) Tj`,
    '0 -20 Td',
    `(${encodePDFText('Tipo: ' + data.objetivo.tipo)}) Tj`,
    '0 -20 Td',
    `(${encodePDFText('Prioridad: ' + data.objetivo.prioridad)}) Tj`,
    '0 -20 Td',
    `(${encodePDFText('Estado: ' + data.objetivo.estado)}) Tj`,
    '0 -40 Td',
    '/F1 14 Tf',
    `(${encodePDFText('INDICADORES')}) Tj`
  ];

  // Add indicators
  data.indicadores?.forEach((indicador: any, index: number) => {
    content.push('/F2 12 Tf');
    content.push('0 -25 Td');
    content.push(`(${encodePDFText(`${index + 1}. ${indicador.nombre}`)}) Tj`);
    content.push('0 -20 Td');
    content.push(`(${encodePDFText(`Descripción: ${indicador.descripcion}`)}) Tj`);
    content.push('0 -15 Td');
    content.push(`(${encodePDFText(`Unidad de Medida: ${indicador.unidad_medida}`)}) Tj`);
  });

  // Add program information
  if (data.programa) {
    content.push('0 -40 Td');
    content.push('/F1 14 Tf');
    content.push(`(${encodePDFText('PROGRAMA ALINEADO')}) Tj`);
    content.push('/F2 12 Tf');
    content.push('0 -25 Td');
    content.push(`(${encodePDFText('Nombre: ' + data.programa.nombre)}) Tj`);
    content.push('0 -20 Td');
    content.push(`(${encodePDFText('Código MF: ' + data.programa.codigoMF)}) Tj`);
  }

  const contentStream = content.join('\n') + '\nET';
  parts.push(`4 0 obj\n<< /Length ${contentStream.length} >>\nstream\n${contentStream}\nendstream\nendobj\n`);
  positions.push(pos);
  pos += parts[parts.length - 1].length;

  // Fonts
  parts.push('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>\nendobj\n');
  positions.push(pos);
  pos += parts[parts.length - 1].length;

  parts.push('6 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>\nendobj\n');
  positions.push(pos);
  pos += parts[parts.length - 1].length;

  // XRef table
  const xrefStart = pos;
  parts.push('xref\n');
  parts.push(`0 ${positions.length + 1}\n`);
  parts.push('0000000000 65535 f \n');
  positions.forEach(position => {
    parts.push(`${position.toString().padStart(10, '0')} 00000 n \n`);
  });

  // Trailer
  parts.push('trailer\n');
  parts.push(`<< /Size ${positions.length + 1} /Root 1 0 R >>\n`);
  parts.push('startxref\n');
  parts.push(`${xrefStart}\n`);
  parts.push('%%EOF\n');

  return Buffer.from(parts.join(''));
}

