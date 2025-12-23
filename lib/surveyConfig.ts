import { FormField } from './types';

export const surveyFields: FormField[] = [
  {
    name: 'nombre',
    label: '¿Cuál es tu nombre?',
    type: 'text',
    placeholder: 'Ej: Juan Pérez',
    required: true,
  },
  {
    name: 'telefono',
    label: '¿Cuál es tu número de teléfono?',
    type: 'tel',
    placeholder: 'Ej: +34 600 000 000',
    required: true,
  },
  {
    name: 'regalo',
    label: '¿Qué tipo de regalo prefieres?',
    type: 'select',
    options: ['Electrónica', 'Ropa', 'Juguetes', 'Libros', 'Deportes', 'Hogar', 'Otro'],
    required: true,
  },
  {
    name: 'lugar',
    label: '¿Dónde prefieres comprar?',
    type: 'select',
    options: ['Tienda física', 'Online', 'Ambos', 'Mercado local'],
    required: true,
  },
  {
    name: 'gasto',
    label: '¿Cuánto sueles gastar? (€)',
    type: 'number',
    placeholder: 'Ej: 50',
    required: true,
    min: 0,
    max: 10000,
  },
];
