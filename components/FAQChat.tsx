'use client';

import { useState, useMemo } from 'react';
import { MessageCircle, X, ChevronDown, ChevronUp, HelpCircle, Send, Loader2 } from 'lucide-react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  category: 'general' | 'questions' | 'dashboard';
}

const faqs: FAQ[] = [
  {
    id: 'q1',
    question: '¿Cómo agrego una nueva pregunta?',
    answer: 'Ve a la pestaña "Gestión de Preguntas" y haz clic en el botón "Nueva Pregunta" en la parte superior derecha. Completa el formulario con el texto de la pregunta, la clave única, el tipo de pregunta y las opciones si aplica.',
    category: 'questions',
  },
  {
    id: 'q2',
    question: '¿Qué tipos de preguntas puedo crear?',
    answer: 'Puedes crear 5 tipos de preguntas: Texto (respuesta libre), Teléfono (validación de número), Checkbox (selección múltiple), Radio (selección única), y Select (lista desplegable).',
    category: 'questions',
  },
  {
    id: 'q3',
    question: '¿Cómo reordeno las preguntas?',
    answer: 'Usa los botones de flechas (↑ ↓) al lado derecho de cada pregunta para moverlas hacia arriba o abajo. El orden determina cómo se muestran en la encuesta.',
    category: 'questions',
  },
  {
    id: 'q4',
    question: '¿Qué es la "clave única" de una pregunta?',
    answer: 'Es un identificador único para cada pregunta (ej: "nombre", "telefono"). Solo puede contener letras minúsculas, números y guiones bajos. Puedes usar el botón "Auto-generar" para crear una automáticamente.',
    category: 'questions',
  },
  {
    id: 'q5',
    question: '¿Puedo usar plantillas predefinidas?',
    answer: 'Sí, al crear una nueva pregunta verás plantillas rápidas en la parte superior. Haz clic en cualquiera para usarla como base y luego personalizarla.',
    category: 'questions',
  },
  {
    id: 'q6',
    question: '¿Cómo agrego opciones a una pregunta tipo checkbox/radio/select?',
    answer: 'Al seleccionar estos tipos, aparecerá un campo de texto donde puedes escribir las opciones, una por línea. Por ejemplo:\nOpción 1\nOpción 2\nOpción 3',
    category: 'questions',
  },
  {
    id: 'q7',
    question: '¿Cómo desactivo una pregunta temporalmente?',
    answer: 'Al editar una pregunta, desmarca la casilla "Pregunta activa". La pregunta permanecerá en el sistema pero no se mostrará en la encuesta.',
    category: 'questions',
  },
  {
    id: 'q8',
    question: '¿Puedo duplicar una pregunta existente?',
    answer: 'Sí, usa el botón de copiar (icono de doble cuadrado) al lado de cada pregunta. Se creará una copia que podrás modificar antes de guardar.',
    category: 'questions',
  },
  {
    id: 'q9',
    question: '¿Cómo elimino una pregunta?',
    answer: 'Haz clic en el botón de basura (🗑️) al lado de la pregunta. Ten cuidado, esta acción no se puede deshacer. Se te pedirá confirmación antes de eliminar.',
    category: 'questions',
  },
  {
    id: 'd1',
    question: '¿Cómo exporto los datos de las encuestas?',
    answer: 'En la pestaña Dashboard, haz clic en el botón "Descargar Excel" en la parte superior. Se generará un archivo Excel con todas las respuestas de las encuestas.',
    category: 'dashboard',
  },
  {
    id: 'd2',
    question: '¿Qué significan las métricas del dashboard?',
    answer: 'El dashboard muestra: Total de Respuestas (cuántas personas completaron la encuesta), Gasto Promedio (promedio estimado de presupuestos), Regalo Más Popular (el más seleccionado), y Lugar Más Popular (donde más compran).',
    category: 'dashboard',
  },
  {
    id: 'g1',
    question: '¿Los números de teléfono están protegidos?',
    answer: 'Sí, los números de teléfono se enmascaran en el dashboard mostrando solo los primeros 2 y últimos 4 dígitos (ej: 55****4567) para proteger la privacidad de los usuarios.',
    category: 'general',
  },
];

export default function FAQChat() {
  const [isOpen, setIsOpen] = useState(false);
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showContactForm, setShowContactForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });
  
  const [formErrors, setFormErrors] = useState({
    name: '',
    email: '',
    message: '',
  });

  const toggleChat = () => setIsOpen(!isOpen);

  const toggleQuestion = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };
  
  const validateForm = (): boolean => {
    const errors = {
      name: '',
      email: '',
      message: '',
    };
    
    let isValid = true;
    
    if (!formData.name.trim()) {
      errors.name = 'El nombre es requerido';
      isValid = false;
    }
    
    if (!formData.email.trim()) {
      errors.email = 'El email es requerido';
      isValid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = 'Email inválido';
      isValid = false;
    }
    
    if (!formData.message.trim()) {
      errors.message = 'El mensaje es requerido';
      isValid = false;
    }
    
    setFormErrors(errors);
    return isValid;
  };
  
  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitError(null);
    setSubmitSuccess(false);
    
    try {
      const response = await fetch('/api/contact-support', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Error al enviar la solicitud');
      }
      
      // Success
      setSubmitSuccess(true);
      setFormData({ name: '', email: '', phone: '', message: '' });
      setFormErrors({ name: '', email: '', message: '' });
      
      // Close form after 2 seconds
      setTimeout(() => {
        setShowContactForm(false);
        setSubmitSuccess(false);
      }, 2000);
      
    } catch (error) {
      console.error('Error submitting contact form:', error);
      setSubmitError(
        error instanceof Error 
          ? error.message 
          : 'Error de red. Por favor, verifica tu conexión e intenta nuevamente.'
      );
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error for this field
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const filteredFAQs = selectedCategory === 'all' 
    ? faqs 
    : faqs.filter(faq => faq.category === selectedCategory);

  // Memoize category counts to avoid recalculating on every render
  const categoryCounts = useMemo(() => ({
    all: faqs.length,
    questions: faqs.filter(f => f.category === 'questions').length,
    dashboard: faqs.filter(f => f.category === 'dashboard').length,
    general: faqs.filter(f => f.category === 'general').length,
  }), []);

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
                Todos ({categoryCounts.all})
              </button>
              <button
                onClick={() => setSelectedCategory('questions')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === 'questions'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Preguntas ({categoryCounts.questions})
              </button>
              <button
                onClick={() => setSelectedCategory('dashboard')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === 'dashboard'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                Dashboard ({categoryCounts.dashboard})
              </button>
              <button
                onClick={() => setSelectedCategory('general')}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  selectedCategory === 'general'
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-300'
                }`}
              >
                General ({categoryCounts.general})
              </button>
            </div>
          </div>

          {/* FAQ List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {!showContactForm ? (
              <>
                {filteredFAQs.length > 0 ? (
                  filteredFAQs.map((faq, index) => (
                    <div
                      key={faq.id}
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
              </>
            ) : (
              <>
                {/* Contact Form */}
                <div className="mb-4">
                  <button
                    onClick={() => {
                      setShowContactForm(false);
                      setSubmitError(null);
                      setSubmitSuccess(false);
                    }}
                    className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                  >
                    ← Volver a FAQ
                  </button>
                </div>
                
                {submitSuccess ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <div className="text-green-600 text-4xl mb-2">✓</div>
                    <p className="text-green-800 font-medium">¡Solicitud enviada!</p>
                    <p className="text-green-600 text-sm mt-1">Nos pondremos en contacto pronto.</p>
                  </div>
                ) : (
                  <form onSubmit={handleContactSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                        Nombre <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          formErrors.name ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={isSubmitting}
                      />
                      {formErrors.name && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                        Email <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                          formErrors.email ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={isSubmitting}
                      />
                      {formErrors.email && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.email}</p>
                      )}
                    </div>
                    
                    <div>
                      <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                        Teléfono (opcional)
                      </label>
                      <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isSubmitting}
                      />
                    </div>
                    
                    <div>
                      <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-1">
                        Mensaje <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        id="message"
                        name="message"
                        value={formData.message}
                        onChange={handleInputChange}
                        rows={4}
                        className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${
                          formErrors.message ? 'border-red-500' : 'border-gray-300'
                        }`}
                        disabled={isSubmitting}
                      />
                      {formErrors.message && (
                        <p className="text-red-500 text-xs mt-1">{formErrors.message}</p>
                      )}
                    </div>
                    
                    {submitError && (
                      <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                        <p className="text-red-800 text-sm">{submitError}</p>
                      </div>
                    )}
                    
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          Enviar Solicitud
                        </>
                      )}
                    </button>
                  </form>
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-gray-200 bg-gray-50">
            {!showContactForm ? (
              <button
                onClick={() => setShowContactForm(true)}
                className="w-full text-sm text-center text-blue-600 hover:text-blue-700 font-medium flex items-center justify-center gap-2 py-2 hover:bg-blue-50 rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
                ¿No encuentras lo que buscas? Contáctanos
              </button>
            ) : (
              <p className="text-xs text-center text-gray-600">
                Completa el formulario y te responderemos pronto
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
