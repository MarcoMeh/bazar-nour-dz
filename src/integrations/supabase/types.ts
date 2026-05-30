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
      categories: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          name: string
          name_ar: string | null
          slug: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          name_ar?: string | null
          slug?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          name_ar?: string | null
          slug?: string | null
        }
        Relationships: []
      }
      delivery_companies: {
        Row: {
          address: string | null
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          phone1: string | null
          phone2: string | null
          phone3: string | null
          website_url: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          phone1?: string | null
          phone2?: string | null
          phone3?: string | null
          website_url?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          phone1?: string | null
          phone2?: string | null
          phone3?: string | null
          website_url?: string | null
        }
        Relationships: []
      }
      delivery_zones: {
        Row: {
          company_id: string | null
          created_at: string | null
          id: string
          name: string
          price_desk: number
          price_home: number
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          name: string
          price_desk?: number
          price_home?: number
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          id?: string
          name?: string
          price_desk?: number
          price_home?: number
        }
        Relationships: [
          {
            foreignKeyName: "delivery_zones_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "delivery_companies"
            referencedColumns: ["id"]
          },
        ]
      }
      expenses: {
        Row: {
          amount: number
          category: string | null
          created_at: string | null
          created_by: string | null
          expense_date: string | null
          id: string
          notes: string | null
          title: string
        }
        Insert: {
          amount: number
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          expense_date?: string | null
          id?: string
          notes?: string | null
          title: string
        }
        Update: {
          amount?: number
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          expense_date?: string | null
          id?: string
          notes?: string | null
          title?: string
        }
        Relationships: []
      }
      flash_sale_items: {
        Row: {
          created_at: string
          id: string
          product_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "flash_sale_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          order_id: string | null
          store_id: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          order_id?: string | null
          store_id?: string | null
          title: string
          type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          order_id?: string | null
          store_id?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          order_id: string
          price: number
          product_id: string | null
          quantity: number
          selected_color: string | null
          selected_size: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          order_id: string
          price: number
          product_id?: string | null
          quantity: number
          selected_color?: string | null
          selected_size?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          order_id?: string
          price?: number
          product_id?: string | null
          quantity?: number
          selected_color?: string | null
          selected_size?: string | null
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
          address: string
          created_at: string
          delivery_option: string
          delivery_price: number
          full_name: string
          group_id: string | null
          id: string
          phone: string
          status: string | null
          store_id: string | null
          store_ids: string[] | null
          total_price: number
          user_id: string | null
          wilaya_id: number | null
        }
        Insert: {
          address: string
          created_at?: string
          delivery_option: string
          delivery_price?: number
          full_name: string
          group_id?: string | null
          id?: string
          phone: string
          status?: string | null
          store_id?: string | null
          store_ids?: string[] | null
          total_price: number
          user_id?: string | null
          wilaya_id?: number | null
        }
        Update: {
          address?: string
          created_at?: string
          delivery_option?: string
          delivery_price?: number
          full_name?: string
          group_id?: string | null
          id?: string
          phone?: string
          status?: string | null
          store_id?: string | null
          store_ids?: string[] | null
          total_price?: number
          user_id?: string | null
          wilaya_id?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "orders_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
      page_backgrounds: {
        Row: {
          created_at: string
          id: string
          image_url: string | null
          page_key: string
          page_name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url?: string | null
          page_key: string
          page_name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string | null
          page_key?: string
          page_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_variants: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          product_id: string
          size: string | null
          stock_quantity: number
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          product_id: string
          size?: string | null
          stock_quantity?: number
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          product_id?: string
          size?: string | null
          stock_quantity?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          additional_images: string[] | null
          brand: string | null
          category_id: string | null
          colors: string[] | null
          created_at: string
          delivery_type: string | null
          description: string | null
          description_ar: string | null
          has_colors: boolean | null
          has_sizes: boolean | null
          home_delivery: boolean | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_delivery_desk_available: boolean | null
          is_delivery_home_available: boolean | null
          is_free_delivery: boolean | null
          is_sold_out: boolean | null
          low_stock_threshold: number | null
          material: string | null
          name: string | null
          name_ar: string | null
          office_delivery: boolean | null
          price: number
          sizes: string[] | null
          store_id: string | null
          subcategory_id: string | null
          track_inventory: boolean | null
          updated_at: string | null
        }
        Insert: {
          additional_images?: string[] | null
          brand?: string | null
          category_id?: string | null
          colors?: string[] | null
          created_at?: string
          delivery_type?: string | null
          description?: string | null
          description_ar?: string | null
          has_colors?: boolean | null
          has_sizes?: boolean | null
          home_delivery?: boolean | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_delivery_desk_available?: boolean | null
          is_delivery_home_available?: boolean | null
          is_free_delivery?: boolean | null
          is_sold_out?: boolean | null
          low_stock_threshold?: number | null
          material?: string | null
          name?: string | null
          name_ar?: string | null
          office_delivery?: boolean | null
          price: number
          sizes?: string[] | null
          store_id?: string | null
          subcategory_id?: string | null
          track_inventory?: boolean | null
          updated_at?: string | null
        }
        Update: {
          additional_images?: string[] | null
          brand?: string | null
          category_id?: string | null
          colors?: string[] | null
          created_at?: string
          delivery_type?: string | null
          description?: string | null
          description_ar?: string | null
          has_colors?: boolean | null
          has_sizes?: boolean | null
          home_delivery?: boolean | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          is_delivery_desk_available?: boolean | null
          is_delivery_home_available?: boolean | null
          is_free_delivery?: boolean | null
          is_sold_out?: boolean | null
          low_stock_threshold?: number | null
          material?: string | null
          name?: string | null
          name_ar?: string | null
          office_delivery?: boolean | null
          price?: number
          sizes?: string[] | null
          store_id?: string | null
          subcategory_id?: string | null
          track_inventory?: boolean | null
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
            foreignKeyName: "products_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_subcategory_id_fkey"
            columns: ["subcategory_id"]
            isOneToOne: false
            referencedRelation: "subcategories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          phone: string | null
          role: string
          username: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          phone?: string | null
          role?: string
          username?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          phone?: string | null
          role?: string
          username?: string | null
        }
        Relationships: []
      }
      promo_codes: {
        Row: {
          code: string
          created_at: string
          discount_price: number | null
          id: string
          influencer_name: string
          influencer_phone: string | null
          is_active: boolean | null
        }
        Insert: {
          code: string
          created_at?: string
          discount_price?: number | null
          id?: string
          influencer_name: string
          influencer_phone?: string | null
          is_active?: boolean | null
        }
        Update: {
          code?: string
          created_at?: string
          discount_price?: number | null
          id?: string
          influencer_name?: string
          influencer_phone?: string | null
          is_active?: boolean | null
        }
        Relationships: []
      }
      reviews: {
        Row: {
          comment: string | null
          created_at: string
          id: string
          is_approved: boolean | null
          product_id: string
          rating: number
          user_name: string
        }
        Insert: {
          comment?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean | null
          product_id: string
          rating: number
          user_name: string
        }
        Update: {
          comment?: string | null
          created_at?: string
          id?: string
          is_approved?: boolean | null
          product_id?: string
          rating?: number
          user_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      site_settings: {
        Row: {
          address: string | null
          categories_visible: boolean | null
          created_at: string | null
          email: string | null
          facebook_url: string | null
          features_visible: boolean | null
          flash_sale_visible: boolean | null
          hero_visible: boolean | null
          id: string
          instagram_url: string | null
          logo_url: string | null
          newsletter_visible: boolean | null
          phone_number: string | null
          products_visible: boolean | null
          site_name: string | null
          stores_visible: boolean | null
          tiktok_url: string | null
          trending_visible: boolean | null
          updated_at: string | null
          whatsapp_number: string | null
        }
        Insert: {
          address?: string | null
          categories_visible?: boolean | null
          created_at?: string | null
          email?: string | null
          facebook_url?: string | null
          features_visible?: boolean | null
          flash_sale_visible?: boolean | null
          hero_visible?: boolean | null
          id?: string
          instagram_url?: string | null
          logo_url?: string | null
          newsletter_visible?: boolean | null
          phone_number?: string | null
          products_visible?: boolean | null
          site_name?: string | null
          stores_visible?: boolean | null
          tiktok_url?: string | null
          trending_visible?: boolean | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Update: {
          address?: string | null
          categories_visible?: boolean | null
          created_at?: string | null
          email?: string | null
          facebook_url?: string | null
          features_visible?: boolean | null
          flash_sale_visible?: boolean | null
          hero_visible?: boolean | null
          id?: string
          instagram_url?: string | null
          logo_url?: string | null
          newsletter_visible?: boolean | null
          phone_number?: string | null
          products_visible?: boolean | null
          site_name?: string | null
          stores_visible?: boolean | null
          tiktok_url?: string | null
          trending_visible?: boolean | null
          updated_at?: string | null
          whatsapp_number?: string | null
        }
        Relationships: []
      }
      store_categories: {
        Row: {
          category_id: string
          created_at: string | null
          id: string
          store_id: string
        }
        Insert: {
          category_id: string
          created_at?: string | null
          id?: string
          store_id: string
        }
        Update: {
          category_id?: string
          created_at?: string | null
          id?: string
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_categories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_categories_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_category_relations: {
        Row: {
          category_id: string
          created_at: string | null
          store_id: string
        }
        Insert: {
          category_id: string
          created_at?: string | null
          store_id: string
        }
        Update: {
          category_id?: string
          created_at?: string | null
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_category_relations_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_category_relations_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_delivery_overrides: {
        Row: {
          created_at: string | null
          id: string
          is_desk_enabled: boolean | null
          is_home_enabled: boolean | null
          price_desk: number | null
          price_home: number | null
          store_id: string | null
          wilaya_code: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_desk_enabled?: boolean | null
          is_home_enabled?: boolean | null
          price_desk?: number | null
          price_home?: number | null
          store_id?: string | null
          wilaya_code: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_desk_enabled?: boolean | null
          is_home_enabled?: boolean | null
          price_desk?: number | null
          price_home?: number | null
          store_id?: string | null
          wilaya_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_delivery_overrides_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_delivery_settings: {
        Row: {
          company_id: string
          created_at: string | null
          is_active: boolean | null
          store_id: string
        }
        Insert: {
          company_id: string
          created_at?: string | null
          is_active?: boolean | null
          store_id: string
        }
        Update: {
          company_id?: string
          created_at?: string | null
          is_active?: boolean | null
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "store_delivery_settings_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "delivery_companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "store_delivery_settings_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      store_registration_requests: {
        Row: {
          admin_notes: string | null
          created_at: string | null
          description: string | null
          email: string
          id: string
          owner_name: string
          phone: string
          promo_code: string | null
          selected_plan: string | null
          status: string
          store_name: string
          updated_at: string | null
          wilaya: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string | null
          description?: string | null
          email: string
          id?: string
          owner_name: string
          phone: string
          promo_code?: string | null
          selected_plan?: string | null
          status?: string
          store_name: string
          updated_at?: string | null
          wilaya: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string | null
          description?: string | null
          email?: string
          id?: string
          owner_name?: string
          phone?: string
          promo_code?: string | null
          selected_plan?: string | null
          status?: string
          store_name?: string
          updated_at?: string | null
          wilaya?: string
        }
        Relationships: []
      }
      stores: {
        Row: {
          background_color: string | null
          category_id: string | null
          cover_image_url: string | null
          created_at: string
          description: string | null
          facebook: string | null
          id: string
          image_url: string | null
          instagram: string | null
          is_active: boolean | null
          is_manually_suspended: boolean | null
          location_url: string | null
          name: string
          opening_hours: string | null
          owner_id: string
          phone_numbers: string[] | null
          primary_color: string | null
          return_policy: string | null
          secondary_color: string | null
          slug: string | null
          subscription_end_date: string | null
          text_color: string | null
          theme_id: string | null
          tiktok: string | null
          whatsapp: string | null
        }
        Insert: {
          background_color?: string | null
          category_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          facebook?: string | null
          id?: string
          image_url?: string | null
          instagram?: string | null
          is_active?: boolean | null
          is_manually_suspended?: boolean | null
          location_url?: string | null
          name: string
          opening_hours?: string | null
          owner_id: string
          phone_numbers?: string[] | null
          primary_color?: string | null
          return_policy?: string | null
          secondary_color?: string | null
          slug?: string | null
          subscription_end_date?: string | null
          text_color?: string | null
          theme_id?: string | null
          tiktok?: string | null
          whatsapp?: string | null
        }
        Update: {
          background_color?: string | null
          category_id?: string | null
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          facebook?: string | null
          id?: string
          image_url?: string | null
          instagram?: string | null
          is_active?: boolean | null
          is_manually_suspended?: boolean | null
          location_url?: string | null
          name?: string
          opening_hours?: string | null
          owner_id?: string
          phone_numbers?: string[] | null
          primary_color?: string | null
          return_policy?: string | null
          secondary_color?: string | null
          slug?: string | null
          subscription_end_date?: string | null
          text_color?: string | null
          theme_id?: string | null
          tiktok?: string | null
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stores_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subcategories: {
        Row: {
          category_id: string
          created_at: string
          id: string
          image_url: string | null
          name: string
          slug: string | null
        }
        Insert: {
          category_id: string
          created_at?: string
          id?: string
          image_url?: string | null
          name: string
          slug?: string | null
        }
        Update: {
          category_id?: string
          created_at?: string
          id?: string
          image_url?: string | null
          name?: string
          slug?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "subcategories_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_logs: {
        Row: {
          amount: number
          created_at: string | null
          days_added: number
          id: string
          notes: string | null
          payment_date: string | null
          proof_image_url: string | null
          store_id: string
        }
        Insert: {
          amount: number
          created_at?: string | null
          days_added: number
          id?: string
          notes?: string | null
          payment_date?: string | null
          proof_image_url?: string | null
          store_id: string
        }
        Update: {
          amount?: number
          created_at?: string | null
          days_added?: number
          id?: string
          notes?: string | null
          payment_date?: string | null
          proof_image_url?: string | null
          store_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_logs_store_id_fkey"
            columns: ["store_id"]
            isOneToOne: false
            referencedRelation: "stores"
            referencedColumns: ["id"]
          },
        ]
      }
      wilayas: {
        Row: {
          code: string
          created_at: string
          delivery_price: number
          desk_delivery_available: boolean | null
          desk_delivery_price: number | null
          home_delivery_available: boolean | null
          home_delivery_price: number | null
          id: number
          name: string | null
          name_ar: string
        }
        Insert: {
          code: string
          created_at?: string
          delivery_price?: number
          desk_delivery_available?: boolean | null
          desk_delivery_price?: number | null
          home_delivery_available?: boolean | null
          home_delivery_price?: number | null
          id?: number
          name?: string | null
          name_ar: string
        }
        Update: {
          code?: string
          created_at?: string
          delivery_price?: number
          desk_delivery_available?: boolean | null
          desk_delivery_price?: number | null
          home_delivery_available?: boolean | null
          home_delivery_price?: number | null
          id?: number
          name?: string | null
          name_ar?: string
        }
        Relationships: []
      }
      zone_wilayas: {
        Row: {
          created_at: string | null
          id: string
          wilaya_code: string
          zone_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          wilaya_code: string
          zone_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          wilaya_code?: string
          zone_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "zone_wilayas_zone_id_fkey"
            columns: ["zone_id"]
            isOneToOne: false
            referencedRelation: "delivery_zones"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_order: {
        Args: { items_payload: Json; order_payload: Json }
        Returns: string
      }
      create_profile_for_user: {
        Args: {
          user_address: string
          user_email: string
          user_full_name: string
          user_id: string
          user_phone: string
          user_role: string
        }
        Returns: undefined
      }
      extend_store_subscription: {
        Args: {
          p_amount: number
          p_days: number
          p_notes?: string
          p_proof_url?: string
          p_store_id: string
        }
        Returns: undefined
      }
      get_flash_sale_products: {
        Args: never
        Returns: {
          additional_images: string[] | null
          brand: string | null
          category_id: string | null
          colors: string[] | null
          created_at: string
          delivery_type: string | null
          description: string | null
          description_ar: string | null
          has_colors: boolean | null
          has_sizes: boolean | null
          home_delivery: boolean | null
          id: string
          image_url: string | null
          is_active: boolean | null
          is_delivery_desk_available: boolean | null
          is_delivery_home_available: boolean | null
          is_free_delivery: boolean | null
          is_sold_out: boolean | null
          low_stock_threshold: number | null
          material: string | null
          name: string | null
          name_ar: string | null
          office_delivery: boolean | null
          price: number
          sizes: string[] | null
          store_id: string | null
          subcategory_id: string | null
          track_inventory: boolean | null
          updated_at: string | null
        }[]
        SetofOptions: {
          from: "*"
          to: "products"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      get_flash_sale_products_json: { Args: never; Returns: Json }
      get_login_email: { Args: { identifier: string }; Returns: string }
      get_store_orders: {
        Args: { p_store_id: string }
        Returns: {
          address: string
          created_at: string
          delivery_option: string
          delivery_price: number
          full_name: string
          group_id: string | null
          id: string
          phone: string
          status: string | null
          store_id: string | null
          store_ids: string[] | null
          total_price: number
          user_id: string | null
          wilaya_id: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "orders"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      is_admin: { Args: never; Returns: boolean }
      is_store_owner: { Args: never; Returns: boolean }
    }
    Enums: {
      delivery_type: "free" | "home" | "desktop" | "sold-out"
      order_status:
        | "pending"
        | "processing"
        | "shipped"
        | "delivered"
        | "cancelled"
      user_role: "admin" | "sub_admin" | "store_owner" | "customer"
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
      delivery_type: ["free", "home", "desktop", "sold-out"],
      order_status: [
        "pending",
        "processing",
        "shipped",
        "delivered",
        "cancelled",
      ],
      user_role: ["admin", "sub_admin", "store_owner", "customer"],
    },
  },
} as const
