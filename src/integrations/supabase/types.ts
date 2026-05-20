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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          created_at: string
          doctor_name: string
          id: string
          mode: string
          notes: string | null
          scheduled_at: string
          specialty: string | null
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          doctor_name: string
          id?: string
          mode?: string
          notes?: string | null
          scheduled_at: string
          specialty?: string | null
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          doctor_name?: string
          id?: string
          mode?: string
          notes?: string | null
          scheduled_at?: string
          specialty?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      chat_messages: {
        Row: {
          content: string
          created_at: string
          id: string
          role: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          role: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          role?: string
          user_id?: string
        }
        Relationships: []
      }
      health_summaries: {
        Row: {
          created_at: string
          generated_at: string
          model: string | null
          summary: string
          user_id: string
        }
        Insert: {
          created_at?: string
          generated_at?: string
          model?: string | null
          summary: string
          user_id: string
        }
        Update: {
          created_at?: string
          generated_at?: string
          model?: string | null
          summary?: string
          user_id?: string
        }
        Relationships: []
      }
      medical_records: {
        Row: {
          created_at: string
          description: string | null
          doctor: string | null
          id: string
          record_date: string
          record_type: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          doctor?: string | null
          id?: string
          record_date?: string
          record_type: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          doctor?: string | null
          id?: string
          record_date?: string
          record_type?: string
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      medication_intakes: {
        Row: {
          created_at: string
          id: string
          intake_date: string
          prescription_id: string
          slot: string
          taken: boolean
          taken_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          intake_date?: string
          prescription_id: string
          slot?: string
          taken?: boolean
          taken_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          intake_date?: string
          prescription_id?: string
          slot?: string
          taken?: boolean
          taken_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "medication_intakes_prescription_id_fkey"
            columns: ["prescription_id"]
            isOneToOne: false
            referencedRelation: "prescriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      prescriptions: {
        Row: {
          created_at: string
          doctor: string | null
          dosage: string | null
          frequency: string | null
          id: string
          issued_at: string
          medication: string
          notes: string | null
          user_id: string
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          doctor?: string | null
          dosage?: string | null
          frequency?: string | null
          id?: string
          issued_at?: string
          medication: string
          notes?: string | null
          user_id: string
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          doctor?: string | null
          dosage?: string | null
          frequency?: string | null
          id?: string
          issued_at?: string
          medication?: string
          notes?: string | null
          user_id?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          allergies: string | null
          blood_type: string | null
          chronic_conditions: string | null
          created_at: string
          date_of_birth: string | null
          emergency_contact: string | null
          full_name: string | null
          gender: string | null
          id: string
          national_id: string | null
          phone: string | null
          updated_at: string
        }
        Insert: {
          allergies?: string | null
          blood_type?: string | null
          chronic_conditions?: string | null
          created_at?: string
          date_of_birth?: string | null
          emergency_contact?: string | null
          full_name?: string | null
          gender?: string | null
          id: string
          national_id?: string | null
          phone?: string | null
          updated_at?: string
        }
        Update: {
          allergies?: string | null
          blood_type?: string | null
          chronic_conditions?: string | null
          created_at?: string
          date_of_birth?: string | null
          emergency_contact?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          national_id?: string | null
          phone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      vitals: {
        Row: {
          diastolic: number | null
          glucose: number | null
          heart_rate: number | null
          id: string
          oxygen: number | null
          recorded_at: string
          systolic: number | null
          user_id: string
        }
        Insert: {
          diastolic?: number | null
          glucose?: number | null
          heart_rate?: number | null
          id?: string
          oxygen?: number | null
          recorded_at?: string
          systolic?: number | null
          user_id: string
        }
        Update: {
          diastolic?: number | null
          glucose?: number | null
          heart_rate?: number | null
          id?: string
          oxygen?: number | null
          recorded_at?: string
          systolic?: number | null
          user_id?: string
        }
        Relationships: []
      }
      wearable_data: {
        Row: {
          battery: number | null
          created_at: string
          device_id: string | null
          heart_rate: number | null
          id: string
          oxygen: number | null
          recorded_at: string
          sleep_minutes: number | null
          steps: number | null
          temperature: number | null
          user_id: string
        }
        Insert: {
          battery?: number | null
          created_at?: string
          device_id?: string | null
          heart_rate?: number | null
          id?: string
          oxygen?: number | null
          recorded_at?: string
          sleep_minutes?: number | null
          steps?: number | null
          temperature?: number | null
          user_id: string
        }
        Update: {
          battery?: number | null
          created_at?: string
          device_id?: string | null
          heart_rate?: number | null
          id?: string
          oxygen?: number | null
          recorded_at?: string
          sleep_minutes?: number | null
          steps?: number | null
          temperature?: number | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "patient"
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
    Enums: {
      app_role: ["admin", "patient"],
    },
  },
} as const
