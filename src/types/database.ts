export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.4";
  };
  public: {
    Tables: {
      clients: {
        Row: {
          city: string | null;
          created_at: string | null;
          date_of_birth: string | null;
          entrepreneur_id: string;
          gender: string | null;
          house_number: string | null;
          house_number_addition: string | null;
          id: string;
          last_name: string;
          phone_number: string | null;
          email: string | null;
          place_of_birth: string | null;
          postal_code: string | null;
          preferred_name: string;
          street: string | null;
          updated_at: string | null;
        };
        Insert: {
          city?: string | null;
          created_at?: string | null;
          date_of_birth?: string | null;
          entrepreneur_id: string;
          gender?: string | null;
          house_number?: string | null;
          house_number_addition?: string | null;
          id?: string;
          last_name: string;
          phone_number?: string | null;
          email?: string | null;
          place_of_birth?: string | null;
          postal_code?: string | null;
          preferred_name: string;
          street?: string | null;
          updated_at?: string | null;
        };
        Update: {
          city?: string | null;
          created_at?: string | null;
          date_of_birth?: string | null;
          entrepreneur_id?: string;
          gender?: string | null;
          house_number?: string | null;
          house_number_addition?: string | null;
          id?: string;
          last_name?: string;
          phone_number?: string | null;
          email?: string | null;
          place_of_birth?: string | null;
          postal_code?: string | null;
          preferred_name?: string;
          street?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "clients_entrepreneur_id_fkey";
            columns: ["entrepreneur_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      company_branding: {
        Row: {
          accent_color: string | null;
          body_font: string | null;
          created_at: string | null;
          entrepreneur_id: string;
          footer_text: string | null;
          header_font: string | null;
          id: string;
          letterhead_template_url: string | null;
          logo_url: string | null;
          primary_color: string | null;
          secondary_color: string | null;
          updated_at: string | null;
        };
        Insert: {
          accent_color?: string | null;
          body_font?: string | null;
          created_at?: string | null;
          entrepreneur_id: string;
          footer_text?: string | null;
          header_font?: string | null;
          id?: string;
          letterhead_template_url?: string | null;
          logo_url?: string | null;
          primary_color?: string | null;
          secondary_color?: string | null;
          updated_at?: string | null;
        };
        Update: {
          accent_color?: string | null;
          body_font?: string | null;
          created_at?: string | null;
          entrepreneur_id?: string;
          footer_text?: string | null;
          header_font?: string | null;
          id?: string;
          letterhead_template_url?: string | null;
          logo_url?: string | null;
          primary_color?: string | null;
          secondary_color?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "company_branding_entrepreneur_id_fkey";
            columns: ["entrepreneur_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      deceased: {
        Row: {
          city: string | null;
          coffin_registration_number: string | null;
          created_at: string | null;
          date_of_birth: string | null;
          date_of_death: string | null;
          entrepreneur_id: string;
          first_names: string;
          gender: string | null;
          house_number: string | null;
          house_number_addition: string | null;
          id: string;
          last_name: string;
          place_of_birth: string | null;
          postal_code: string | null;
          preferred_name: string | null;
          social_security_number: string | null;
          street: string | null;
          updated_at: string | null;
        };
        Insert: {
          city?: string | null;
          coffin_registration_number?: string | null;
          created_at?: string | null;
          date_of_birth?: string | null;
          date_of_death?: string | null;
          entrepreneur_id: string;
          first_names: string;
          gender?: string | null;
          house_number?: string | null;
          house_number_addition?: string | null;
          id?: string;
          last_name: string;
          place_of_birth?: string | null;
          postal_code?: string | null;
          preferred_name?: string | null;
          social_security_number?: string | null;
          street?: string | null;
          updated_at?: string | null;
        };
        Update: {
          city?: string | null;
          coffin_registration_number?: string | null;
          created_at?: string | null;
          date_of_birth?: string | null;
          date_of_death?: string | null;
          entrepreneur_id?: string;
          first_names?: string;
          gender?: string | null;
          house_number?: string | null;
          house_number_addition?: string | null;
          id?: string;
          last_name?: string;
          place_of_birth?: string | null;
          postal_code?: string | null;
          preferred_name?: string | null;
          social_security_number?: string | null;
          street?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "deceased_entrepreneur_id_fkey";
            columns: ["entrepreneur_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      documents: {
        Row: {
          created_at: string | null;
          description: string | null;
          entrepreneur_id: string;
          file_name: string;
          file_size: number | null;
          file_type: string | null;
          funeral_id: string;
          id: string;
          storage_path: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          description?: string | null;
          entrepreneur_id: string;
          file_name: string;
          file_size?: number | null;
          file_type?: string | null;
          funeral_id: string;
          id?: string;
          storage_path: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          description?: string | null;
          entrepreneur_id?: string;
          file_name?: string;
          file_size?: number | null;
          file_type?: string | null;
          funeral_id?: string;
          id?: string;
          storage_path?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "documents_entrepreneur_id_fkey";
            columns: ["entrepreneur_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "documents_funeral_id_fkey";
            columns: ["funeral_id"];
            isOneToOne: false;
            referencedRelation: "funeral_cost_breakdown";
            referencedColumns: ["funeral_id"];
          },
          {
            foreignKeyName: "documents_funeral_id_fkey";
            columns: ["funeral_id"];
            isOneToOne: false;
            referencedRelation: "funeral_costs";
            referencedColumns: ["funeral_id"];
          },
          {
            foreignKeyName: "documents_funeral_id_fkey";
            columns: ["funeral_id"];
            isOneToOne: false;
            referencedRelation: "funerals";
            referencedColumns: ["id"];
          }
        ];
      };
      funeral_estimate_items: {
        Row: {
          estimate_id: string;
          id: string;
          product_name: string;
          quantity: number | null;
          supplier_id: string;
          total_price: number | null;
          unit_price: number;
        };
        Insert: {
          estimate_id: string;
          id?: string;
          product_name: string;
          quantity?: number | null;
          supplier_id: string;
          total_price?: number | null;
          unit_price: number;
        };
        Update: {
          estimate_id?: string;
          id?: string;
          product_name?: string;
          quantity?: number | null;
          supplier_id?: string;
          total_price?: number | null;
          unit_price?: number;
        };
        Relationships: [
          {
            foreignKeyName: "funeral_estimate_items_estimate_id_fkey";
            columns: ["estimate_id"];
            isOneToOne: false;
            referencedRelation: "funeral_estimates";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "funeral_estimate_items_supplier_id_fkey";
            columns: ["supplier_id"];
            isOneToOne: false;
            referencedRelation: "funeral_cost_breakdown";
            referencedColumns: ["supplier_id"];
          },
          {
            foreignKeyName: "funeral_estimate_items_supplier_id_fkey";
            columns: ["supplier_id"];
            isOneToOne: false;
            referencedRelation: "suppliers";
            referencedColumns: ["id"];
          }
        ];
      };
      funeral_estimates: {
        Row: {
          created_at: string | null;
          entrepreneur_id: string;
          funeral_id: string;
          id: string;
          notes: string | null;
          updated_at: string | null;
          valid_until: string | null;
          version: number | null;
        };
        Insert: {
          created_at?: string | null;
          entrepreneur_id: string;
          funeral_id: string;
          id?: string;
          notes?: string | null;
          updated_at?: string | null;
          valid_until?: string | null;
          version?: number | null;
        };
        Update: {
          created_at?: string | null;
          entrepreneur_id?: string;
          funeral_id?: string;
          id?: string;
          notes?: string | null;
          updated_at?: string | null;
          valid_until?: string | null;
          version?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "funeral_estimates_entrepreneur_id_fkey";
            columns: ["entrepreneur_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "funeral_estimates_funeral_id_fkey";
            columns: ["funeral_id"];
            isOneToOne: false;
            referencedRelation: "funeral_cost_breakdown";
            referencedColumns: ["funeral_id"];
          },
          {
            foreignKeyName: "funeral_estimates_funeral_id_fkey";
            columns: ["funeral_id"];
            isOneToOne: false;
            referencedRelation: "funeral_costs";
            referencedColumns: ["funeral_id"];
          },
          {
            foreignKeyName: "funeral_estimates_funeral_id_fkey";
            columns: ["funeral_id"];
            isOneToOne: false;
            referencedRelation: "funerals";
            referencedColumns: ["id"];
          }
        ];
      };
      funeral_final_invoices: {
        Row: {
          created_at: string | null;
          due_date: string | null;
          entrepreneur_id: string;
          funeral_id: string;
          id: string;
          invoice_number: string;
          issue_date: string | null;
          notes: string | null;
          total_amount: number | null;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          due_date?: string | null;
          entrepreneur_id: string;
          funeral_id: string;
          id?: string;
          invoice_number: string;
          issue_date?: string | null;
          notes?: string | null;
          total_amount?: number | null;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          due_date?: string | null;
          entrepreneur_id?: string;
          funeral_id?: string;
          id?: string;
          invoice_number?: string;
          issue_date?: string | null;
          notes?: string | null;
          total_amount?: number | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "funeral_final_invoices_entrepreneur_id_fkey";
            columns: ["entrepreneur_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "funeral_final_invoices_funeral_id_fkey";
            columns: ["funeral_id"];
            isOneToOne: false;
            referencedRelation: "funeral_cost_breakdown";
            referencedColumns: ["funeral_id"];
          },
          {
            foreignKeyName: "funeral_final_invoices_funeral_id_fkey";
            columns: ["funeral_id"];
            isOneToOne: false;
            referencedRelation: "funeral_costs";
            referencedColumns: ["funeral_id"];
          },
          {
            foreignKeyName: "funeral_final_invoices_funeral_id_fkey";
            columns: ["funeral_id"];
            isOneToOne: false;
            referencedRelation: "funerals";
            referencedColumns: ["id"];
          }
        ];
      };
      funeral_contacts: {
        Row: {
          id: string;
          created_at: string | null;
          updated_at: string | null;
          entrepreneur_id: string;
          funeral_id: string;
          client_id: string;
          relation: string | null;
          is_primary: boolean | null;
          notes: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string | null;
          updated_at?: string | null;
          entrepreneur_id: string;
          funeral_id: string;
          client_id: string;
          relation?: string | null;
          is_primary?: boolean | null;
          notes?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string | null;
          updated_at?: string | null;
          entrepreneur_id?: string;
          funeral_id?: string;
          client_id?: string;
          relation?: string | null;
          is_primary?: boolean | null;
          notes?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "funeral_contacts_entrepreneur_id_fkey";
            columns: ["entrepreneur_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "funeral_contacts_funeral_id_fkey";
            columns: ["funeral_id"];
            isOneToOne: false;
            referencedRelation: "funerals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "funeral_contacts_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          }
        ];
      };
      funeral_invoice_items: {
        Row: {
          id: string;
          invoice_id: string;
          product_name: string;
          quantity: number | null;
          supplier_id: string | null;
          total_price: number | null;
          unit_price: number;
        };
        Insert: {
          id?: string;
          invoice_id: string;
          product_name: string;
          quantity?: number | null;
          supplier_id?: string | null;
          total_price?: number | null;
          unit_price: number;
        };
        Update: {
          id?: string;
          invoice_id?: string;
          product_name?: string;
          quantity?: number | null;
          supplier_id?: string | null;
          total_price?: number | null;
          unit_price?: number;
        };
        Relationships: [
          {
            foreignKeyName: "funeral_invoice_items_invoice_id_fkey";
            columns: ["invoice_id"];
            isOneToOne: false;
            referencedRelation: "funeral_final_invoices";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "funeral_invoice_items_supplier_id_fkey";
            columns: ["supplier_id"];
            isOneToOne: false;
            referencedRelation: "funeral_cost_breakdown";
            referencedColumns: ["supplier_id"];
          },
          {
            foreignKeyName: "funeral_invoice_items_supplier_id_fkey";
            columns: ["supplier_id"];
            isOneToOne: false;
            referencedRelation: "suppliers";
            referencedColumns: ["id"];
          }
        ];
      };
      funeral_suppliers: {
        Row: {
          created_at: string | null;
          entrepreneur_id: string;
          funeral_id: string;
          id: string;
          notes: string | null;
          product_name: string;
          quantity: number | null;
          supplier_id: string;
          total_price: number | null;
          unit_price: number;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          entrepreneur_id: string;
          funeral_id: string;
          id?: string;
          notes?: string | null;
          product_name: string;
          quantity?: number | null;
          supplier_id: string;
          total_price?: number | null;
          unit_price: number;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          entrepreneur_id?: string;
          funeral_id?: string;
          id?: string;
          notes?: string | null;
          product_name?: string;
          quantity?: number | null;
          supplier_id?: string;
          total_price?: number | null;
          unit_price?: number;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "funeral_suppliers_entrepreneur_id_fkey";
            columns: ["entrepreneur_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "funeral_suppliers_funeral_id_fkey";
            columns: ["funeral_id"];
            isOneToOne: false;
            referencedRelation: "funeral_cost_breakdown";
            referencedColumns: ["funeral_id"];
          },
          {
            foreignKeyName: "funeral_suppliers_funeral_id_fkey";
            columns: ["funeral_id"];
            isOneToOne: false;
            referencedRelation: "funeral_costs";
            referencedColumns: ["funeral_id"];
          },
          {
            foreignKeyName: "funeral_suppliers_funeral_id_fkey";
            columns: ["funeral_id"];
            isOneToOne: false;
            referencedRelation: "funerals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "funeral_suppliers_supplier_id_fkey";
            columns: ["supplier_id"];
            isOneToOne: false;
            referencedRelation: "funeral_cost_breakdown";
            referencedColumns: ["supplier_id"];
          },
          {
            foreignKeyName: "funeral_suppliers_supplier_id_fkey";
            columns: ["supplier_id"];
            isOneToOne: false;
            referencedRelation: "suppliers";
            referencedColumns: ["id"];
          }
        ];
      };
      funeral_notes: {
        Row: {
          id: string;
          created_at: string | null;
          updated_at: string | null;
          entrepreneur_id: string;
          funeral_id: string;
          title: string;
          content: string;
          is_important: boolean | null;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string | null;
          updated_at?: string | null;
          entrepreneur_id: string;
          funeral_id: string;
          title: string;
          content: string;
          is_important?: boolean | null;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string | null;
          updated_at?: string | null;
          entrepreneur_id?: string;
          funeral_id?: string;
          title?: string;
          content?: string;
          is_important?: boolean | null;
          created_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "funeral_notes_entrepreneur_id_fkey";
            columns: ["entrepreneur_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "funeral_notes_funeral_id_fkey";
            columns: ["funeral_id"];
            isOneToOne: false;
            referencedRelation: "funerals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "funeral_notes_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      funeral_scenarios: {
        Row: {
          id: string;
          created_at: string | null;
          updated_at: string | null;
          entrepreneur_id: string;
          funeral_id: string;
          section: string;
          item_type: string;
          title: string;
          description: string | null;
          extra_field_label: string | null;
          extra_field_value: string | null;
          order_in_section: number | null;
          is_active: boolean | null;
          created_by: string | null;
        };
        Insert: {
          id?: string;
          created_at?: string | null;
          updated_at?: string | null;
          entrepreneur_id: string;
          funeral_id: string;
          section: string;
          item_type: string;
          title: string;
          description?: string | null;
          extra_field_label?: string | null;
          extra_field_value?: string | null;
          order_in_section?: number | null;
          is_active?: boolean | null;
          created_by?: string | null;
        };
        Update: {
          id?: string;
          created_at?: string | null;
          updated_at?: string | null;
          entrepreneur_id?: string;
          funeral_id?: string;
          section?: string;
          item_type?: string;
          title?: string;
          description?: string | null;
          extra_field_label?: string | null;
          extra_field_value?: string | null;
          order_in_section?: number | null;
          is_active?: boolean | null;
          created_by?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "funeral_scenarios_entrepreneur_id_fkey";
            columns: ["entrepreneur_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "funeral_scenarios_funeral_id_fkey";
            columns: ["funeral_id"];
            isOneToOne: false;
            referencedRelation: "funerals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "funeral_scenarios_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      funerals: {
        Row: {
          client_id: string;
          created_at: string | null;
          deceased_id: string;
          entrepreneur_id: string;
          funeral_director: string | null;
          id: string;
          location: string | null;
          signing_date: string | null;
          updated_at: string | null;
        };
        Insert: {
          client_id: string;
          created_at?: string | null;
          deceased_id: string;
          entrepreneur_id: string;
          funeral_director?: string | null;
          id?: string;
          location?: string | null;
          signing_date?: string | null;
          updated_at?: string | null;
        };
        Update: {
          client_id?: string;
          created_at?: string | null;
          deceased_id?: string;
          entrepreneur_id?: string;
          funeral_director?: string | null;
          id?: string;
          location?: string | null;
          signing_date?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "funerals_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "funerals_deceased_id_fkey";
            columns: ["deceased_id"];
            isOneToOne: false;
            referencedRelation: "deceased";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "funerals_entrepreneur_id_fkey";
            columns: ["entrepreneur_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      profiles: {
        Row: {
          avatar_url: string | null;
          company_name: string | null;
          created_at: string | null;
          full_name: string | null;
          id: string;
          phone_number: string | null;
          updated_at: string | null;
          phone: string | null;
          address: string | null;
          city: string | null;
          postal_code: string | null;
          kvk_number: string | null;
          btw_number: string | null;
          website: string | null;
          description: string | null;
          onboarding_completed: boolean | null;
        };
        Insert: {
          avatar_url?: string | null;
          company_name?: string | null;
          created_at?: string | null;
          full_name?: string | null;
          id: string;
          phone_number?: string | null;
          updated_at?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          postal_code?: string | null;
          kvk_number?: string | null;
          btw_number?: string | null;
          website?: string | null;
          description?: string | null;
          onboarding_completed?: boolean | null;
        };
        Update: {
          avatar_url?: string | null;
          company_name?: string | null;
          created_at?: string | null;
          full_name?: string | null;
          id?: string;
          phone_number?: string | null;
          updated_at?: string | null;
          phone?: string | null;
          address?: string | null;
          city?: string | null;
          postal_code?: string | null;
          kvk_number?: string | null;
          btw_number?: string | null;
          website?: string | null;
          description?: string | null;
          onboarding_completed?: boolean | null;
        };
        Relationships: [];
      };
      supplier_pricelists: {
        Row: {
          base_price: number;
          created_at: string | null;
          description: string | null;
          discount_percent: number | null;
          entrepreneur_id: string;
          id: string;
          product_name: string;
          supplier_id: string;
          unit: string | null;
          updated_at: string | null;
          valid_from: string | null;
          valid_to: string | null;
        };
        Insert: {
          base_price: number;
          created_at?: string | null;
          description?: string | null;
          discount_percent?: number | null;
          entrepreneur_id: string;
          id?: string;
          product_name: string;
          supplier_id: string;
          unit?: string | null;
          updated_at?: string | null;
          valid_from?: string | null;
          valid_to?: string | null;
        };
        Update: {
          base_price?: number;
          created_at?: string | null;
          description?: string | null;
          discount_percent?: number | null;
          entrepreneur_id?: string;
          id?: string;
          product_name?: string;
          supplier_id?: string;
          unit?: string | null;
          updated_at?: string | null;
          valid_from?: string | null;
          valid_to?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "supplier_pricelists_entrepreneur_id_fkey";
            columns: ["entrepreneur_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "supplier_pricelists_supplier_id_fkey";
            columns: ["supplier_id"];
            isOneToOne: false;
            referencedRelation: "funeral_cost_breakdown";
            referencedColumns: ["supplier_id"];
          },
          {
            foreignKeyName: "supplier_pricelists_supplier_id_fkey";
            columns: ["supplier_id"];
            isOneToOne: false;
            referencedRelation: "suppliers";
            referencedColumns: ["id"];
          }
        ];
      };
      suppliers: {
        Row: {
          address: string | null;
          city: string | null;
          contact_person: string | null;
          created_at: string | null;
          email: string | null;
          entrepreneur_id: string;
          id: string;
          name: string;
          notes: string | null;
          phone_number: string | null;
          postal_code: string | null;
          type: string | null;
          updated_at: string | null;
        };
        Insert: {
          address?: string | null;
          city?: string | null;
          contact_person?: string | null;
          created_at?: string | null;
          email?: string | null;
          entrepreneur_id: string;
          id?: string;
          name: string;
          notes?: string | null;
          phone_number?: string | null;
          postal_code?: string | null;
          type?: string | null;
          updated_at?: string | null;
        };
        Update: {
          address?: string | null;
          city?: string | null;
          contact_person?: string | null;
          created_at?: string | null;
          email?: string | null;
          entrepreneur_id?: string;
          id?: string;
          name?: string;
          notes?: string | null;
          phone_number?: string | null;
          postal_code?: string | null;
          type?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "suppliers_entrepreneur_id_fkey";
            columns: ["entrepreneur_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Views: {
      funeral_cost_breakdown: {
        Row: {
          created_at: string | null;
          entrepreneur_id: string | null;
          funeral_id: string | null;
          product_name: string | null;
          quantity: number | null;
          supplier_id: string | null;
          supplier_name: string | null;
          total_price: number | null;
          unit_price: number | null;
          updated_at: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "funerals_entrepreneur_id_fkey";
            columns: ["entrepreneur_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      funeral_costs: {
        Row: {
          entrepreneur_id: string | null;
          first_supplier_added: string | null;
          funeral_id: string | null;
          last_updated: string | null;
          supplier_count: number | null;
          total_cost: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "funerals_entrepreneur_id_fkey";
            columns: ["entrepreneur_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
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
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  "public"
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
      DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] &
      DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
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
    : never = never
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
    : never = never
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
    : never = never
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
    : never = never
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
