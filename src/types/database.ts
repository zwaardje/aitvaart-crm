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
          email: string | null;
          entrepreneur_id: string;
          fts: unknown | null;
          gender: string | null;
          house_number: string | null;
          house_number_addition: string | null;
          id: string;
          last_name: string;
          organization_id: string | null;
          phone_number: string | null;
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
          email?: string | null;
          entrepreneur_id: string;
          fts?: unknown | null;
          gender?: string | null;
          house_number?: string | null;
          house_number_addition?: string | null;
          id?: string;
          last_name: string;
          organization_id?: string | null;
          phone_number?: string | null;
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
          email?: string | null;
          entrepreneur_id?: string;
          fts?: unknown | null;
          gender?: string | null;
          house_number?: string | null;
          house_number_addition?: string | null;
          id?: string;
          last_name?: string;
          organization_id?: string | null;
          phone_number?: string | null;
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
          },
          {
            foreignKeyName: "clients_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
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
          organization_id: string | null;
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
          organization_id?: string | null;
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
          organization_id?: string | null;
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
          },
          {
            foreignKeyName: "company_branding_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
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
          fts: unknown | null;
          gender: string | null;
          house_number: string | null;
          house_number_addition: string | null;
          id: string;
          last_name: string;
          organization_id: string | null;
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
          fts?: unknown | null;
          gender?: string | null;
          house_number?: string | null;
          house_number_addition?: string | null;
          id?: string;
          last_name: string;
          organization_id?: string | null;
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
          fts?: unknown | null;
          gender?: string | null;
          house_number?: string | null;
          house_number_addition?: string | null;
          id?: string;
          last_name?: string;
          organization_id?: string | null;
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
          },
          {
            foreignKeyName: "deceased_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
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
          organization_id: string | null;
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
          organization_id?: string | null;
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
          organization_id?: string | null;
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
          },
          {
            foreignKeyName: "documents_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      funeral_contacts: {
        Row: {
          client_id: string;
          created_at: string | null;
          entrepreneur_id: string;
          fts: unknown | null;
          funeral_id: string;
          id: string;
          is_primary: boolean | null;
          notes: string | null;
          organization_id: string | null;
          relation: string | null;
          updated_at: string | null;
        };
        Insert: {
          client_id: string;
          created_at?: string | null;
          entrepreneur_id: string;
          fts?: unknown | null;
          funeral_id: string;
          id?: string;
          is_primary?: boolean | null;
          notes?: string | null;
          organization_id?: string | null;
          relation?: string | null;
          updated_at?: string | null;
        };
        Update: {
          client_id?: string;
          created_at?: string | null;
          entrepreneur_id?: string;
          fts?: unknown | null;
          funeral_id?: string;
          id?: string;
          is_primary?: boolean | null;
          notes?: string | null;
          organization_id?: string | null;
          relation?: string | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "funeral_contacts_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
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
            referencedRelation: "funeral_cost_breakdown";
            referencedColumns: ["funeral_id"];
          },
          {
            foreignKeyName: "funeral_contacts_funeral_id_fkey";
            columns: ["funeral_id"];
            isOneToOne: false;
            referencedRelation: "funeral_costs";
            referencedColumns: ["funeral_id"];
          },
          {
            foreignKeyName: "funeral_contacts_funeral_id_fkey";
            columns: ["funeral_id"];
            isOneToOne: false;
            referencedRelation: "funerals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "funeral_contacts_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
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
          organization_id: string | null;
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
          organization_id?: string | null;
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
          organization_id?: string | null;
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
          },
          {
            foreignKeyName: "funeral_estimates_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
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
          organization_id: string | null;
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
          organization_id?: string | null;
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
          organization_id?: string | null;
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
          },
          {
            foreignKeyName: "funeral_final_invoices_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
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
      funeral_notes: {
        Row: {
          content: string;
          created_at: string | null;
          created_by: string | null;
          entrepreneur_id: string;
          fts: unknown | null;
          funeral_id: string;
          id: string;
          is_important: boolean | null;
          title: string;
          updated_at: string | null;
        };
        Insert: {
          content: string;
          created_at?: string | null;
          created_by?: string | null;
          entrepreneur_id: string;
          fts?: unknown | null;
          funeral_id: string;
          id?: string;
          is_important?: boolean | null;
          title: string;
          updated_at?: string | null;
        };
        Update: {
          content?: string;
          created_at?: string | null;
          created_by?: string | null;
          entrepreneur_id?: string;
          fts?: unknown | null;
          funeral_id?: string;
          id?: string;
          is_important?: boolean | null;
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "funeral_notes_created_by_fkey";
            columns: ["created_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
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
            referencedRelation: "funeral_cost_breakdown";
            referencedColumns: ["funeral_id"];
          },
          {
            foreignKeyName: "funeral_notes_funeral_id_fkey";
            columns: ["funeral_id"];
            isOneToOne: false;
            referencedRelation: "funeral_costs";
            referencedColumns: ["funeral_id"];
          },
          {
            foreignKeyName: "funeral_notes_funeral_id_fkey";
            columns: ["funeral_id"];
            isOneToOne: false;
            referencedRelation: "funerals";
            referencedColumns: ["id"];
          }
        ];
      };
      funeral_scenarios: {
        Row: {
          created_at: string | null;
          created_by: string | null;
          description: string | null;
          entrepreneur_id: string;
          extra_field_label: string | null;
          extra_field_value: string | null;
          funeral_id: string;
          id: string;
          is_active: boolean | null;
          item_type: string;
          order_in_section: number | null;
          section: string;
          title: string;
          updated_at: string | null;
        };
        Insert: {
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          entrepreneur_id: string;
          extra_field_label?: string | null;
          extra_field_value?: string | null;
          funeral_id: string;
          id?: string;
          is_active?: boolean | null;
          item_type: string;
          order_in_section?: number | null;
          section: string;
          title: string;
          updated_at?: string | null;
        };
        Update: {
          created_at?: string | null;
          created_by?: string | null;
          description?: string | null;
          entrepreneur_id?: string;
          extra_field_label?: string | null;
          extra_field_value?: string | null;
          funeral_id?: string;
          id?: string;
          is_active?: boolean | null;
          item_type?: string;
          order_in_section?: number | null;
          section?: string;
          title?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "funeral_scenarios_funeral_id_fkey";
            columns: ["funeral_id"];
            isOneToOne: false;
            referencedRelation: "funeral_cost_breakdown";
            referencedColumns: ["funeral_id"];
          },
          {
            foreignKeyName: "funeral_scenarios_funeral_id_fkey";
            columns: ["funeral_id"];
            isOneToOne: false;
            referencedRelation: "funeral_costs";
            referencedColumns: ["funeral_id"];
          },
          {
            foreignKeyName: "funeral_scenarios_funeral_id_fkey";
            columns: ["funeral_id"];
            isOneToOne: false;
            referencedRelation: "funerals";
            referencedColumns: ["id"];
          }
        ];
      };
      funeral_suppliers: {
        Row: {
          created_at: string | null;
          entrepreneur_id: string;
          fts: unknown | null;
          funeral_id: string;
          id: string;
          notes: string | null;
          organization_id: string | null;
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
          fts?: unknown | null;
          funeral_id: string;
          id?: string;
          notes?: string | null;
          organization_id?: string | null;
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
          fts?: unknown | null;
          funeral_id?: string;
          id?: string;
          notes?: string | null;
          organization_id?: string | null;
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
            foreignKeyName: "funeral_suppliers_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
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
      funeral_team_assignments: {
        Row: {
          assigned_at: string | null;
          assigned_by: string | null;
          created_at: string | null;
          funeral_id: string;
          id: string;
          permissions: string[] | null;
          role: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          assigned_at?: string | null;
          assigned_by?: string | null;
          created_at?: string | null;
          funeral_id: string;
          id?: string;
          permissions?: string[] | null;
          role?: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          assigned_at?: string | null;
          assigned_by?: string | null;
          created_at?: string | null;
          funeral_id?: string;
          id?: string;
          permissions?: string[] | null;
          role?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "funeral_team_assignments_assigned_by_fkey";
            columns: ["assigned_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "funeral_team_assignments_funeral_id_fkey";
            columns: ["funeral_id"];
            isOneToOne: false;
            referencedRelation: "funeral_cost_breakdown";
            referencedColumns: ["funeral_id"];
          },
          {
            foreignKeyName: "funeral_team_assignments_funeral_id_fkey";
            columns: ["funeral_id"];
            isOneToOne: false;
            referencedRelation: "funeral_costs";
            referencedColumns: ["funeral_id"];
          },
          {
            foreignKeyName: "funeral_team_assignments_funeral_id_fkey";
            columns: ["funeral_id"];
            isOneToOne: false;
            referencedRelation: "funerals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "funeral_team_assignments_user_id_fkey";
            columns: ["user_id"];
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
          fts: unknown | null;
          funeral_director: string | null;
          id: string;
          location: string | null;
          organization_id: string | null;
          signing_date: string | null;
          status: "planning" | "active" | "completed" | "cancelled" | null;
          updated_at: string | null;
        };
        Insert: {
          client_id: string;
          created_at?: string | null;
          deceased_id: string;
          entrepreneur_id: string;
          fts?: unknown | null;
          funeral_director?: string | null;
          id?: string;
          location?: string | null;
          organization_id?: string | null;
          signing_date?: string | null;
          status?: "planning" | "active" | "completed" | "cancelled" | null;
          updated_at?: string | null;
        };
        Update: {
          client_id?: string;
          created_at?: string | null;
          deceased_id?: string;
          entrepreneur_id?: string;
          fts?: unknown | null;
          funeral_director?: string | null;
          id?: string;
          location?: string | null;
          organization_id?: string | null;
          signing_date?: string | null;
          status?: "planning" | "active" | "completed" | "cancelled" | null;
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
          },
          {
            foreignKeyName: "funerals_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      organization_members: {
        Row: {
          can_manage_clients: boolean | null;
          can_manage_funerals: boolean | null;
          can_manage_settings: boolean | null;
          can_manage_suppliers: boolean | null;
          can_manage_users: boolean | null;
          can_view_financials: boolean | null;
          created_at: string | null;
          id: string;
          invited_at: string | null;
          invited_by: string | null;
          joined_at: string | null;
          legacy_permissions: Json | null;
          organization_id: string;
          role: string;
          status: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          can_manage_clients?: boolean | null;
          can_manage_funerals?: boolean | null;
          can_manage_settings?: boolean | null;
          can_manage_suppliers?: boolean | null;
          can_manage_users?: boolean | null;
          can_view_financials?: boolean | null;
          created_at?: string | null;
          id?: string;
          invited_at?: string | null;
          invited_by?: string | null;
          joined_at?: string | null;
          legacy_permissions?: Json | null;
          organization_id: string;
          role?: string;
          status?: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          can_manage_clients?: boolean | null;
          can_manage_funerals?: boolean | null;
          can_manage_settings?: boolean | null;
          can_manage_suppliers?: boolean | null;
          can_manage_users?: boolean | null;
          can_view_financials?: boolean | null;
          created_at?: string | null;
          id?: string;
          invited_at?: string | null;
          invited_by?: string | null;
          joined_at?: string | null;
          legacy_permissions?: Json | null;
          organization_id?: string;
          role?: string;
          status?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "organization_members_invited_by_fkey";
            columns: ["invited_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "organization_members_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "organization_members_user_id_fkey";
            columns: ["user_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          }
        ];
      };
      organizations: {
        Row: {
          address: string | null;
          billing_address: string | null;
          billing_city: string | null;
          billing_email: string | null;
          billing_postal_code: string | null;
          city: string | null;
          country: string | null;
          created_at: string | null;
          description: string | null;
          email: string | null;
          id: string;
          is_active: boolean | null;
          max_users: number | null;
          name: string;
          phone_number: string | null;
          plan_type: string | null;
          postal_code: string | null;
          updated_at: string | null;
          website: string | null;
        };
        Insert: {
          address?: string | null;
          billing_address?: string | null;
          billing_city?: string | null;
          billing_email?: string | null;
          billing_postal_code?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string | null;
          description?: string | null;
          email?: string | null;
          id?: string;
          is_active?: boolean | null;
          max_users?: number | null;
          name: string;
          phone_number?: string | null;
          plan_type?: string | null;
          postal_code?: string | null;
          updated_at?: string | null;
          website?: string | null;
        };
        Update: {
          address?: string | null;
          billing_address?: string | null;
          billing_city?: string | null;
          billing_email?: string | null;
          billing_postal_code?: string | null;
          city?: string | null;
          country?: string | null;
          created_at?: string | null;
          description?: string | null;
          email?: string | null;
          id?: string;
          is_active?: boolean | null;
          max_users?: number | null;
          name?: string;
          phone_number?: string | null;
          plan_type?: string | null;
          postal_code?: string | null;
          updated_at?: string | null;
          website?: string | null;
        };
        Relationships: [];
      };
      permission_group_memberships: {
        Row: {
          created_at: string | null;
          group_id: string;
          id: string;
          permission_id: string;
        };
        Insert: {
          created_at?: string | null;
          group_id: string;
          id?: string;
          permission_id: string;
        };
        Update: {
          created_at?: string | null;
          group_id?: string;
          id?: string;
          permission_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "permission_group_memberships_group_id_fkey";
            columns: ["group_id"];
            isOneToOne: false;
            referencedRelation: "permission_groups";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "permission_group_memberships_permission_id_fkey";
            columns: ["permission_id"];
            isOneToOne: false;
            referencedRelation: "permissions";
            referencedColumns: ["id"];
          }
        ];
      };
      permission_groups: {
        Row: {
          category: string;
          created_at: string | null;
          description: string | null;
          display_name: string;
          id: string;
          is_active: boolean | null;
          name: string;
          updated_at: string | null;
        };
        Insert: {
          category: string;
          created_at?: string | null;
          description?: string | null;
          display_name: string;
          id?: string;
          is_active?: boolean | null;
          name: string;
          updated_at?: string | null;
        };
        Update: {
          category?: string;
          created_at?: string | null;
          description?: string | null;
          display_name?: string;
          id?: string;
          is_active?: boolean | null;
          name?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      permissions: {
        Row: {
          category: string;
          created_at: string | null;
          description: string | null;
          display_name: string;
          id: string;
          is_active: boolean | null;
          is_system_permission: boolean | null;
          name: string;
          updated_at: string | null;
        };
        Insert: {
          category: string;
          created_at?: string | null;
          description?: string | null;
          display_name: string;
          id?: string;
          is_active?: boolean | null;
          is_system_permission?: boolean | null;
          name: string;
          updated_at?: string | null;
        };
        Update: {
          category?: string;
          created_at?: string | null;
          description?: string | null;
          display_name?: string;
          id?: string;
          is_active?: boolean | null;
          is_system_permission?: boolean | null;
          name?: string;
          updated_at?: string | null;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          address: string | null;
          avatar_url: string | null;
          city: string | null;
          company_name: string | null;
          created_at: string | null;
          description: string | null;
          email: string | null;
          full_name: string | null;
          id: string;
          onboarding_completed: boolean | null;
          organization_id: string | null;
          phone: string | null;
          phone_number: string | null;
          postal_code: string | null;
          updated_at: string | null;
          website: string | null;
        };
        Insert: {
          address?: string | null;
          avatar_url?: string | null;
          city?: string | null;
          company_name?: string | null;
          created_at?: string | null;
          description?: string | null;
          email?: string | null;
          full_name?: string | null;
          id: string;
          onboarding_completed?: boolean | null;
          organization_id?: string | null;
          phone?: string | null;
          phone_number?: string | null;
          postal_code?: string | null;
          updated_at?: string | null;
          website?: string | null;
        };
        Update: {
          address?: string | null;
          avatar_url?: string | null;
          city?: string | null;
          company_name?: string | null;
          created_at?: string | null;
          description?: string | null;
          email?: string | null;
          full_name?: string | null;
          id?: string;
          onboarding_completed?: boolean | null;
          organization_id?: string | null;
          phone?: string | null;
          phone_number?: string | null;
          postal_code?: string | null;
          updated_at?: string | null;
          website?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      role_permissions: {
        Row: {
          context: string | null;
          created_at: string | null;
          id: string;
          permission_id: string;
          role: string;
        };
        Insert: {
          context?: string | null;
          created_at?: string | null;
          id?: string;
          permission_id: string;
          role: string;
        };
        Update: {
          context?: string | null;
          created_at?: string | null;
          id?: string;
          permission_id?: string;
          role?: string;
        };
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey";
            columns: ["permission_id"];
            isOneToOne: false;
            referencedRelation: "permissions";
            referencedColumns: ["id"];
          }
        ];
      };
      supplier_pricelists: {
        Row: {
          base_price: number;
          created_at: string | null;
          description: string | null;
          discount_percent: number | null;
          entrepreneur_id: string;
          id: string;
          organization_id: string | null;
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
          organization_id?: string | null;
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
          organization_id?: string | null;
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
            foreignKeyName: "supplier_pricelists_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
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
          organization_id: string | null;
          phone_number: string | null;
          postal_code: string | null;
          type: string | null;
          updated_at: string | null;
          website: string | null;
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
          organization_id?: string | null;
          phone_number?: string | null;
          postal_code?: string | null;
          type?: string | null;
          updated_at?: string | null;
          website?: string | null;
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
          organization_id?: string | null;
          phone_number?: string | null;
          postal_code?: string | null;
          type?: string | null;
          updated_at?: string | null;
          website?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "suppliers_entrepreneur_id_fkey";
            columns: ["entrepreneur_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "suppliers_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      pricelist_items: {
        Row: {
          ai_remark: string | null;
          category: string | null;
          created_at: string | null;
          default_quantity: number;
          description: string | null;
          entrepreneur_id: string;
          id: string;
          organization_id: string;
          price_incl: number;
          subcategory: string | null;
          subtitle: string | null;
          supplier_id: string | null;
          title: string;
          unit: string | null;
          updated_at: string | null;
          vat_rate: number | null;
          website_url: string | null;
        };
        Insert: {
          ai_remark?: string | null;
          category?: string | null;
          created_at?: string | null;
          default_quantity?: number;
          description?: string | null;
          entrepreneur_id: string;
          id?: string;
          organization_id: string;
          price_incl: number;
          subcategory?: string | null;
          subtitle?: string | null;
          supplier_id?: string | null;
          title: string;
          unit?: string | null;
          updated_at?: string | null;
          vat_rate?: number | null;
          website_url?: string | null;
        };
        Update: {
          ai_remark?: string | null;
          category?: string | null;
          created_at?: string | null;
          default_quantity?: number;
          description?: string | null;
          entrepreneur_id?: string;
          id?: string;
          organization_id?: string;
          price_incl?: number;
          subcategory?: string | null;
          subtitle?: string | null;
          supplier_id?: string | null;
          title?: string;
          unit?: string | null;
          updated_at?: string | null;
          vat_rate?: number | null;
          website_url?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "pricelist_items_entrepreneur_id_fkey";
            columns: ["entrepreneur_id"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pricelist_items_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "pricelist_items_supplier_id_fkey";
            columns: ["supplier_id"];
            isOneToOne: false;
            referencedRelation: "suppliers";
            referencedColumns: ["id"];
          }
        ];
      };
      task_types: {
        Row: {
          category: string | null;
          created_at: string | null;
          description: string | null;
          estimated_duration_minutes: number | null;
          id: string;
          input_schema: Json | null;
          is_active: boolean | null;
          is_required: boolean | null;
          n8n_api_key: string | null;
          n8n_webhook_url: string | null;
          n8n_workflow_id: string;
          name: string;
          organization_id: string | null;
          output_schema: Json | null;
          priority: number | null;
          tags: string[] | null;
          updated_at: string | null;
        };
        Insert: {
          category?: string | null;
          created_at?: string | null;
          description?: string | null;
          estimated_duration_minutes?: number | null;
          id?: string;
          input_schema?: Json | null;
          is_active?: boolean | null;
          is_required?: boolean | null;
          n8n_api_key?: string | null;
          n8n_webhook_url?: string | null;
          n8n_workflow_id: string;
          name: string;
          organization_id?: string | null;
          output_schema?: Json | null;
          priority?: number | null;
          tags?: string[] | null;
          updated_at?: string | null;
        };
        Update: {
          category?: string | null;
          created_at?: string | null;
          description?: string | null;
          estimated_duration_minutes?: number | null;
          id?: string;
          input_schema?: Json | null;
          is_active?: boolean | null;
          is_required?: boolean | null;
          n8n_api_key?: string | null;
          n8n_webhook_url?: string | null;
          n8n_workflow_id?: string;
          name?: string;
          organization_id?: string | null;
          output_schema?: Json | null;
          priority?: number | null;
          tags?: string[] | null;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "task_types_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      tasks: {
        Row: {
          assigned_at: string | null;
          assigned_by: string | null;
          assigned_to: string | null;
          completed_at: string | null;
          created_at: string | null;
          due_date: string | null;
          error_message: string | null;
          failed_at: string | null;
          funeral_id: string;
          id: string;
          input_data: Json | null;
          max_retries: number | null;
          n8n_execution_id: string | null;
          n8n_execution_url: string | null;
          notes: string | null;
          organization_id: string;
          output_data: Json | null;
          priority: number | null;
          retry_count: number | null;
          scheduled_at: string | null;
          started_at: string | null;
          status: Database["public"]["Enums"]["task_status"] | null;
          tags: string[] | null;
          task_type_id: string;
          updated_at: string | null;
        };
        Insert: {
          assigned_at?: string | null;
          assigned_by?: string | null;
          assigned_to?: string | null;
          completed_at?: string | null;
          created_at?: string | null;
          due_date?: string | null;
          error_message?: string | null;
          failed_at?: string | null;
          funeral_id: string;
          id?: string;
          input_data?: Json | null;
          max_retries?: number | null;
          n8n_execution_id?: string | null;
          n8n_execution_url?: string | null;
          notes?: string | null;
          organization_id: string;
          output_data?: Json | null;
          priority?: number | null;
          retry_count?: number | null;
          scheduled_at?: string | null;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["task_status"] | null;
          tags?: string[] | null;
          task_type_id: string;
          updated_at?: string | null;
        };
        Update: {
          assigned_at?: string | null;
          assigned_by?: string | null;
          assigned_to?: string | null;
          completed_at?: string | null;
          created_at?: string | null;
          due_date?: string | null;
          error_message?: string | null;
          failed_at?: string | null;
          funeral_id?: string;
          id?: string;
          input_data?: Json | null;
          max_retries?: number | null;
          n8n_execution_id?: string | null;
          n8n_execution_url?: string | null;
          notes?: string | null;
          organization_id?: string;
          output_data?: Json | null;
          priority?: number | null;
          retry_count?: number | null;
          scheduled_at?: string | null;
          started_at?: string | null;
          status?: Database["public"]["Enums"]["task_status"] | null;
          tags?: string[] | null;
          task_type_id?: string;
          updated_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_by_fkey";
            columns: ["assigned_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_funeral_id_fkey";
            columns: ["funeral_id"];
            isOneToOne: false;
            referencedRelation: "funeral_cost_breakdown";
            referencedColumns: ["funeral_id"];
          },
          {
            foreignKeyName: "tasks_funeral_id_fkey";
            columns: ["funeral_id"];
            isOneToOne: false;
            referencedRelation: "funeral_costs";
            referencedColumns: ["funeral_id"];
          },
          {
            foreignKeyName: "tasks_funeral_id_fkey";
            columns: ["funeral_id"];
            isOneToOne: false;
            referencedRelation: "funerals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_task_type_id_fkey";
            columns: ["task_type_id"];
            isOneToOne: false;
            referencedRelation: "task_types";
            referencedColumns: ["id"];
          }
        ];
      };
      user_permissions: {
        Row: {
          context: string | null;
          created_at: string | null;
          expires_at: string | null;
          granted: boolean;
          granted_at: string | null;
          granted_by: string | null;
          id: string;
          organization_id: string;
          permission_id: string;
          updated_at: string | null;
          user_id: string;
        };
        Insert: {
          context?: string | null;
          created_at?: string | null;
          expires_at?: string | null;
          granted?: boolean;
          granted_at?: string | null;
          granted_by?: string | null;
          id?: string;
          organization_id: string;
          permission_id: string;
          updated_at?: string | null;
          user_id: string;
        };
        Update: {
          context?: string | null;
          created_at?: string | null;
          expires_at?: string | null;
          granted?: boolean;
          granted_at?: string | null;
          granted_by?: string | null;
          id?: string;
          organization_id?: string;
          permission_id?: string;
          updated_at?: string | null;
          user_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: "user_permissions_granted_by_fkey";
            columns: ["granted_by"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_permissions_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_permissions_permission_id_fkey";
            columns: ["permission_id"];
            isOneToOne: false;
            referencedRelation: "permissions";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "user_permissions_user_id_fkey";
            columns: ["user_id"];
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
      task_statistics: {
        Row: {
          avg_completion_time_minutes: number | null;
          done_tasks: number | null;
          error_tasks: number | null;
          organization_id: string | null;
          pending_tasks: number | null;
          required_tasks: number | null;
          todo_tasks: number | null;
          total_tasks: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
      task_summary: {
        Row: {
          assigned_to: string | null;
          assigned_to_name: string | null;
          category: string | null;
          completed_at: string | null;
          created_at: string | null;
          deceased_first_name: string | null;
          deceased_last_name: string | null;
          due_date: string | null;
          funeral_id: string | null;
          id: string | null;
          organization_id: string | null;
          priority: number | null;
          started_at: string | null;
          status: Database["public"]["Enums"]["task_status"] | null;
          task_type_name: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "tasks_assigned_to_fkey";
            columns: ["assigned_to"];
            isOneToOne: false;
            referencedRelation: "profiles";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_funeral_id_fkey";
            columns: ["funeral_id"];
            isOneToOne: false;
            referencedRelation: "funeral_cost_breakdown";
            referencedColumns: ["funeral_id"];
          },
          {
            foreignKeyName: "tasks_funeral_id_fkey";
            columns: ["funeral_id"];
            isOneToOne: false;
            referencedRelation: "funeral_costs";
            referencedColumns: ["funeral_id"];
          },
          {
            foreignKeyName: "tasks_funeral_id_fkey";
            columns: ["funeral_id"];
            isOneToOne: false;
            referencedRelation: "funerals";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "tasks_organization_id_fkey";
            columns: ["organization_id"];
            isOneToOne: false;
            referencedRelation: "organizations";
            referencedColumns: ["id"];
          }
        ];
      };
    };
    Functions: {
      get_user_organization: {
        Args: { user_uuid: string };
        Returns: string;
      };
      get_user_permissions: {
        Args: { organization_uuid?: string; user_uuid: string };
        Returns: {
          context: string;
          granted: boolean;
          permission_name: string;
          source: string;
        }[];
      };
      is_organization_admin: {
        Args: { org_id: string; user_uuid?: string };
        Returns: boolean;
      };
      is_organization_member: {
        Args: { org_id: string; user_uuid?: string };
        Returns: boolean;
      };
      search_all_entities: {
        Args: {
          limit_count?: number;
          search_term: string;
          funeral_id?: string;
        };
        Returns: {
          content: string;
          created_at: string;
          entity_id: string;
          entity_type: string;
          rank: number;
          title: string;
        }[];
      };
      user_has_permission: {
        Args:
          | {
              context?: string;
              organization_uuid?: string;
              permission_name: string;
              user_uuid: string;
            }
          | {
              organization_uuid?: string;
              permission_name: string;
              user_uuid: string;
            };
        Returns: boolean;
      };
    };
    Enums: {
      task_status: "required" | "todo" | "pending" | "done" | "error";
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
    Enums: {
      task_status: ["required", "todo", "pending", "done", "error"],
    },
  },
} as const;
