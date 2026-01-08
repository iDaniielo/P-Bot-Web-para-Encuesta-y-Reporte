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
      survey_groups: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      surveys: {
        Row: {
          id: string;
          title: string;
          description: string | null;
          survey_group_id: string | null;
          status: 'draft' | 'active' | 'archived';
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          description?: string | null;
          survey_group_id?: string | null;
          status?: 'draft' | 'active' | 'archived';
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          description?: string | null;
          survey_group_id?: string | null;
          status?: 'draft' | 'active' | 'archived';
          created_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'surveys_survey_group_id_fkey';
            columns: ['survey_group_id'];
            referencedRelation: 'survey_groups';
            referencedColumns: ['id'];
          }
        ];
      };
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
          survey_id?: string | null;
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
          survey_id?: string | null;
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
          survey_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'encuestas_survey_id_fkey';
            columns: ['survey_id'];
            referencedRelation: 'surveys';
            referencedColumns: ['id'];
          }
        ];
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
          survey_id: string | null;
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
          survey_id?: string | null;
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
          survey_id?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'survey_questions_survey_id_fkey';
            columns: ['survey_id'];
            referencedRelation: 'surveys';
            referencedColumns: ['id'];
          }
        ];
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
export type Survey = Database['api']['Tables']['surveys']['Row'];
export type SurveyGroup = Database['api']['Tables']['survey_groups']['Row'];
