export interface Database {
  public: {
    Tables: {
      congregations: {
        Row: {
          id: string;
          name: string;
          code: string;
          legal_name: string | null;
          tax_id: string | null;
          email: string | null;
          phone: string | null;
          city: string | null;
          state: string | null;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          code: string;
          legal_name?: string | null;
          tax_id?: string | null;
          email?: string | null;
          phone?: string | null;
          city?: string | null;
          state?: string | null;
          is_active?: boolean;
        };
        Update: {
          name?: string;
          code?: string;
          legal_name?: string | null;
          tax_id?: string | null;
          email?: string | null;
          phone?: string | null;
          city?: string | null;
          state?: string | null;
          is_active?: boolean;
        };
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          congregation_id: string | null;
          active_congregation_id: string | null;
          full_name: string | null;
          email: string | null;
          is_active: boolean;
          phone: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          congregation_id?: string | null;
          active_congregation_id?: string | null;
          full_name?: string | null;
          email?: string | null;
          is_active?: boolean;
          phone?: string | null;
          avatar_url?: string | null;
        };
        Update: {
          congregation_id?: string | null;
          active_congregation_id?: string | null;
          full_name?: string | null;
          email?: string | null;
          is_active?: boolean;
          phone?: string | null;
          avatar_url?: string | null;
        };
        Relationships: [];
      };
      roles: {
        Row: {
          id: string;
          code: string;
          name: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
        };
        Update: {
          code?: string;
          name?: string;
        };
        Relationships: [];
      };
      permissions: {
        Row: {
          id: string;
          resource: string;
          action: string;
        };
        Insert: {
          id?: string;
          resource: string;
          action: string;
        };
        Update: {
          resource?: string;
          action?: string;
        };
        Relationships: [];
      };
      profile_roles: {
        Row: {
          id: string;
          profile_id: string;
          role_id: string;
          congregation_id: string | null;
        };
        Insert: {
          id?: string;
          profile_id: string;
          role_id: string;
          congregation_id?: string | null;
        };
        Update: {
          profile_id?: string;
          role_id?: string;
          congregation_id?: string | null;
        };
        Relationships: [];
      };
      profile_congregations: {
        Row: {
          id: string;
          profile_id: string;
          congregation_id: string;
          is_active: boolean;
          is_default: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          congregation_id: string;
          is_active?: boolean;
          is_default?: boolean;
        };
        Update: {
          profile_id?: string;
          congregation_id?: string;
          is_active?: boolean;
          is_default?: boolean;
        };
        Relationships: [];
      };
      role_permissions: {
        Row: {
          role_id: string;
          permission_id: string;
        };
        Insert: {
          role_id: string;
          permission_id: string;
        };
        Update: {
          role_id?: string;
          permission_id?: string;
        };
        Relationships: [];
      };
      members: {
        Row: {
          id: string;
          congregation_id: string;
          full_name: string;
          email: string | null;
          phone: string | null;
          birth_date: string | null;
          join_date: string;
          status: 'ativo' | 'inativo' | 'pendente';
          role_label: string | null;
          avatar_url: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          congregation_id: string;
          full_name: string;
          email?: string | null;
          phone?: string | null;
          birth_date?: string | null;
          join_date: string;
          status: 'ativo' | 'inativo' | 'pendente';
          role_label?: string | null;
          avatar_url?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          full_name?: string;
          email?: string | null;
          phone?: string | null;
          birth_date?: string | null;
          join_date?: string;
          status?: 'ativo' | 'inativo' | 'pendente';
          role_label?: string | null;
          avatar_url?: string | null;
          deleted_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      events: {
        Row: {
          id: string;
          congregation_id: string;
          title: string;
          description: string | null;
          category: 'culto' | 'reuniao' | 'evento' | 'estudo' | 'outro';
          start_at: string;
          end_at: string | null;
          location: string;
          attendees: number | null;
          organizer_name: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          congregation_id: string;
          title: string;
          description?: string | null;
          category: 'culto' | 'reuniao' | 'evento' | 'estudo' | 'outro';
          start_at: string;
          end_at?: string | null;
          location: string;
          attendees?: number | null;
          organizer_name?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          title?: string;
          description?: string | null;
          category?: 'culto' | 'reuniao' | 'evento' | 'estudo' | 'outro';
          start_at?: string;
          end_at?: string | null;
          location?: string;
          attendees?: number | null;
          organizer_name?: string | null;
          deleted_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      ministries: {
        Row: {
          id: string;
          congregation_id: string;
          name: string;
          description: string;
          leader_name: string | null;
          leader_profile_id: string | null;
          leader_email: string | null;
          leader_phone: string | null;
          member_count: number;
          category: string | null;
          image_url: string | null;
          meeting_day: string | null;
          meeting_time: string | null;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          congregation_id: string;
          name: string;
          description: string;
          leader_name?: string | null;
          leader_profile_id?: string | null;
          leader_email?: string | null;
          leader_phone?: string | null;
          member_count: number;
          category?: string | null;
          image_url?: string | null;
          meeting_day?: string | null;
          meeting_time?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          name?: string;
          description?: string;
          leader_name?: string | null;
          leader_profile_id?: string | null;
          leader_email?: string | null;
          leader_phone?: string | null;
          member_count?: number;
          category?: string | null;
          image_url?: string | null;
          meeting_day?: string | null;
          meeting_time?: string | null;
          deleted_at?: string | null;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      finance_accounts: {
        Row: {
          id: string;
          congregation_id: string;
          name: string;
          category: string;
          is_active: boolean;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          congregation_id: string;
          name: string;
          category: string;
          is_active?: boolean;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          name?: string;
          category?: string;
          is_active?: boolean;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      finance_categories: {
        Row: {
          id: string;
          congregation_id: string;
          code: string;
          name: string;
          type: 'receita' | 'despesa' | 'ambos';
          description: string | null;
          is_active: boolean;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          congregation_id: string;
          code: string;
          name: string;
          type: 'receita' | 'despesa' | 'ambos';
          description?: string | null;
          is_active?: boolean;
          created_by?: string | null;
          updated_by?: string | null;
        };
        Update: {
          code?: string;
          name?: string;
          type?: 'receita' | 'despesa' | 'ambos';
          description?: string | null;
          is_active?: boolean;
          updated_by?: string | null;
        };
        Relationships: [];
      };
      finance_transactions: {
        Row: {
          id: string;
          congregation_id: string;
          account_id: string;
          type: 'receita' | 'despesa';
          category: string;
          amount: number;
          occurred_at: string;
          description: string | null;
          origin: string | null;
          reference: string | null;
          document_reference: string | null;
          observations: string | null;
          event_id: string | null;
          created_by: string | null;
          updated_by: string | null;
          deleted_by: string | null;
          deleted_reason: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
        };
        Insert: {
          id?: string;
          congregation_id: string;
          account_id: string;
          type: 'receita' | 'despesa';
          category: string;
          amount: number;
          occurred_at: string;
          description?: string | null;
          origin?: string | null;
          reference?: string | null;
          document_reference?: string | null;
          observations?: string | null;
          event_id?: string | null;
          created_by?: string | null;
          updated_by?: string | null;
          deleted_by?: string | null;
          deleted_reason?: string | null;
        };
        Update: {
          account_id?: string;
          type?: 'receita' | 'despesa';
          category?: string;
          amount?: number;
          occurred_at?: string;
          description?: string | null;
          origin?: string | null;
          reference?: string | null;
          document_reference?: string | null;
          observations?: string | null;
          event_id?: string | null;
          updated_by?: string | null;
          deleted_by?: string | null;
          deleted_reason?: string | null;
          deleted_at?: string | null;
        };
        Relationships: [];
      };
      media_assets: {
        Row: {
          id: string;
          congregation_id: string;
          bucket_name: string;
          object_path: string;
          file_name: string;
          mime_type: string;
          size_bytes: number;
          url: string | null;
          is_public: boolean;
          created_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          congregation_id: string;
          bucket_name: string;
          object_path: string;
          file_name: string;
          mime_type: string;
          size_bytes: number;
          url?: string | null;
          is_public?: boolean;
          created_by?: string | null;
        };
        Update: {
          bucket_name?: string;
          object_path?: string;
          file_name?: string;
          mime_type?: string;
          size_bytes?: number;
          url?: string | null;
          is_public?: boolean;
        };
        Relationships: [];
      };
      audit_logs: {
        Row: {
          id: string;
          congregation_id: string | null;
          actor_user_id: string | null;
          actor_email: string | null;
          action: string;
          entity_name: string;
          entity_id: string | null;
          ip_address: string | null;
          user_agent: string | null;
          before_data: unknown;
          after_data: unknown;
          created_at: string;
        };
        Insert: {
          id?: string;
          congregation_id?: string | null;
          actor_user_id?: string | null;
          actor_email?: string | null;
          action: string;
          entity_name: string;
          entity_id?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          before_data?: unknown;
          after_data?: unknown;
          created_at?: string;
        };
        Update: {
          congregation_id?: string | null;
          actor_user_id?: string | null;
          actor_email?: string | null;
          action?: string;
          entity_name?: string;
          entity_id?: string | null;
          ip_address?: string | null;
          user_agent?: string | null;
          before_data?: unknown;
          after_data?: unknown;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
