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
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      animal_events: {
        Row: {
          animal_id: string
          correction_reason: string | null
          corrects_id: string | null
          created_at: string
          description: string | null
          event_date: string
          event_type: Database["public"]["Enums"]["animal_event_type"]
          evidence_url: string | null
          id: string
          location: string | null
          recorded_by: string
        }
        Insert: {
          animal_id: string
          correction_reason?: string | null
          corrects_id?: string | null
          created_at?: string
          description?: string | null
          event_date?: string
          event_type: Database["public"]["Enums"]["animal_event_type"]
          evidence_url?: string | null
          id?: string
          location?: string | null
          recorded_by?: string
        }
        Update: {
          animal_id?: string
          correction_reason?: string | null
          corrects_id?: string | null
          created_at?: string
          description?: string | null
          event_date?: string
          event_type?: Database["public"]["Enums"]["animal_event_type"]
          evidence_url?: string | null
          id?: string
          location?: string | null
          recorded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "animal_events_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "animal_events_corrects_id_fkey"
            columns: ["corrects_id"]
            isOneToOne: false
            referencedRelation: "animal_events"
            referencedColumns: ["id"]
          },
        ]
      }
      animal_identifiers: {
        Row: {
          animal_id: string
          biometric_reference: string | null
          biometric_type: string | null
          change_reason: string | null
          created_at: string
          created_by: string
          id: string
          identifier_type: Database["public"]["Enums"]["identifier_type"]
          identifier_value: string | null
          is_primary: boolean
          status: Database["public"]["Enums"]["identifier_status"]
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          animal_id: string
          biometric_reference?: string | null
          biometric_type?: string | null
          change_reason?: string | null
          created_at?: string
          created_by?: string
          id?: string
          identifier_type: Database["public"]["Enums"]["identifier_type"]
          identifier_value?: string | null
          is_primary?: boolean
          status?: Database["public"]["Enums"]["identifier_status"]
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          animal_id?: string
          biometric_reference?: string | null
          biometric_type?: string | null
          change_reason?: string | null
          created_at?: string
          created_by?: string
          id?: string
          identifier_type?: Database["public"]["Enums"]["identifier_type"]
          identifier_value?: string | null
          is_primary?: boolean
          status?: Database["public"]["Enums"]["identifier_status"]
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "animal_identifiers_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
        ]
      }
      animal_movements: {
        Row: {
          animal_id: string
          correction_reason: string | null
          corrects_id: string | null
          created_at: string
          destination_farm_id: string | null
          id: string
          latitude: number | null
          longitude: number | null
          movement_date: string
          movement_reason: string | null
          origin_farm_id: string | null
          recorded_by: string
          validated_at: string | null
          validated_by: string | null
          validation_note: string | null
          validation_status: Database["public"]["Enums"]["validation_status"]
        }
        Insert: {
          animal_id: string
          correction_reason?: string | null
          corrects_id?: string | null
          created_at?: string
          destination_farm_id?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          movement_date?: string
          movement_reason?: string | null
          origin_farm_id?: string | null
          recorded_by?: string
          validated_at?: string | null
          validated_by?: string | null
          validation_note?: string | null
          validation_status?: Database["public"]["Enums"]["validation_status"]
        }
        Update: {
          animal_id?: string
          correction_reason?: string | null
          corrects_id?: string | null
          created_at?: string
          destination_farm_id?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          movement_date?: string
          movement_reason?: string | null
          origin_farm_id?: string | null
          recorded_by?: string
          validated_at?: string | null
          validated_by?: string | null
          validation_note?: string | null
          validation_status?: Database["public"]["Enums"]["validation_status"]
        }
        Relationships: [
          {
            foreignKeyName: "animal_movements_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "animal_movements_corrects_id_fkey"
            columns: ["corrects_id"]
            isOneToOne: false
            referencedRelation: "animal_movements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "animal_movements_destination_farm_id_fkey"
            columns: ["destination_farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "animal_movements_origin_farm_id_fkey"
            columns: ["origin_farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      animal_ownerships: {
        Row: {
          animal_id: string
          created_at: string
          created_by: string | null
          end_date: string | null
          farm_id: string
          id: string
          owner_user_id: string | null
          start_date: string
          transfer_reason: string | null
        }
        Insert: {
          animal_id: string
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          farm_id: string
          id?: string
          owner_user_id?: string | null
          start_date?: string
          transfer_reason?: string | null
        }
        Update: {
          animal_id?: string
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          farm_id?: string
          id?: string
          owner_user_id?: string | null
          start_date?: string
          transfer_reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "animal_ownerships_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "animal_ownerships_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      animals: {
        Row: {
          acquisition_mode:
            | Database["public"]["Enums"]["acquisition_mode"]
            | null
          animal_code: string
          birth_date: string | null
          birth_date_estimated: boolean
          breed: string | null
          change_reason: string | null
          color: string | null
          created_at: string
          created_by: string
          entry_date: string | null
          farm_id: string
          id: string
          identification_status: Database["public"]["Enums"]["identification_status"]
          name: string | null
          notes: string | null
          origin: string | null
          photo_url: string | null
          physical_features: string | null
          sex: Database["public"]["Enums"]["animal_sex"]
          species: Database["public"]["Enums"]["animal_species"]
          status: Database["public"]["Enums"]["animal_status"]
          updated_at: string
          updated_by: string | null
          weight: number | null
        }
        Insert: {
          acquisition_mode?:
            | Database["public"]["Enums"]["acquisition_mode"]
            | null
          animal_code?: string
          birth_date?: string | null
          birth_date_estimated?: boolean
          breed?: string | null
          change_reason?: string | null
          color?: string | null
          created_at?: string
          created_by?: string
          entry_date?: string | null
          farm_id: string
          id?: string
          identification_status?: Database["public"]["Enums"]["identification_status"]
          name?: string | null
          notes?: string | null
          origin?: string | null
          photo_url?: string | null
          physical_features?: string | null
          sex?: Database["public"]["Enums"]["animal_sex"]
          species: Database["public"]["Enums"]["animal_species"]
          status?: Database["public"]["Enums"]["animal_status"]
          updated_at?: string
          updated_by?: string | null
          weight?: number | null
        }
        Update: {
          acquisition_mode?:
            | Database["public"]["Enums"]["acquisition_mode"]
            | null
          animal_code?: string
          birth_date?: string | null
          birth_date_estimated?: boolean
          breed?: string | null
          change_reason?: string | null
          color?: string | null
          created_at?: string
          created_by?: string
          entry_date?: string | null
          farm_id?: string
          id?: string
          identification_status?: Database["public"]["Enums"]["identification_status"]
          name?: string | null
          notes?: string | null
          origin?: string | null
          photo_url?: string | null
          physical_features?: string | null
          sex?: Database["public"]["Enums"]["animal_sex"]
          species?: Database["public"]["Enums"]["animal_species"]
          status?: Database["public"]["Enums"]["animal_status"]
          updated_at?: string
          updated_by?: string | null
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "animals_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: Database["public"]["Enums"]["audit_action"]
          actor_id: string | null
          changed_fields: string[] | null
          created_at: string
          id: number
          new_data: Json | null
          old_data: Json | null
          reason: string | null
          record_id: string | null
          table_name: string
        }
        Insert: {
          action: Database["public"]["Enums"]["audit_action"]
          actor_id?: string | null
          changed_fields?: string[] | null
          created_at?: string
          id?: never
          new_data?: Json | null
          old_data?: Json | null
          reason?: string | null
          record_id?: string | null
          table_name: string
        }
        Update: {
          action?: Database["public"]["Enums"]["audit_action"]
          actor_id?: string | null
          changed_fields?: string[] | null
          created_at?: string
          id?: never
          new_data?: Json | null
          old_data?: Json | null
          reason?: string | null
          record_id?: string | null
          table_name?: string
        }
        Relationships: []
      }
      farm_memberships: {
        Row: {
          change_reason: string | null
          created_at: string
          farm_id: string
          id: string
          invited_by: string | null
          permissions: string[]
          role: Database["public"]["Enums"]["farm_role"]
          status: Database["public"]["Enums"]["membership_status"]
          updated_at: string
          updated_by: string | null
          user_id: string
        }
        Insert: {
          change_reason?: string | null
          created_at?: string
          farm_id: string
          id?: string
          invited_by?: string | null
          permissions?: string[]
          role: Database["public"]["Enums"]["farm_role"]
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
          updated_by?: string | null
          user_id: string
        }
        Update: {
          change_reason?: string | null
          created_at?: string
          farm_id?: string
          id?: string
          invited_by?: string | null
          permissions?: string[]
          role?: Database["public"]["Enums"]["farm_role"]
          status?: Database["public"]["Enums"]["membership_status"]
          updated_at?: string
          updated_by?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "farm_memberships_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "farm_memberships_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      farms: {
        Row: {
          address: string | null
          change_reason: string | null
          country: string
          created_at: string
          created_by: string
          department: string | null
          description: string | null
          farm_code: string
          farm_type: string | null
          id: string
          latitude: number | null
          locality: string | null
          longitude: number | null
          name: string
          owner_name: string | null
          region: string | null
          species: Database["public"]["Enums"]["animal_species"][]
          status: Database["public"]["Enums"]["farm_status"]
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          address?: string | null
          change_reason?: string | null
          country?: string
          created_at?: string
          created_by?: string
          department?: string | null
          description?: string | null
          farm_code?: string
          farm_type?: string | null
          id?: string
          latitude?: number | null
          locality?: string | null
          longitude?: number | null
          name: string
          owner_name?: string | null
          region?: string | null
          species?: Database["public"]["Enums"]["animal_species"][]
          status?: Database["public"]["Enums"]["farm_status"]
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          address?: string | null
          change_reason?: string | null
          country?: string
          created_at?: string
          created_by?: string
          department?: string | null
          description?: string | null
          farm_code?: string
          farm_type?: string | null
          id?: string
          latitude?: number | null
          locality?: string | null
          longitude?: number | null
          name?: string
          owner_name?: string | null
          region?: string | null
          species?: Database["public"]["Enums"]["animal_species"][]
          status?: Database["public"]["Enums"]["farm_status"]
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      health_interventions: {
        Row: {
          administered_by: string | null
          administration_date: string
          animal_id: string
          correction_reason: string | null
          corrects_id: string | null
          created_at: string
          dosage: string | null
          farm_id: string
          id: string
          intervention_type: Database["public"]["Enums"]["intervention_type"]
          next_due_date: string | null
          notes: string | null
          product_name: string | null
          recorded_by: string
          veterinarian_id: string | null
        }
        Insert: {
          administered_by?: string | null
          administration_date?: string
          animal_id: string
          correction_reason?: string | null
          corrects_id?: string | null
          created_at?: string
          dosage?: string | null
          farm_id: string
          id?: string
          intervention_type: Database["public"]["Enums"]["intervention_type"]
          next_due_date?: string | null
          notes?: string | null
          product_name?: string | null
          recorded_by?: string
          veterinarian_id?: string | null
        }
        Update: {
          administered_by?: string | null
          administration_date?: string
          animal_id?: string
          correction_reason?: string | null
          corrects_id?: string | null
          created_at?: string
          dosage?: string | null
          farm_id?: string
          id?: string
          intervention_type?: Database["public"]["Enums"]["intervention_type"]
          next_due_date?: string | null
          notes?: string | null
          product_name?: string | null
          recorded_by?: string
          veterinarian_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "health_interventions_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_interventions_corrects_id_fkey"
            columns: ["corrects_id"]
            isOneToOne: false
            referencedRelation: "health_interventions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_interventions_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      health_records: {
        Row: {
          activity_status: string | null
          animal_id: string
          appetite_status: string | null
          correction_reason: string | null
          corrects_id: string | null
          created_at: string
          diagnosis: string | null
          diagnosis_status: Database["public"]["Enums"]["diagnosis_status"]
          farm_id: string
          id: string
          notes: string | null
          observation_date: string
          recorded_by: string
          respiratory_observation: string | null
          suspected_condition: string | null
          symptoms: string[]
          temperature: number | null
          veterinarian_id: string | null
        }
        Insert: {
          activity_status?: string | null
          animal_id: string
          appetite_status?: string | null
          correction_reason?: string | null
          corrects_id?: string | null
          created_at?: string
          diagnosis?: string | null
          diagnosis_status?: Database["public"]["Enums"]["diagnosis_status"]
          farm_id: string
          id?: string
          notes?: string | null
          observation_date?: string
          recorded_by?: string
          respiratory_observation?: string | null
          suspected_condition?: string | null
          symptoms?: string[]
          temperature?: number | null
          veterinarian_id?: string | null
        }
        Update: {
          activity_status?: string | null
          animal_id?: string
          appetite_status?: string | null
          correction_reason?: string | null
          corrects_id?: string | null
          created_at?: string
          diagnosis?: string | null
          diagnosis_status?: Database["public"]["Enums"]["diagnosis_status"]
          farm_id?: string
          id?: string
          notes?: string | null
          observation_date?: string
          recorded_by?: string
          respiratory_observation?: string | null
          suspected_condition?: string | null
          symptoms?: string[]
          temperature?: number | null
          veterinarian_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "health_records_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_records_corrects_id_fkey"
            columns: ["corrects_id"]
            isOneToOne: false
            referencedRelation: "health_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_records_farm_id_fkey"
            columns: ["farm_id"]
            isOneToOne: false
            referencedRelation: "farms"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      farm_member_directory: {
        Args: { _farm_id: string }
        Returns: {
          avatar_url: string
          full_name: string
          role: Database["public"]["Enums"]["farm_role"]
          status: Database["public"]["Enums"]["membership_status"]
          user_id: string
        }[]
      }
      herd_stats: {
        Args: { _farm_id?: string }
        Returns: {
          breed: string
          farm_id: string
          sex: Database["public"]["Enums"]["animal_sex"]
          species: Database["public"]["Enums"]["animal_species"]
          status: Database["public"]["Enums"]["animal_status"]
          total: number
        }[]
      }
      transfer_animal: {
        Args: {
          _animal_id: string
          _destination_farm_id: string
          _latitude?: number
          _longitude?: number
          _movement_date?: string
          _reason: string
        }
        Returns: string
      }
      validate_movement: {
        Args: {
          _movement_id: string
          _note?: string
          _status: Database["public"]["Enums"]["validation_status"]
        }
        Returns: undefined
      }
    }
    Enums: {
      acquisition_mode:
        | "born_on_farm"
        | "purchase"
        | "donation"
        | "inheritance"
        | "exchange"
        | "other"
      animal_event_type:
        | "birth"
        | "sale"
        | "transfer"
        | "reproduction"
        | "calving"
        | "death"
        | "slaughter"
        | "other"
      animal_sex: "male" | "female" | "unknown"
      animal_species: "bovine" | "ovine" | "caprine" | "porcine"
      animal_status: "alive" | "deceased" | "sold" | "missing"
      app_role: "admin" | "supervisor"
      audit_action: "insert" | "update" | "delete"
      diagnosis_status: "suspected" | "confirmed" | "ruled_out" | "pending"
      farm_role: "owner" | "manager" | "farmer" | "veterinarian" | "agent"
      farm_status: "active" | "inactive" | "archived"
      identification_status: "unidentified" | "pending" | "identified"
      identifier_status: "active" | "inactive" | "lost" | "revoked"
      identifier_type: "qr" | "rfid" | "biometric"
      intervention_type:
        | "vaccination"
        | "treatment"
        | "examination"
        | "deworming"
        | "other"
      membership_status: "active" | "invited" | "suspended" | "revoked"
      validation_status: "pending" | "validated" | "rejected"
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
      acquisition_mode: [
        "born_on_farm",
        "purchase",
        "donation",
        "inheritance",
        "exchange",
        "other",
      ],
      animal_event_type: [
        "birth",
        "sale",
        "transfer",
        "reproduction",
        "calving",
        "death",
        "slaughter",
        "other",
      ],
      animal_sex: ["male", "female", "unknown"],
      animal_species: ["bovine", "ovine", "caprine", "porcine"],
      animal_status: ["alive", "deceased", "sold", "missing"],
      app_role: ["admin", "supervisor"],
      audit_action: ["insert", "update", "delete"],
      diagnosis_status: ["suspected", "confirmed", "ruled_out", "pending"],
      farm_role: ["owner", "manager", "farmer", "veterinarian", "agent"],
      farm_status: ["active", "inactive", "archived"],
      identification_status: ["unidentified", "pending", "identified"],
      identifier_status: ["active", "inactive", "lost", "revoked"],
      identifier_type: ["qr", "rfid", "biometric"],
      intervention_type: [
        "vaccination",
        "treatment",
        "examination",
        "deworming",
        "other",
      ],
      membership_status: ["active", "invited", "suspended", "revoked"],
      validation_status: ["pending", "validated", "rejected"],
    },
  },
} as const
