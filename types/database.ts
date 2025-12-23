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
        };
        Insert: {
          id?: string;
          created_at?: string;
          nombre: string;
          telefono: string;
          regalo: string | string[];
          regalo_otro?: string | null;
          lugar_compra: string;
          gasto: string;
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
