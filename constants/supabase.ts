import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

// Supabase configuration using environment variables for security
const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

// Debug: Log the configuration (remove in production)
console.log('Supabase Config:', {
  url: supabaseUrl ? '***' + supabaseUrl.slice(-10) : 'NOT SET',
  anonKey: supabaseAnonKey ? '***' + supabaseAnonKey.slice(-4) : 'NOT SET'
});

// Validate that required environment variables are set
const requiredEnvVars = [
  'EXPO_PUBLIC_SUPABASE_URL',
  'EXPO_PUBLIC_SUPABASE_ANON_KEY'
];

const missingEnvVars = requiredEnvVars.filter(envVar => !process.env[envVar]);

if (missingEnvVars.length > 0 && process.env.NODE_ENV === 'production') {
  console.error('Missing required Supabase environment variables:', missingEnvVars);
  throw new Error(`Missing required Supabase environment variables: ${missingEnvVars.join(', ')}`);
}

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase configuration. Please check your environment variables.');
}

// Create Supabase client
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Configure auth settings
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: Platform.OS === 'web',
    storage: Platform.OS === 'web' ? undefined : undefined, // Use default storage
  },
  realtime: {
    // Configure realtime settings if needed
    params: {
      eventsPerSecond: 10,
    },
  },
});

// Export types for TypeScript
export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          email: string;
          display_name: string | null;
          created_at: string;
          last_login: string;
          is_onboarded: boolean;
        };
        Insert: {
          id: string;
          email: string;
          display_name?: string | null;
          created_at?: string;
          last_login?: string;
          is_onboarded?: boolean;
        };
        Update: {
          id?: string;
          email?: string;
          display_name?: string | null;
          created_at?: string;
          last_login?: string;
          is_onboarded?: boolean;
        };
      };
      conversations: {
        Row: {
          id: string;
          user_id: string;
          messages: any[];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          messages: any[];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          messages?: any[];
          created_at?: string;
          updated_at?: string;
        };
      };
      goals: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          description: string | null;
          milestones: any[];
          progress: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          title: string;
          description?: string | null;
          milestones?: any[];
          progress?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          description?: string | null;
          milestones?: any[];
          progress?: number;
          created_at?: string;
          updated_at?: string;
        };
      };
      user_motivations: {
        Row: {
          id: string;
          user_id: string;
          text: string;
          category: string | null;
          created_at: string;
        };
        Insert: {
          id: string;
          user_id: string;
          text: string;
          category?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          text?: string;
          category?: string | null;
          created_at?: string;
        };
      };
    };
  };
};