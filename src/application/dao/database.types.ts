export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      code: {
        Row: {
          content: string
          created_at: string
          extension: string
          filepath: string
          id: string
          latest: boolean
          metadata: Json
          project_id: string
          sha1sum: string | null
        }
        Insert: {
          content: string
          created_at?: string
          extension: string
          filepath: string
          id?: string
          latest?: boolean
          metadata?: Json
          project_id: string
          sha1sum?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          extension?: string
          filepath?: string
          id?: string
          latest?: boolean
          metadata?: Json
          project_id?: string
          sha1sum?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "code_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
        ]
      }
      deployment: {
        Row: {
          created_at: string
          id: string
          project_id: string | null
          url: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          project_id?: string | null
          url?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          project_id?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "deployment_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
        ]
      }
      llm_response: {
        Row: {
          created_at: string
          id: string
          input: Json
          origin: string
          output: Json
          project_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          input?: Json
          origin: string
          output?: Json
          project_id: string
        }
        Update: {
          created_at?: string
          id?: string
          input?: Json
          origin?: string
          output?: Json
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "llm_response_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
        ]
      }
      node: {
        Row: {
          created_at: string
          data: Json
          id: string
          position: Json
          project_id: string
          type: Database["public"]["Enums"]["NODE_TYPE"]
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          position: Json
          project_id: string
          type: Database["public"]["Enums"]["NODE_TYPE"]
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          position?: Json
          project_id?: string
          type?: Database["public"]["Enums"]["NODE_TYPE"]
        }
        Relationships: [
          {
            foreignKeyName: "node_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
        ]
      }
      profile: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
          profile_img: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
          profile_img?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
          profile_img?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profile_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      project: {
        Row: {
          created_at: string
          custom_domain: string | null
          domain: string | null
          id: string
          profile_id: string | null
          supabase_anon_key: string | null
          supabase_api_key: string | null
          supabase_db_password: string | null
          supabase_ref: string | null
          supabase_url: string | null
          title: string | null
          vercel_api_key: string | null
        }
        Insert: {
          created_at?: string
          custom_domain?: string | null
          domain?: string | null
          id?: string
          profile_id?: string | null
          supabase_anon_key?: string | null
          supabase_api_key?: string | null
          supabase_db_password?: string | null
          supabase_ref?: string | null
          supabase_url?: string | null
          title?: string | null
          vercel_api_key?: string | null
        }
        Update: {
          created_at?: string
          custom_domain?: string | null
          domain?: string | null
          id?: string
          profile_id?: string | null
          supabase_anon_key?: string | null
          supabase_api_key?: string | null
          supabase_db_password?: string | null
          supabase_ref?: string | null
          supabase_url?: string | null
          title?: string | null
          vercel_api_key?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profile"
            referencedColumns: ["id"]
          },
        ]
      }
      use_case: {
        Row: {
          code_id: string | null
          created_at: string
          description: string
          id: string
          node_id: string | null
          project_id: string
          test_code_id: string | null
          test_success: boolean
          title: string
        }
        Insert: {
          code_id?: string | null
          created_at?: string
          description: string
          id?: string
          node_id?: string | null
          project_id: string
          test_code_id?: string | null
          test_success: boolean
          title: string
        }
        Update: {
          code_id?: string | null
          created_at?: string
          description?: string
          id?: string
          node_id?: string | null
          project_id?: string
          test_code_id?: string | null
          test_success?: boolean
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "use_case_code_id_fkey"
            columns: ["code_id"]
            isOneToOne: false
            referencedRelation: "code"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "use_case_node_id_fkey"
            columns: ["node_id"]
            isOneToOne: false
            referencedRelation: "node"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "use_case_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "project"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "use_case_test_code_id_fkey"
            columns: ["test_code_id"]
            isOneToOne: false
            referencedRelation: "code"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      NODE_TYPE:
        | "USER_FLOW_PAGE"
        | "USER_FLOW_ACTION"
        | "USE_CASE"
        | "SCHEMA_TABLE"
        | "PRESENTATION_PAGE"
        | "PRESENTATION_COMPONENT"
        | "IDEA"
        | "EDGE"
        | "GROUP"
        | "USE_CASE_CODE"
        | "PRESENTATION_PAGE_SPEC"
        | "PRESENTATION_COMPONENT_SPEC"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never
