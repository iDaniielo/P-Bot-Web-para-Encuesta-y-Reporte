'use client';

import { useState } from 'react';
import { MessageCircle, X, ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface FAQ {
  question: string;
  answer: string;
  category: 'general' | 'questions' | 'dashboard';
}

const faqs: FAQ[] = [
  {
    question: '¿Cómo agrego una nueva pregunta?',
    answer: 'Ve a la pestaña "Gestión de Preguntas" y haz clic en el botón "Nueva Pregunta" en la parte superior derecha. Completa el formulario con el texto de la pregunta, la clave única, el tipo de pregunta y las opciones si aplica.',
    category: 'questions',
  },
  {
    question: '¿Qué tipos de preguntas puedo crear?',
    answer: 'Puedes crear 5 tipos de preguntas: Texto (respuesta libre), Teléfono (validación de número), Checkbox (selección múltiple), Radio (selección única), y Select (lista desplegable).',
    category: 'questions',
  },
  {
    question: '¿Cómo reordeno las preguntas?',
    answer: 'Usa los botones de flechas (↑ ↓) al lado derecho de cada pregunta para moverlas hacia arriba o abajo. El orden determina cómo se muestran en la encuesta.',
    category: 'questions',
  },
  {
    question: '¿Qué es la "clave única" de una pregunta?',
    answer: 'Es un identificador único para cada pregunta (ej: "nombre", "telefono"). Solo puede contener letras minúsculas, números y guiones bajos. Puedes usar el botón "Auto-generar" para crear una automáticamente.',
    category: 'questions',
  },
  {
    question: '¿Puedo usar plantillas predefinidas?',
    answer: 'Sí, al crear una nueva pregunta verás plantillas rápidas en la parte superior. Haz clic en cualquiera para usarla como base y luego personalizarla.',
    category: 'questions',
  },
  {
    question: '¿Cómo agrego opciones a una pregunta tipo checkbox/radio/select?',
    answer: 'Al seleccionar estos tipos, aparecerá un campo de texto donde puedes escribir las opciones, una por línea. Por ejemplo:\nOpción 1\nOpción 2\nOpción 3',
    category: 'questions',
  },
  {
    question: '¿Cómo desactivo una pregunta temporalmente?',
    answer: 'Al editar una pregunta, desmarca la casilla "Pregunta activa". La pregunta permanecerá en el sistema pero no se mostrará en la encuesta.',
    category: 'questions',
  },
  {
    question: '¿Puedo duplicar una pregunta existente?',
    answer: 'Sí, usa el botón de copiar (icono de doble cuadrado) al lado de cada pregunta. Se creará una copia que podrás modificar antes de guardar.',
    category: 'questions',
  },
  {
    question: '¿Cómo elimino una pregunta?',
    answer: 'Haz clic en el botón de basura (🗑️) al lado de la pregunta. Ten cuidado, esta acción no se puede deshacer. Se te pedirá confirmación antes de eliminar.',
    category: 'questions',
  },
  {
    question: '¿Cómo exporto los datos de las encuestas?',
    answer: 'En la pestaña Dashboard, haz clic en el botón "Descargar Excel" en la parte superior. Se generará un archivo Excel con todas las respuestas de las encuestas.',
    category: 'dashboard',
  },
  {
    question: '¿Qué significan las métricas del dashboard?',
    answer: 'El dashboard muestra: Total de Respuestas (cuántas personas completaron la encuesta), Gasto Promedio (promedio estimado de presupuestos), Regalo Más Popular (el más seleccionado), y Lugar Más Popular (donde más compran).',
    category: 'dashboard',
  },
  {
    question: '¿Los números de teléfono están protegidos?',
    answer: 'Sí, los números de teléfono se enmascaran en el dashboard mostrando solo los primeros 2 y últimos 4 dígitos (ej: 55****4567) para proteger la privacidad de los usuarios.',
    category: 'general',
  },
];

export default function FAQChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const toggleChat = () => setIsOpen(!isOpen);

  const toggleQuestion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };

  const filteredFAQs = selectedCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  return (
    <>
      {/* Floating Button */}
      {!isOpen && (
        <button
          onClick={toggleChat}
          className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-all duration-300 hover:scale-110 z-50"
          aria-label="Abrir chat de ayuda"
        >
          <MessageCircle className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">
            ?
          </span>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 w-96 max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl z-50 flex flex-col max-h-[600px] border border-gray-200">
          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 rounded-t-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-white/20 rounded-full p-2">
                <HelpCircle className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-lg">Centro de Ayuda</h3>
                <p className="text-xs text-blue-100">Preguntas Frecuentes</p>
              </div>
            </div>
            <button
              onClick={toggleChat}
              className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
              aria-label="Cerrar chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Category Filter */}
          <div className="p-3 border-b border-gray-200 bg-gray-50">
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Todos ({faqs.length})
              </button>
              <button
                onClick={() => setSelectedCategory('questions')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === 'questions'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Preguntas ({faqs.filter(f => f.category === 'questions').length})
              </button>
              <button
                onClick={() => setSelectedCategory('dashboard')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === 'dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Dashboard ({faqs.filter(f => f.category === 'dashboard').length})
              </button>
              <button
                onClick={() => setSelectedCategory('general')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === 'general'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                General ({faqs.filter(f => f.category === 'general').length})
              </button>
            </div>
          </div>

          {/* FAQ List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map((faq, index) => (
                <div
                  key={index}
                  className="border border-gray-200 rounded-lg overflow-hidden hover:border-blue-300 transition-colors"
                >
                  <button
                    onClick={() => toggleQuestion(index)}
                    className="w-full text-left p-3 hover:bg-gray-50 transition-colors flex items-center justify-between gap-2"
                  >
                    <span className="font-medium text-gray-900 text-sm flex-1">
                      {faq.question}
                    </span>
                    {expandedIndex === index ? (
                      <ChevronUp className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-gray-500 flex-shrink-0" />
                    )}
                  </button>
                  {expandedIndex === index && (
                    <div className="p-3 pt-0 text-sm text-gray-600 whitespace-pre-line border-t border-gray-100 bg-blue-50">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                <HelpCircle className="w-12 h-12 mx-auto mb-2 text-gray-400" />
                <p className="text-sm">No hay preguntas en esta categoría</p>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            <p className="text-xs text-center text-gray-600">
              ¿No encuentras lo que buscas?{' '}
              <a
                href="mailto:support@example.com"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Contáctanos
              </a>
            </p>
          </div>
        </div>
      )}
    </>
  );
}
