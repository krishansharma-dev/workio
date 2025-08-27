// src/lib/database.types.ts
export type Database = {
    public: {
      Tables: {
        profiles: {
          Row: {
            id: string
            email: string
            full_name: string | null
            avatar_url: string | null
            bio: string | null
            created_at: string
            updated_at: string
          }
        }
        workspaces: {
          Row: {
            id: string
            name: string
            slug: string
            created_at: string
            updated_at: string
          }
        }
        workspace_members: {
          Row: {
            id: string
            workspace_id: string
            user_id: string
            role: 'owner' | 'admin' | 'member' | 'guest'
            invited_by: string | null
            joined_at: string
            created_at: string
            updated_at: string
          }
        }
        channels: {
          Row: {
            id: string
            workspace_id: string
            name: string
            description: string | null
            is_private: boolean
            created_by: string
            created_at: string
            updated_at: string
          }
        }
      }
    }
  }