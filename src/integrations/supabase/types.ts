export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5";
  };
  public: {
    Tables: {
      share_referral_claims: {
        Row: {
          created_at: string;
          referral_code: string;
          visitor_id: string;
        };
        Insert: {
          created_at?: string;
          referral_code: string;
          visitor_id: string;
        };
        Update: {
          created_at?: string;
          referral_code?: string;
          visitor_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "share_referral_claims_referral_code_fkey";
            columns: ["referral_code"];
            isOneToOne: false;
            referencedRelation: "share_referrals";
            referencedColumns: ["code"];
          },
        ];
      };
      share_referrals: {
        Row: {
          code: string;
          created_at: string;
          granted_count: number;
          updated_at: string;
        };
        Insert: {
          code: string;
          created_at?: string;
          granted_count?: number;
          updated_at?: string;
        };
        Update: {
          code?: string;
          created_at?: string;
          granted_count?: number;
          updated_at?: string;
        };
        Relationships: [];
      };
      stripe_passes: {
        Row: {
          checkout_session_id: string | null;
          created_at: string;
          current_period_end: string | null;
          current_period_start: string | null;
          environment: string;
          id: string;
          last_event_id: string | null;
          pass_expires_at: string | null;
          payment_status: string | null;
          plan_lookup_key: string | null;
          raw: Json | null;
          status: string;
          stripe_customer_id: string | null;
          stripe_price_id: string | null;
          stripe_subscription_id: string | null;
          updated_at: string;
        };
        Insert: {
          checkout_session_id?: string | null;
          created_at?: string;
          current_period_end?: string | null;
          current_period_start?: string | null;
          environment: string;
          id?: string;
          last_event_id?: string | null;
          pass_expires_at?: string | null;
          payment_status?: string | null;
          plan_lookup_key?: string | null;
          raw?: Json | null;
          status: string;
          stripe_customer_id?: string | null;
          stripe_price_id?: string | null;
          stripe_subscription_id?: string | null;
          updated_at?: string;
        };
        Update: {
          checkout_session_id?: string | null;
          created_at?: string;
          current_period_end?: string | null;
          current_period_start?: string | null;
          environment?: string;
          id?: string;
          last_event_id?: string | null;
          pass_expires_at?: string | null;
          payment_status?: string | null;
          plan_lookup_key?: string | null;
          raw?: Json | null;
          status?: string;
          stripe_customer_id?: string | null;
          stripe_price_id?: string | null;
          stripe_subscription_id?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      toilet_search_cache: {
        Row: {
          amap_ids: string[];
          cache_key: string;
          created_at: string;
          lat: number;
          lng: number;
          radius_m: number;
        };
        Insert: {
          amap_ids: string[];
          cache_key: string;
          created_at?: string;
          lat: number;
          lng: number;
          radius_m: number;
        };
        Update: {
          amap_ids?: string[];
          cache_key?: string;
          created_at?: string;
          lat?: number;
          lng?: number;
          radius_m?: number;
        };
        Relationships: [];
      };
      toilets: {
        Row: {
          address: string | null;
          amap_id: string;
          city: string | null;
          created_at: string;
          district: string | null;
          id: string;
          lat: number;
          lng: number;
          name: string;
          name_en: string | null;
          photo_url: string | null;
          province: string | null;
          raw: Json | null;
          tel: string | null;
          type: string | null;
          updated_at: string;
        };
        Insert: {
          address?: string | null;
          amap_id: string;
          city?: string | null;
          created_at?: string;
          district?: string | null;
          id?: string;
          lat: number;
          lng: number;
          name: string;
          name_en?: string | null;
          photo_url?: string | null;
          province?: string | null;
          raw?: Json | null;
          tel?: string | null;
          type?: string | null;
          updated_at?: string;
        };
        Update: {
          address?: string | null;
          amap_id?: string;
          city?: string | null;
          created_at?: string;
          district?: string | null;
          id?: string;
          lat?: number;
          lng?: number;
          name?: string;
          name_en?: string | null;
          photo_url?: string | null;
          province?: string | null;
          raw?: Json | null;
          tel?: string | null;
          type?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      claim_share_referral: {
        Args: {
          p_referral_code: string;
          p_visitor_id: string;
        };
        Returns: boolean;
      };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
