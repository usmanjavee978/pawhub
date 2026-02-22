// Auto-generated Supabase Database types for PawHub Phase 1
// Generated from TRD Section 3.2 schema

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
      profiles: {
        Row: {
          id: string
          username: string
          display_name: string
          avatar_url: string | null
          bio: string | null
          location: string | null
          website: string | null
          pet_count: number
          reputation: number
          is_verified: boolean
          preferences: Json
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          display_name?: string
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          website?: string | null
          pet_count?: number
          reputation?: number
          is_verified?: boolean
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          display_name?: string
          avatar_url?: string | null
          bio?: string | null
          location?: string | null
          website?: string | null
          pet_count?: number
          reputation?: number
          is_verified?: boolean
          preferences?: Json
          created_at?: string
          updated_at?: string
        }
      }
      pets: {
        Row: {
          id: string
          owner_id: string
          name: string
          species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'hamster' | 'fish' | 'reptile' | 'other'
          breed: string
          date_of_birth: string | null
          gender: 'male' | 'female' | 'unknown'
          size: 'tiny' | 'small' | 'medium' | 'large' | 'giant' | null
          weight_kg: number | null
          color: string | null
          avatar_url: string | null
          microchip_id: string | null
          is_neutered: boolean
          adoption_date: string | null
          allergies: string[]
          medical_notes: string | null
          notes: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          owner_id: string
          name: string
          species?: 'dog' | 'cat' | 'bird' | 'rabbit' | 'hamster' | 'fish' | 'reptile' | 'other'
          breed?: string
          date_of_birth?: string | null
          gender?: 'male' | 'female' | 'unknown'
          size?: 'tiny' | 'small' | 'medium' | 'large' | 'giant' | null
          weight_kg?: number | null
          color?: string | null
          avatar_url?: string | null
          microchip_id?: string | null
          is_neutered?: boolean
          adoption_date?: string | null
          allergies?: string[]
          medical_notes?: string | null
          notes?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          owner_id?: string
          name?: string
          species?: 'dog' | 'cat' | 'bird' | 'rabbit' | 'hamster' | 'fish' | 'reptile' | 'other'
          breed?: string
          date_of_birth?: string | null
          gender?: 'male' | 'female' | 'unknown'
          size?: 'tiny' | 'small' | 'medium' | 'large' | 'giant' | null
          weight_kg?: number | null
          color?: string | null
          avatar_url?: string | null
          microchip_id?: string | null
          is_neutered?: boolean
          adoption_date?: string | null
          allergies?: string[]
          medical_notes?: string | null
          notes?: string | null
          is_active?: boolean
          updated_at?: string
        }
      }
      food_logs: {
        Row: {
          id: string
          pet_id: string
          logged_by: string
          food_name: string
          brand: string | null
          portion_grams: number | null
          portion_unit: string | null
          calories: number | null
          meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'treat' | 'supplement'
          is_wet_food: boolean
          rating: number | null
          notes: string | null
          photo_url: string | null
          logged_at: string
          created_at: string
        }
        Insert: {
          id?: string
          pet_id: string
          logged_by: string
          food_name: string
          brand?: string | null
          portion_grams?: number | null
          portion_unit?: string | null
          calories?: number | null
          meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'treat' | 'supplement'
          is_wet_food?: boolean
          rating?: number | null
          notes?: string | null
          photo_url?: string | null
          logged_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          pet_id?: string
          logged_by?: string
          food_name?: string
          brand?: string | null
          portion_grams?: number | null
          portion_unit?: string | null
          calories?: number | null
          meal_type?: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'treat' | 'supplement'
          is_wet_food?: boolean
          rating?: number | null
          notes?: string | null
          photo_url?: string | null
          logged_at?: string
        }
      }
      vaccine_logs: {
        Row: {
          id: string
          pet_id: string
          logged_by: string
          vaccine_name: string
          batch_number: string | null
          manufacturer: string | null
          status: 'scheduled' | 'administered' | 'overdue' | 'skipped'
          administered_at: string | null
          next_due_at: string | null
          vet_name: string | null
          cost: number | null
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          pet_id: string
          logged_by: string
          vaccine_name: string
          batch_number?: string | null
          manufacturer?: string | null
          status?: 'scheduled' | 'administered' | 'overdue' | 'skipped'
          administered_at?: string | null
          next_due_at?: string | null
          vet_name?: string | null
          cost?: number | null
          notes?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          pet_id?: string
          logged_by?: string
          vaccine_name?: string
          batch_number?: string | null
          manufacturer?: string | null
          status?: 'scheduled' | 'administered' | 'overdue' | 'skipped'
          administered_at?: string | null
          next_due_at?: string | null
          vet_name?: string | null
          cost?: number | null
          notes?: string | null
        }
      }
      questions: {
        Row: {
          id: string
          author_id: string
          title: string
          category: 'nutrition' | 'health' | 'training' | 'behavior' | 'grooming' | 'gear' | 'general'
          content: string
          view_count: number
          like_count: number
          comment_count: number
          is_resolved: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          title: string
          category?: 'nutrition' | 'health' | 'training' | 'behavior' | 'grooming' | 'gear' | 'general'
          content: string
          view_count?: number
          like_count?: number
          comment_count?: number
          is_resolved?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          title?: string
          category?: 'nutrition' | 'health' | 'training' | 'behavior' | 'grooming' | 'gear' | 'general'
          content?: string
          view_count?: number
          like_count?: number
          comment_count?: number
          is_resolved?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      comments: {
        Row: {
          id: string
          author_id: string
          question_id: string
          parent_id: string | null
          content: string
          like_count: number
          is_accepted_answer: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          question_id: string
          parent_id?: string | null
          content: string
          like_count?: number
          is_accepted_answer?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          question_id?: string
          parent_id?: string | null
          content?: string
          like_count?: number
          is_accepted_answer?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      likes: {
        Row: {
          id: string
          user_id: string
          target_type: 'question' | 'comment' | 'blog_post'
          target_id: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          target_type: 'question' | 'comment' | 'blog_post'
          target_id: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          target_type?: 'question' | 'comment' | 'blog_post'
          target_id?: string
          created_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          actor_id: string
          type: 'like' | 'comment' | 'accepted_answer' | 'mention'
          target_type: 'question' | 'comment' | 'blog_post'
          target_id: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          actor_id: string
          type: 'like' | 'comment' | 'accepted_answer' | 'mention'
          target_type: 'question' | 'comment' | 'blog_post'
          target_id: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          actor_id?: string
          type?: 'like' | 'comment' | 'accepted_answer' | 'mention'
          target_type?: 'question' | 'comment' | 'blog_post'
          target_id?: string
          is_read?: boolean
          created_at?: string
        }
      }
      blog_posts: {
        Row: {
          id: string
          author_id: string
          title: string
          slug: string
          excerpt: string
          content: string
          content_text: string
          cover_image_url: string | null
          tags: string[]
          category: 'nutrition' | 'health' | 'training' | 'grooming' | 'recipes' | 'lifestyle' | 'adoption' | 'behavior' | 'gear' | 'other'
          is_published: boolean
          published_at: string | null
          view_count: number
          like_count: number
          comment_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          author_id: string
          title: string
          slug: string
          excerpt?: string
          content?: string
          content_text?: string
          cover_image_url?: string | null
          tags?: string[]
          category?: 'nutrition' | 'health' | 'training' | 'grooming' | 'recipes' | 'lifestyle' | 'adoption' | 'behavior' | 'gear' | 'other'
          is_published?: boolean
          published_at?: string | null
          view_count?: number
          like_count?: number
          comment_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          author_id?: string
          title?: string
          slug?: string
          excerpt?: string
          content?: string
          content_text?: string
          cover_image_url?: string | null
          tags?: string[]
          category?: 'nutrition' | 'health' | 'training' | 'grooming' | 'recipes' | 'lifestyle' | 'adoption' | 'behavior' | 'gear' | 'other'
          is_published?: boolean
          published_at?: string | null
          view_count?: number
          like_count?: number
          comment_count?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      pet_species: 'dog' | 'cat' | 'bird' | 'rabbit' | 'hamster' | 'fish' | 'reptile' | 'other'
      pet_gender: 'male' | 'female' | 'unknown'
      pet_size: 'tiny' | 'small' | 'medium' | 'large' | 'giant'
      meal_type: 'breakfast' | 'lunch' | 'dinner' | 'snack' | 'treat' | 'supplement'
      vaccine_status: 'scheduled' | 'administered' | 'overdue' | 'skipped'
      question_category: 'nutrition' | 'health' | 'training' | 'behavior' | 'grooming' | 'gear' | 'general'
      blog_category: 'nutrition' | 'health' | 'training' | 'grooming' | 'recipes' | 'lifestyle' | 'adoption' | 'behavior' | 'gear' | 'other'
      like_target_type: 'question' | 'comment' | 'blog_post'
      notification_type: 'like' | 'comment' | 'accepted_answer' | 'mention'
    }
  }
}

// ─── Convenience Row Types ───────────────────────────────────────
export type Profile = Database['public']['Tables']['profiles']['Row']
export type Pet = Database['public']['Tables']['pets']['Row']
export type FoodLog = Database['public']['Tables']['food_logs']['Row']
export type VaccineLog = Database['public']['Tables']['vaccine_logs']['Row']
export type Question = Database['public']['Tables']['questions']['Row']
export type Comment = Database['public']['Tables']['comments']['Row']
export type Like = Database['public']['Tables']['likes']['Row']
export type Notification = Database['public']['Tables']['notifications']['Row']
export type BlogPost = Database['public']['Tables']['blog_posts']['Row']


export type PetSpecies = Database['public']['Enums']['pet_species']
export type PetGender = Database['public']['Enums']['pet_gender']
export type PetSize = Database['public']['Enums']['pet_size']
export type MealType = Database['public']['Enums']['meal_type']
export type VaccineStatus = Database['public']['Enums']['vaccine_status']
export type QuestionCategory = Database['public']['Enums']['question_category']
export type LikeTargetType = Database['public']['Enums']['like_target_type']
export type NotificationType = Database['public']['Enums']['notification_type']
export type BlogCategory = Database['public']['Enums']['blog_category']
export type PetWithLogs = Pet & {
  food_logs: Pick<FoodLog, 'id' | 'food_name' | 'calories' | 'meal_type' | 'logged_at'>[]
  vaccine_logs: Pick<VaccineLog, 'id' | 'vaccine_name' | 'status' | 'next_due_at'>[]
}
