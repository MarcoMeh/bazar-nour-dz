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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      admins: {
        Row: {
          auth_user_id: string
          created_at: string | null
          id: string
        }
        Insert: {
          auth_user_id: string
          created_at?: string | null
          id?: string
        }
        Update: {
          auth_user_id?: string
          created_at?: string | null
          id?: string
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          id: string
          image_url: string | null
          name: string
          name_ar: string
          parent_id: string | null
          slug: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          name: string
          name_ar: string
          parent_id?: string | null
          slug?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          image_url?: string | null
          name?: string
          name_ar?: string
          parent_id?: string | null
          slug?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          color: string | null
          id: string
          order_id: string | null
          product_id: string | null
          quantity: number
          size: string | null
          total: number | null
          unit_price: number
        }
        Insert: {
          color?: string | null
          id?: string
          order_id?: string | null
          product_id?: string | null
          quantity?: number
          size?: string | null
          total?: number | null
          unit_price?: number
        }
        Update: {
          color?: string | null
          id?: string
          order_id?: string | null
          product_id?: string | null
          quantity?: number
          size?: string | null
          total?: number | null
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          address: string | null
          created_at: string | null
          customer_name: string | null
          customer_phone: string | null
          delivery_price: number | null
          delivery_type: string | null
          id: string
          items: Json | null
          owner_id: string | null
          status: string
          total_price: number | null
          updated_at: string | null
          wilaya_id: number | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivery_price?: number | null
          delivery_type?: string | null
          id?: string
          items?: Json | null
          owner_id?: string | null
          status?: string
          total_price?: number | null
          updated_at?: string | null
          wilaya_id?: number | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          customer_name?: string | null
          customer_phone?: string | null
          delivery_price?: number | null
          delivery_type?: string | null
          id?: string
          items?: Json | null
          owner_id?: string | null
          status?: string
          total_price?: number | null
          updated_at?: string | null
          wilaya_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "store_owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_wilaya_id_fkey"
            columns: ["wilaya_id"]
            isOneToOne: false
            referencedRelation: "wilayas"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          category_id: string | null
          colors: string[] | null
          created_at: string | null
          description: string | null
          description_ar: string | null
          id: string
          image_url: string | null
          images: Json | null
          is_delivery_desk_available: boolean | null
          is_delivery_home_available: boolean | null
          is_free_delivery: boolean | null
          is_sold_out: boolean | null
          name: string
          name_ar: string
          owner_id: string | null
          price: number
          sizes: string[] | null
          supplier_name: string | null
          updated_at: string | null
        }
        Insert: {
          category_id?: string | null
          colors?: string[] | null
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          id?: string
          image_url?: string | null
          images?: Json | null
          is_delivery_desk_available?: boolean | null
          is_delivery_home_available?: boolean | null
          is_free_delivery?: boolean | null
          is_sold_out?: boolean | null
          name: string
          name_ar: string
          owner_id?: string | null
          price?: number
          sizes?: string[] | null
          supplier_name?: string | null
          updated_at?: string | null
        }
        Update: {
          category_id?: string | null
          colors?: string[] | null
          created_at?: string | null
          description?: string | null
          description_ar?: string | null
          id?: string
          image_url?: string | null
          images?: Json | null
          is_delivery_desk_available?: boolean | null
          is_delivery_home_available?: boolean | null
          is_free_delivery?: boolean | null
          is_sold_out?: boolean | null
          name?: string
          name_ar?: string
          owner_id?: string | null
          price?: number
          sizes?: string[] | null
          supplier_name?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "store_owners"
            referencedColumns: ["id"]
          },
        ]
      }
      store_owners: {
        Row: {
          address: string | null
          created_at: string | null
          email: string | null
          facebook_link: string | null
          id: string
          instagram_link: string | null
          owner_name: string
          password: string | null
          phone: string | null
          store_image_url: string | null
          store_number: string | null
          tiktok_link: string | null
          user_id: string | null
          username: string | null
          whatsapp_number: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          facebook_link?: string | null
          id?: string
          instagram_link?: string | null
          owner_name: string
          password?: string | null
          phone?: string | null
          store_image_url?: string | null
          store_number?: string | null
          tiktok_link?: string | null
          user_id?: string | null
          username?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          email?: string | null
          facebook_link?: string | null
          id?: string
          instagram_link?: string | null
          owner_name?: string
          password?: string | null
          phone?: string | null
          store_image_url?: string | null
          store_number?: string | null
          tiktok_link?: string | null
          user_id?: string | null
          username?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      wilayas: {
        Row: {
          created_at: string | null
          desk_delivery_price: number | null
          home_delivery_price: number | null
          id: number
          name: string
          name_ar: string
        }
        Insert: {
          created_at?: string | null
          desk_delivery_price?: number | null
          home_delivery_price?: number | null
          id?: number
          name: string
          name_ar: string
        }
        Update: {
          created_at?: string | null
          desk_delivery_price?: number | null
          home_delivery_price?: number | null
          id?: number
          name?: string
          name_ar?: string
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
