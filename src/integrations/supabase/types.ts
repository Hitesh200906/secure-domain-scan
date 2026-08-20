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
      admins: {
        Row: {
          active: boolean
          api_key: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          last_active_at: string | null
          permissions: Json
          role: string
        }
        Insert: {
          active?: boolean
          api_key?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id?: string
          last_active_at?: string | null
          permissions?: Json
          role?: string
        }
        Update: {
          active?: boolean
          api_key?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          last_active_at?: string | null
          permissions?: Json
          role?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_role: string | null
          created_at: string
          id: string
          metadata: Json
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_role?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_role?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: []
      }
      credit_transactions: {
        Row: {
          balance_after: number
          created_at: string
          credits: number
          description: string
          id: string
          status: string
          user_id: string
        }
        Insert: {
          balance_after?: number
          created_at?: string
          credits: number
          description: string
          id?: string
          status?: string
          user_id: string
        }
        Update: {
          balance_after?: number
          created_at?: string
          credits?: number
          description?: string
          id?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          link: string | null
          read: boolean
          title: string
          user_id: string
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title: string
          user_id: string
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          link?: string | null
          read?: boolean
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount: number
          buyer_email: string | null
          buyer_id: string | null
          created_at: string
          id: string
          product_id: string
          status: string
          store_id: string
        }
        Insert: {
          amount?: number
          buyer_email?: string | null
          buyer_id?: string | null
          created_at?: string
          id?: string
          product_id: string
          status?: string
          store_id: string
        }
        Update: {
          amount?: number
          buyer_email?: string | null
          buyer_id?: string | null
          created_at?: string
          id?: string
          product_id?: string
          status?: string
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          bonus_credits: number
          created_at: string
          credits: number
          currency: string
          id: string
          order_id: string
          payment_id: string | null
          provider: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          bonus_credits?: number
          created_at?: string
          credits: number
          currency?: string
          id?: string
          order_id: string
          payment_id?: string | null
          provider?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          bonus_credits?: number
          created_at?: string
          credits?: number
          currency?: string
          id?: string
          order_id?: string
          payment_id?: string | null
          provider?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      pricing_plans: {
        Row: {
          active: boolean
          created_at: string
          credits: number
          cta_label: string | null
          description: string | null
          features: Json
          headline: string | null
          id: string
          name: string
          popular: boolean
          price_label: string | null
          price_monthly: number
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          credits?: number
          cta_label?: string | null
          description?: string | null
          features?: Json
          headline?: string | null
          id?: string
          name: string
          popular?: boolean
          price_label?: string | null
          price_monthly?: number
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          credits?: number
          cta_label?: string | null
          description?: string | null
          features?: Json
          headline?: string | null
          id?: string
          name?: string
          popular?: boolean
          price_label?: string | null
          price_monthly?: number
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          access: Json
          active: boolean
          apps: Json
          banner_url: string | null
          benefits: Json | null
          billing_type: string
          category: string | null
          changelog: string | null
          community: Json
          created_at: string
          delivery: Json
          demo_video_url: string | null
          description: string | null
          docs_url: string | null
          faq: Json | null
          features: Json
          gallery: Json
          github_url: string | null
          headline: string | null
          id: string
          image_url: string | null
          logo_url: string | null
          name: string
          preview_url: string | null
          price: number
          pricing_extra: Json
          product_type: string
          requirements: Json
          scheduled_at: string | null
          seo: Json
          service_settings: Json
          short_description: string | null
          status: string
          store_id: string
          subcategory: string | null
          tags: string[] | null
          thumbnail_url: string | null
          updated_at: string
          version: string | null
        }
        Insert: {
          access?: Json
          active?: boolean
          apps?: Json
          banner_url?: string | null
          benefits?: Json | null
          billing_type?: string
          category?: string | null
          changelog?: string | null
          community?: Json
          created_at?: string
          delivery?: Json
          demo_video_url?: string | null
          description?: string | null
          docs_url?: string | null
          faq?: Json | null
          features?: Json
          gallery?: Json
          github_url?: string | null
          headline?: string | null
          id?: string
          image_url?: string | null
          logo_url?: string | null
          name: string
          preview_url?: string | null
          price?: number
          pricing_extra?: Json
          product_type?: string
          requirements?: Json
          scheduled_at?: string | null
          seo?: Json
          service_settings?: Json
          short_description?: string | null
          status?: string
          store_id: string
          subcategory?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string
          version?: string | null
        }
        Update: {
          access?: Json
          active?: boolean
          apps?: Json
          banner_url?: string | null
          benefits?: Json | null
          billing_type?: string
          category?: string | null
          changelog?: string | null
          community?: Json
          created_at?: string
          delivery?: Json
          demo_video_url?: string | null
          description?: string | null
          docs_url?: string | null
          faq?: Json | null
          features?: Json
          gallery?: Json
          github_url?: string | null
          headline?: string | null
          id?: string
          image_url?: string | null
          logo_url?: string | null
          name?: string
          preview_url?: string | null
          price?: number
          pricing_extra?: Json
          product_type?: string
          requirements?: Json
          scheduled_at?: string | null
          seo?: Json
          service_settings?: Json
          short_description?: string | null
          status?: string
          store_id?: string
          subcategory?: string | null
          tags?: string[] | null
          thumbnail_url?: string | null
          updated_at?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          ban_reason: string | null
          banned_at: string | null
          company: string | null
          created_at: string
          credits: number
          email: string | null
          full_name: string | null
          id: string
          password_set: boolean
          plan: string
          role_title: string | null
          status: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          ban_reason?: string | null
          banned_at?: string | null
          company?: string | null
          created_at?: string
          credits?: number
          email?: string | null
          full_name?: string | null
          id: string
          password_set?: boolean
          plan?: string
          role_title?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          ban_reason?: string | null
          banned_at?: string | null
          company?: string | null
          created_at?: string
          credits?: number
          email?: string | null
          full_name?: string | null
          id?: string
          password_set?: boolean
          plan?: string
          role_title?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          file_url: string | null
          findings: Json
          id: string
          scan_id: string | null
          severity: string | null
          summary: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          file_url?: string | null
          findings?: Json
          id?: string
          scan_id?: string | null
          severity?: string | null
          summary?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          file_url?: string | null
          findings?: Json
          id?: string
          scan_id?: string | null
          severity?: string | null
          summary?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "scan_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      scan_requests: {
        Row: {
          business_email: string | null
          company: string | null
          created_at: string
          email: string
          findings_count: number | null
          full_name: string
          id: string
          manual_code: string | null
          otp_attempts: number
          otp_code: string | null
          plan: string
          role_title: string | null
          score: number | null
          status: string
          target_url: string
          user_id: string
          verification_expires_at: string | null
          verification_method: string
          verification_notes: string | null
          verification_status: string
          verified_at: string | null
        }
        Insert: {
          business_email?: string | null
          company?: string | null
          created_at?: string
          email: string
          findings_count?: number | null
          full_name: string
          id?: string
          manual_code?: string | null
          otp_attempts?: number
          otp_code?: string | null
          plan?: string
          role_title?: string | null
          score?: number | null
          status?: string
          target_url: string
          user_id: string
          verification_expires_at?: string | null
          verification_method: string
          verification_notes?: string | null
          verification_status?: string
          verified_at?: string | null
        }
        Update: {
          business_email?: string | null
          company?: string | null
          created_at?: string
          email?: string
          findings_count?: number | null
          full_name?: string
          id?: string
          manual_code?: string | null
          otp_attempts?: number
          otp_code?: string | null
          plan?: string
          role_title?: string | null
          score?: number | null
          status?: string
          target_url?: string
          user_id?: string
          verification_expires_at?: string | null
          verification_method?: string
          verification_notes?: string | null
          verification_status?: string
          verified_at?: string | null
        }
        Relationships: []
      }
      store_apps: {
        Row: {
          app_key: string
          created_at: string
          enabled: boolean
          id: string
          position: number
          settings: Json
          store_id: string
          updated_at: string
        }
        Insert: {
          app_key: string
          created_at?: string
          enabled?: boolean
          id?: string
          position?: number
          settings?: Json
          store_id: string
          updated_at?: string
        }
        Update: {
          app_key?: string
          created_at?: string
          enabled?: boolean
          id?: string
          position?: number
          settings?: Json
          store_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_apps_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      stores: {
        Row: {
          accent_color: string | null
          banner_url: string | null
          category: string | null
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          member_count: number
          name: string
          owner_id: string
          skills: string[]
          slug: string
          social_links: Json | null
          theme_color: string | null
          total_sales: number
          updated_at: string
          verified: boolean
          website_url: string | null
        }
        Insert: {
          accent_color?: string | null
          banner_url?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          member_count?: number
          name: string
          owner_id: string
          skills?: string[]
          slug: string
          social_links?: Json | null
          theme_color?: string | null
          total_sales?: number
          updated_at?: string
          verified?: boolean
          website_url?: string | null
        }
        Update: {
          accent_color?: string | null
          banner_url?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          member_count?: number
          name?: string
          owner_id?: string
          skills?: string[]
          slug?: string
          social_links?: Json | null
          theme_color?: string | null
          total_sales?: number
          updated_at?: string
          verified?: boolean
          website_url?: string | null
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          priority: string
          status: string
          subject: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          priority?: string
          status?: string
          subject: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          priority?: string
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      ticket_messages: {
        Row: {
          attachment_url: string | null
          author_name: string | null
          author_type: string
          body: string
          created_at: string
          id: string
          ticket_id: string
        }
        Insert: {
          attachment_url?: string | null
          author_name?: string | null
          author_type?: string
          body: string
          created_at?: string
          id?: string
          ticket_id: string
        }
        Update: {
          attachment_url?: string | null
          author_name?: string | null
          author_type?: string
          body?: string
          created_at?: string
          id?: string
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
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
      close_my_ticket: { Args: { _ticket_id: string }; Returns: boolean }
      get_user_role: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["app_role"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_banned: { Args: { _user_id: string }; Returns: boolean }
      is_master_admin: { Args: { _user_id: string }; Returns: boolean }
      my_store_ids: { Args: never; Returns: string[] }
      owns_store: { Args: { _store_id: string }; Returns: boolean }
      purchase_credits: { Args: { _credits: number }; Returns: number }
      settle_payment: {
        Args: { _order_id: string; _payment_id: string }
        Returns: number
      }
      verify_admin_api_key: { Args: { _key: string }; Returns: boolean }
    }
    Enums: {
      app_role: "master_admin" | "super_admin" | "admin" | "user"
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
      app_role: ["master_admin", "super_admin", "admin", "user"],
    },
  },
} as const
