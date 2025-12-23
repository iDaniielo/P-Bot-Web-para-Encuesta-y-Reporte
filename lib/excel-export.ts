import * as XLSX from 'xlsx';
import type { Encuesta } from '@/types/database';

// Helper function to get the average from spending ranges
const getAverageFromRange = (range: string): number => {
  const match = range.match(/\$?(\d+)-?\$?(\d+)?/);
  if (!match) {
    if (range.toLowerCase().includes('menos')) return 250;
    if (range.toLowerCase().includes('más')) return 7500;
    return 0;
  }
  const low = parseInt(match[1]);
  const high = match[2] ? parseInt(match[2]) : low * 2;
  return (low + high) / 2;
};

export const exportToExcel = (encuestas: Encuesta[], fileName: string = 'reporte-encuestas') => {
  if (!encuestas || encuestas.length === 0) {
    alert('No hay datos para exportar');
    return;
  }

  // Preparar los datos para el resumen
  const totalEncuestas = encuestas.length;

  // Top 3 Regalos por frecuencia - Handle arrays
  const giftCounts = encuestas.reduce((acc, curr) => {
    let regalos: string[] = [];
    
    if (typeof curr.regalo === 'string') {
      try {
        if (curr.regalo.startsWith('[')) {
          regalos = JSON.parse(curr.regalo);
        } else {
          regalos = [curr.regalo];
        }
      } catch {
        regalos = [curr.regalo];
      }
    } else if (Array.isArray(curr.regalo)) {
      regalos = curr.regalo;
    } else {
      regalos = [String(curr.regalo)];
    }
    
    // Count each gift individually
    regalos.forEach(regalo => {
      if (regalo === 'Otro' && curr.regalo_otro) {
        acc[curr.regalo_otro] = (acc[curr.regalo_otro] || 0) + 1;
      } else if (regalo !== 'Otro') {
        acc[regalo] = (acc[regalo] || 0) + 1;
      }
    });
    
    return acc;
  }, {} as Record<string, number>);

  const top3Gifts = Object.entries(giftCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // Top 3 Lugares de compra por frecuencia
  const placeCounts = encuestas.reduce((acc, curr) => {
    acc[curr.lugar_compra] = (acc[curr.lugar_compra] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const top3Places = Object.entries(placeCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);

  // Gasto promedio
  const totalSpending = encuestas.reduce((sum, curr) => {
    return sum + getAverageFromRange(curr.gasto);
  }, 0);
  const avgSpending = totalEncuestas > 0 ? totalSpending / totalEncuestas : 0;

  // Distribución de gastos
  const gastoDistribution = encuestas.reduce((acc, curr) => {
    acc[curr.gasto] = (acc[curr.gasto] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Crear hoja de resumen ejecutivo
  const summaryData = [
    ['RESUMEN EJECUTIVO - ENCUESTA NAVIDEÑA'],
    [''],
    ['Fecha de Generación:', new Date().toLocaleString('es-MX')],
    ['Total de Respuestas:', totalEncuestas],
    ['Gasto Promedio:', `$${avgSpending.toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`],
    [''],
    ['TOP 3 REGALOS MÁS POPULARES'],
    ['Posición', 'Regalo', 'Cantidad'],
    ...top3Gifts.map((gift, index) => [`#${index + 1}`, gift[0], gift[1]]),
    [''],
    ['TOP 3 LUGARES DE COMPRA'],
    ['Posición', 'Lugar', 'Cantidad'],
    ...top3Places.map((place, index) => [`#${index + 1}`, place[0], place[1]]),
    [''],
    ['DISTRIBUCIÓN DE GASTOS'],
    ['Rango de Gasto', 'Cantidad'],
    ...Object.entries(gastoDistribution).map(([range, count]) => [range, count]),
  ];

  // Crear hoja de datos detallados
  const detailedData = [
    ['ID', 'Fecha', 'Nombre', 'Teléfono', 'Regalo', 'Lugar de Compra', 'Rango de Gasto', 'Gasto Promedio Estimado']
  ];

  encuestas.forEach((encuesta) => {
    // Process regalo field
    let regalosDisplay = '';
    if (typeof encuesta.regalo === 'string') {
      try {
        if (encuesta.regalo.startsWith('[')) {
          const regalos = JSON.parse(encuesta.regalo);
          regalosDisplay = regalos.map((r: string) => 
            r === 'Otro' && encuesta.regalo_otro ? encuesta.regalo_otro : r
          ).join(', ');
        } else {
          regalosDisplay = encuesta.regalo;
        }
      } catch {
        regalosDisplay = encuesta.regalo;
      }
    } else if (Array.isArray(encuesta.regalo)) {
      regalosDisplay = encuesta.regalo.map((r: string) => 
        r === 'Otro' && encuesta.regalo_otro ? encuesta.regalo_otro : r
      ).join(', ');
    } else {
      regalosDisplay = String(encuesta.regalo);
    }
    
    detailedData.push([
      encuesta.id,
      new Date(encuesta.created_at).toLocaleString('es-MX'),
      encuesta.nombre || 'N/A',
      encuesta.telefono || 'N/A',
      regalosDisplay,
      encuesta.lugar_compra,
      encuesta.gasto,
      `$${getAverageFromRange(encuesta.gasto).toLocaleString('es-MX', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    ]);
  });

  // Crear libro de trabajo con múltiples hojas
  const wb = XLSX.utils.book_new();
  
  // Agregar hoja de resumen
  const wsSummary = XLSX.utils.aoa_to_sheet(summaryData);
  
  // Ajustar anchos de columna para el resumen
  wsSummary['!cols'] = [
    { wch: 30 }, // Columna A
    { wch: 40 }, // Columna B
    { wch: 15 }  // Columna C
  ];
  
  XLSX.utils.book_append_sheet(wb, wsSummary, 'Resumen Ejecutivo');

  // Agregar hoja de datos detallados
  const wsDetailed = XLSX.utils.aoa_to_sheet(detailedData);
  
  // Ajustar anchos de columna para los detalles
  wsDetailed['!cols'] = [
    { wch: 10 }, // ID
    { wch: 20 }, // Fecha
    { wch: 15 }, // Teléfono
    { wch: 30 }, // Correo
    { wch: 30 }, // Regalo
    { wch: 30 }, // Lugar de Compra
    { wch: 20 }, // Rango de Gasto
    { wch: 25 }  // Gasto Promedio Estimado
  ];
  
  XLSX.utils.book_append_sheet(wb, wsDetailed, 'Datos Detallados');

  // Crear hoja de análisis por regalo
  const giftAnalysis = [
    ['ANÁLISIS POR REGALO'],
    [''],
    ['Regalo', 'Cantidad', 'Porcentaje']
  ];
  
  Object.entries(giftCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([gift, count]) => {
      const percentage = ((count / totalEncuestas) * 100).toFixed(2);
      giftAnalysis.push([gift, count.toString(), `${percentage}%`]);
    });

  const wsGiftAnalysis = XLSX.utils.aoa_to_sheet(giftAnalysis);
  wsGiftAnalysis['!cols'] = [{ wch: 40 }, { wch: 15 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, wsGiftAnalysis, 'Análisis por Regalo');

  // Crear hoja de análisis por lugar
  const placeAnalysis = [
    ['ANÁLISIS POR LUGAR DE COMPRA'],
    [''],
    ['Lugar', 'Cantidad', 'Porcentaje']
  ];
  
  Object.entries(placeCounts)
    .sort((a, b) => b[1] - a[1])
    .forEach(([place, count]) => {
      const percentage = ((count / totalEncuestas) * 100).toFixed(2);
      placeAnalysis.push([place, count.toString(), `${percentage}%`]);
    });

  const wsPlaceAnalysis = XLSX.utils.aoa_to_sheet(placeAnalysis);
  wsPlaceAnalysis['!cols'] = [{ wch: 40 }, { wch: 15 }, { wch: 15 }];
  XLSX.utils.book_append_sheet(wb, wsPlaceAnalysis, 'Análisis por Lugar');

  // Generar archivo y descargar
  const timestamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `${fileName}_${timestamp}.xlsx`);
};
