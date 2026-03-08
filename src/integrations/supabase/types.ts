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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      analysis_tabs: {
        Row: {
          cons: string[] | null
          created_at: string
          formation: string | null
          general_notes: string[] | null
          id: string
          images: string[] | null
          match_analysis_id: string
          pros: string[] | null
          sub_tab: string | null
          tab_type: string
        }
        Insert: {
          cons?: string[] | null
          created_at?: string
          formation?: string | null
          general_notes?: string[] | null
          id?: string
          images?: string[] | null
          match_analysis_id: string
          pros?: string[] | null
          sub_tab?: string | null
          tab_type: string
        }
        Update: {
          cons?: string[] | null
          created_at?: string
          formation?: string | null
          general_notes?: string[] | null
          id?: string
          images?: string[] | null
          match_analysis_id?: string
          pros?: string[] | null
          sub_tab?: string | null
          tab_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "analysis_tabs_match_analysis_id_fkey"
            columns: ["match_analysis_id"]
            isOneToOne: false
            referencedRelation: "match_analyses"
            referencedColumns: ["id"]
          },
        ]
      }
      match_analyses: {
        Row: {
          away_team: string
          created_at: string
          home_team: string
          id: string
          league: string | null
          match_date: string
          target_team: string
          updated_at: string
          user_id: string
        }
        Insert: {
          away_team: string
          created_at?: string
          home_team: string
          id?: string
          league?: string | null
          match_date: string
          target_team?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          away_team?: string
          created_at?: string
          home_team?: string
          id?: string
          league?: string | null
          match_date?: string
          target_team?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      players: {
        Row: {
          birth_date: string | null
          created_at: string
          current_team: string | null
          id: string
          key_traits: string[] | null
          league: string | null
          name: string
          physical_rating: number | null
          preferred_foot: string | null
          primary_position: string | null
          secondary_position: string | null
          tactical_rating: number | null
          technical_rating: number | null
          transfermarkt_link: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          birth_date?: string | null
          created_at?: string
          current_team?: string | null
          id?: string
          key_traits?: string[] | null
          league?: string | null
          name: string
          physical_rating?: number | null
          preferred_foot?: string | null
          primary_position?: string | null
          secondary_position?: string | null
          tactical_rating?: number | null
          technical_rating?: number | null
          transfermarkt_link?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          birth_date?: string | null
          created_at?: string
          current_team?: string | null
          id?: string
          key_traits?: string[] | null
          league?: string | null
          name?: string
          physical_rating?: number | null
          preferred_foot?: string | null
          primary_position?: string | null
          secondary_position?: string | null
          tactical_rating?: number | null
          technical_rating?: number | null
          transfermarkt_link?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          first_name: string | null
          id: string
          last_name: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          first_name?: string | null
          id?: string
          last_name?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      shared_leagues: {
        Row: {
          created_at: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      shared_teams: {
        Row: {
          created_at: string
          id: string
          league: string | null
          logo_url: string | null
          name: string
        }
        Insert: {
          created_at?: string
          id?: string
          league?: string | null
          logo_url?: string | null
          name: string
        }
        Update: {
          created_at?: string
          id?: string
          league?: string | null
          logo_url?: string | null
          name?: string
        }
        Relationships: []
      }
      squads: {
        Row: {
          created_at: string
          formation: string
          id: string
          name: string
          positions: Json | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          formation?: string
          id?: string
          name: string
          positions?: Json | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          formation?: string
          id?: string
          name?: string
          positions?: Json | null
          updated_at?: string
          user_id?: string
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
