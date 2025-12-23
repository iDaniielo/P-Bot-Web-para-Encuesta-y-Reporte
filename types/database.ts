export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  api: {
    Tables: {
      encuestas: {
        Row: {
          id: string;
          created_at: string;
          nombre: string;
          telefono: string;
          regalo: string | string[];
          regalo_otro?: string | null;
          lugar_compra: string;
          gasto: string;
          respuestas?: Json;
        };
        Insert: {
          id?: string;
          created_at?: string;
          nombre: string;
          telefono: string;
          regalo: string | string[];
          regalo_otro?: string | null;
          lugar_compra?: string;
          gasto?: string;
          respuestas?: Json;
        };
        Update: {
          id?: string;
          created_at?: string;
          nombre?: string;
          telefono?: string;
          regalo?: string | string[];
          regalo_otro?: string | null;
          lugar_compra?: string;
          gasto?: string;
          respuestas?: Json;
        };
        Relationships: [];
      };
      survey_questions: {
        Row: {
          id: string;
          question_text: string;
          question_key: string;
          question_type: 'text' | 'phone' | 'checkbox' | 'radio' | 'select';
          options: Json | null;
          validation_rules: Json | null;
          order_index: number;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          question_text: string;
          question_key: string;
          question_type: 'text' | 'phone' | 'checkbox' | 'radio' | 'select';
          options?: Json | null;
          validation_rules?: Json | null;
          order_index?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          question_text?: string;
          question_key?: string;
          question_type?: 'text' | 'phone' | 'checkbox' | 'radio' | 'select';
          options?: Json | null;
          validation_rules?: Json | null;
          order_index?: number;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

export type Encuesta = Database['api']['Tables']['encuestas']['Row'];
export type SurveyQuestion = Database['api']['Tables']['survey_questions']['Row'];
