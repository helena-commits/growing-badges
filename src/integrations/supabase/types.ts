export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4"
  }
  public: {
    Tables: {
      badges: {
        Row: {
          back_output_url: string | null
          created_at: string
          full_name: string
          id: string
          output_url: string | null
          photo_url: string | null
          role: string
          template_id: string | null
        }
        Insert: {
          back_output_url?: string | null
          created_at?: string
          full_name: string
          id?: string
          output_url?: string | null
          photo_url?: string | null
          role: string
          template_id?: string | null
        }
        Update: {
          back_output_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          output_url?: string | null
          photo_url?: string | null
          role?: string
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "badges_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "templates"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          created_at: string
          file_url: string
          height: number
          id: string
          is_official: boolean
          name: string
          name_color: string
          name_h: number
          name_max_size: number
          name_w: number
          name_weight: string
          name_x: number
          name_y: number
          photo_h: number
          photo_radius: number
          photo_w: number
          photo_x: number
          photo_y: number
          role_color: string
          role_h: number
          role_max_size: number
          role_w: number
          role_weight: string
          role_x: number
          role_y: number
          width: number
        }
        Insert: {
          created_at?: string
          file_url: string
          height?: number
          id?: string
          is_official?: boolean
          name: string
          name_color?: string
          name_h: number
          name_max_size?: number
          name_w: number
          name_weight?: string
          name_x: number
          name_y: number
          photo_h: number
          photo_radius: number
          photo_w: number
          photo_x: number
          photo_y: number
          role_color?: string
          role_h: number
          role_max_size?: number
          role_w: number
          role_weight?: string
          role_x: number
          role_y: number
          width?: number
        }
        Update: {
          created_at?: string
          file_url?: string
          height?: number
          id?: string
          is_official?: boolean
          name?: string
          name_color?: string
          name_h?: number
          name_max_size?: number
          name_w?: number
          name_weight?: string
          name_x?: number
          name_y?: number
          photo_h?: number
          photo_radius?: number
          photo_w?: number
          photo_x?: number
          photo_y?: number
          role_color?: string
          role_h?: number
          role_max_size?: number
          role_w?: number
          role_weight?: string
          role_x?: number
          role_y?: number
          width?: number
        }
        Relationships: []
      }
      templates_back: {
        Row: {
          admission_color: string
          admission_h: number
          admission_max_size: number
          admission_w: number
          admission_weight: string
          admission_x: number
          admission_y: number
          created_at: string
          doc_num_color: string
          doc_num_h: number
          doc_num_max_size: number
          doc_num_w: number
          doc_num_weight: string
          doc_num_x: number
          doc_num_y: number
          file_url: string
          height: number
          id: string
          is_official: boolean
          name: string
          name_color: string
          name_h: number
          name_max_size: number
          name_w: number
          name_weight: string
          name_x: number
          name_y: number
          width: number
        }
        Insert: {
          admission_color?: string
          admission_h?: number
          admission_max_size?: number
          admission_w?: number
          admission_weight?: string
          admission_x?: number
          admission_y?: number
          created_at?: string
          doc_num_color?: string
          doc_num_h?: number
          doc_num_max_size?: number
          doc_num_w?: number
          doc_num_weight?: string
          doc_num_x?: number
          doc_num_y?: number
          file_url: string
          height?: number
          id?: string
          is_official?: boolean
          name: string
          name_color?: string
          name_h: number
          name_max_size?: number
          name_w: number
          name_weight?: string
          name_x: number
          name_y: number
          width?: number
        }
        Update: {
          admission_color?: string
          admission_h?: number
          admission_max_size?: number
          admission_w?: number
          admission_weight?: string
          admission_x?: number
          admission_y?: number
          created_at?: string
          doc_num_color?: string
          doc_num_h?: number
          doc_num_max_size?: number
          doc_num_w?: number
          doc_num_weight?: string
          doc_num_x?: number
          doc_num_y?: number
          file_url?: string
          height?: number
          id?: string
          is_official?: boolean
          name?: string
          name_color?: string
          name_h?: number
          name_max_size?: number
          name_w?: number
          name_weight?: string
          name_x?: number
          name_y?: number
          width?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
