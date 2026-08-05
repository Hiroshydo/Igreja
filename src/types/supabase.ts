export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          congregation_id: string | null;
          full_name: string | null;
          email: string | null;
        };
        Insert: {
          id: string;
          congregation_id?: string | null;
          full_name?: string | null;
          email?: string | null;
        };
        Update: {
          congregation_id?: string | null;
          full_name?: string | null;
          email?: string | null;
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
          updated_by?: string | null;
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
