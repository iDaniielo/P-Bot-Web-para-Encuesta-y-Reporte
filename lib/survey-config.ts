import { z } from 'zod';

export interface SurveyQuestion {
  id: string;
  type: 'text' | 'tel' | 'select' | 'radio';
  question: string;
  placeholder?: string;
  options?: string[];
  validation: z.ZodType<string>;
}

// Zod validation schemas with strict phone validation for Mexico
export const surveySchema = z.object({
  nombre: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  telefono: z.string().regex(/^\d{10}$/, 'El teléfono debe tener exactamente 10 dígitos (sin espacios ni guiones)'),
  regalo: z.string().min(1, 'Este campo es requerido'),
  lugar_compra: z.string().min(1, 'Selecciona una opción'),
  gasto: z.string().min(1, 'Selecciona un rango'),
});

export type SurveyFormData = z.infer<typeof surveySchema>;

// Survey questions configuration - 100% reusable and dynamic
export const surveyQuestions: SurveyQuestion[] = [
  {
    id: 'nombre',
    type: 'text',
    question: '¿Cuál es tu nombre?',
    placeholder: 'Ej: Juan Pérez',
    validation: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  },
  {
    id: 'telefono',
    type: 'tel',
    question: '¿Cuál es tu número de teléfono?',
    placeholder: 'Ej: 5551234567 (10 dígitos)',
    validation: z.string().regex(/^\d{10}$/, 'El teléfono debe tener exactamente 10 dígitos (sin espacios ni guiones)'),
  },
  {
    id: 'regalo',
    type: 'text',
    question: '¿Qué vas a regalar esta Navidad?',
    placeholder: 'Ej: Juguetes, ropa, electrónicos...',
    validation: z.string().min(1, 'Este campo es requerido'),
  },
  {
    id: 'lugar_compra',
    type: 'select',
    question: '¿Dónde comprarás los regalos?',
    options: [
      'Tienda Online (Amazon, MercadoLibre, etc.)',
      'Centro Comercial',
      'Tienda Local',
      'Supermercado',
      'Tienda Departamental',
      'Otro',
    ],
    validation: z.string().min(1, 'Selecciona una opción'),
  },
  {
    id: 'gasto',
    type: 'radio',
    question: '¿Cuánto planeas gastar en total?',
    options: [
      'Menos de $500',
      '$500-$1000',
      '$1000-$2000',
      '$2000-$5000',
      'Más de $5000',
    ],
    validation: z.string().min(1, 'Selecciona un rango'),
  },
];
