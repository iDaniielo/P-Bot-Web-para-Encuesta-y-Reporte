export interface SurveyResponse {
  id?: number;
  nombre: string;
  telefono: string;
  regalo: string;
  lugar: string;
  gasto: number;
  created_at?: string;
}

export interface FormField {
  name: keyof Omit<SurveyResponse, 'id' | 'created_at'>;
  label: string;
  type: 'text' | 'tel' | 'number' | 'select';
  placeholder?: string;
  options?: string[];
  required?: boolean;
  min?: number;
  max?: number;
}
