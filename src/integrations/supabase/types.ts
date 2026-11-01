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
      attempts: {
        Row: {
          answers: Json
          certification_id: string
          created_at: string
          id: string
          passed: boolean
          score: number
          user_id: string
        }
        Insert: {
          answers?: Json
          certification_id: string
          created_at?: string
          id?: string
          passed: boolean
          score: number
          user_id: string
        }
        Update: {
          answers?: Json
          certification_id?: string
          created_at?: string
          id?: string
          passed?: boolean
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attempts_certification_id_fkey"
            columns: ["certification_id"]
            isOneToOne: false
            referencedRelation: "certifications"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          certification_id: string
          id: string
          issued_at: string
          price_cents: number
          recipient_name: string
          revoked: boolean
          score: number
          serial: string
          user_id: string
        }
        Insert: {
          certification_id: string
          id?: string
          issued_at?: string
          price_cents?: number
          recipient_name: string
          revoked?: boolean
          score: number
          serial: string
          user_id: string
        }
        Update: {
          certification_id?: string
          id?: string
          issued_at?: string
          price_cents?: number
          recipient_name?: string
          revoked?: boolean
          score?: number
          serial?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_certification_id_fkey"
            columns: ["certification_id"]
            isOneToOne: false
            referencedRelation: "certifications"
            referencedColumns: ["id"]
          },
        ]
      }
      certifications: {
        Row: {
          answer_keys: Json
          category: string
          created_at: string
          created_by: string | null
          id: string
          issuer_name: string
          modules: Json
          pass_score: number
          price_cents: number
          published: boolean
          question_count: number
          questions: Json
          skills: string[]
          slug: string
          summary: string
          title: string
        }
        Insert: {
          answer_keys?: Json
          category: string
          created_at?: string
          created_by?: string | null
          id?: string
          issuer_name?: string
          modules?: Json
          pass_score?: number
          price_cents?: number
          published?: boolean
          question_count?: number
          questions?: Json
          skills?: string[]
          slug: string
          summary: string
          title: string
        }
        Update: {
          answer_keys?: Json
          category?: string
          created_at?: string
          created_by?: string | null
          id?: string
          issuer_name?: string
          modules?: Json
          pass_score?: number
          price_cents?: number
          published?: boolean
          question_count?: number
          questions?: Json
          skills?: string[]
          slug?: string
          summary?: string
          title?: string
        }
        Relationships: []
      }
      course_translations: {
        Row: {
          certification_id: string
          created_at: string
          id: string
          lang: string
          payload: Json
        }
        Insert: {
          certification_id: string
          created_at?: string
          id?: string
          lang: string
          payload: Json
        }
        Update: {
          certification_id?: string
          created_at?: string
          id?: string
          lang?: string
          payload?: Json
        }
        Relationships: [
          {
            foreignKeyName: "course_translations_certification_id_fkey"
            columns: ["certification_id"]
            isOneToOne: false
            referencedRelation: "certifications"
            referencedColumns: ["id"]
          },
        ]
      }
      discount_codes: {
        Row: {
          active: boolean
          certification_id: string | null
          code: string
          created_at: string
          created_by: string | null
          expires_at: string | null
          id: string
          max_redemptions: number | null
          note: string
          percent_off: number
          redemptions: number
        }
        Insert: {
          active?: boolean
          certification_id?: string | null
          code: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          max_redemptions?: number | null
          note?: string
          percent_off?: number
          redemptions?: number
        }
        Update: {
          active?: boolean
          certification_id?: string | null
          code?: string
          created_at?: string
          created_by?: string | null
          expires_at?: string | null
          id?: string
          max_redemptions?: number | null
          note?: string
          percent_off?: number
          redemptions?: number
        }
        Relationships: [
          {
            foreignKeyName: "discount_codes_certification_id_fkey"
            columns: ["certification_id"]
            isOneToOne: false
            referencedRelation: "certifications"
            referencedColumns: ["id"]
          },
        ]
      }
      enrollments: {
        Row: {
          certification_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          certification_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          certification_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "enrollments_certification_id_fkey"
            columns: ["certification_id"]
            isOneToOne: false
            referencedRelation: "certifications"
            referencedColumns: ["id"]
          },
        ]
      }
      lesson_progress: {
        Row: {
          certification_id: string
          correct: boolean
          created_at: string
          id: string
          module_index: number
          user_id: string
        }
        Insert: {
          certification_id: string
          correct: boolean
          created_at?: string
          id?: string
          module_index: number
          user_id: string
        }
        Update: {
          certification_id?: string
          correct?: boolean
          created_at?: string
          id?: string
          module_index?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lesson_progress_certification_id_fkey"
            columns: ["certification_id"]
            isOneToOne: false
            referencedRelation: "certifications"
            referencedColumns: ["id"]
          },
        ]
      }
      module_keys: {
        Row: {
          answer_index: number
          certification_id: string
          explanation: string
          module_index: number
        }
        Insert: {
          answer_index: number
          certification_id: string
          explanation?: string
          module_index: number
        }
        Update: {
          answer_index?: number
          certification_id?: string
          explanation?: string
          module_index?: number
        }
        Relationships: [
          {
            foreignKeyName: "module_keys_certification_id_fkey"
            columns: ["certification_id"]
            isOneToOne: false
            referencedRelation: "certifications"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          headline: string | null
          linkedin_url: string | null
          premium: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          headline?: string | null
          linkedin_url?: string | null
          premium?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          headline?: string | null
          linkedin_url?: string | null
          premium?: boolean
          updated_at?: string
          user_id?: string
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
      verification_events: {
        Row: {
          created_at: string
          id: string
          outcome: string
          serial: string
        }
        Insert: {
          created_at?: string
          id?: string
          outcome: string
          serial: string
        }
        Update: {
          created_at?: string
          id?: string
          outcome?: string
          serial?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      certificate_document: { Args: { lookup: string }; Returns: Json }
      exam_status: { Args: { _certification_id: string }; Returns: Json }
      start_exam: { Args: { _certification_id: string }; Returns: Json }
      submit_exam: {
        Args: { _answers: Json; _recipient_name: string; _session_id: string }
        Returns: { passed: boolean; score: number; serial: string }[]
      }
      admin_bulk_set_price: {
        Args: { _category: string; _price_cents: number }
        Returns: number
      }
      admin_course_overview: {
        Args: never
        Returns: {
          certificates: number
          certification_id: string
          learners: number
          passers: number
        }[]
      }
      admin_course_results: {
        Args: { _certification_id: string }
        Returns: {
          attempts: number
          best_score: number
          display_name: string
          enrolled_at: string
          issued_at: string
          passed: boolean
          serial: string
          user_id: string
        }[]
      }
      admin_overview_stats: { Args: never; Returns: Json }
      admin_set_certificate_revoked: {
        Args: { _revoked: boolean; _serial: string }
        Returns: boolean
      }
      grade_and_issue: {
        Args: {
          _answers: Json
          _certification_id: string
          _recipient_name: string
        }
        Returns: {
          passed: boolean
          score: number
          serial: string
        }[]
      }
      grade_lesson_check: {
        Args: {
          _certification_id: string
          _choice: number
          _module_index: number
        }
        Returns: {
          correct: boolean
          correct_index: number
          explanation: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      preview_discount: {
        Args: { _certification_id: string; _code: string }
        Returns: Json
      }
      public_passport: { Args: { _user_id: string }; Returns: Json }
      public_stats: { Args: never; Returns: Json }
      sample_certificate_serial: { Args: never; Returns: string }
      verify_certificate: {
        Args: { lookup: string }
        Returns: {
          cert_title: string
          issued_at: string
          issuer_name: string
          price_cents: number
          recipient_name: string
          revoked: boolean
          score: number
          serial: string
          skills: string[]
        }[]
      }
      verify_record: { Args: { lookup: string }; Returns: Json }
      verify_serials: {
        Args: { _serials: string[] }
        Returns: {
          cert_title: string
          found: boolean
          input: string
          issued_at: string
          issuer_name: string
          recipient_name: string
          serial: string
          status: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "learner" | "verifier"
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
      app_role: ["admin", "learner", "verifier"],
    },
  },
} as const
