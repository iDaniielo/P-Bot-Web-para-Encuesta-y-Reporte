export interface SurveyResponse {
  id?: number;
  created_at?: string;
  [key: string]: any; // Permitir campos dinámicos
}

export interface FormField {
  name: string;
  label: string;
  type: 'text' | 'tel' | 'number' | 'select';
  placeholder?: string;
  options?: string[];
  required?: boolean;
  min?: number;
  max?: number;
}
