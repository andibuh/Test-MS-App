export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type Category = 'Strength' | 'Cardio' | 'Flexibility' | 'Balance' | 'HIIT';

export interface Variant {
  id: string;
  type: 'easier' | 'harder';
  description: string;
}

export interface ExerciseStep {
  id: string;
  order: number;
  title: string;
  description: string;
  timestamp: number; // in seconds
  images: string[]; // Base64 data URLs
  variants: Variant[];
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  thumbnail: string | null;
  videoUrl: string; // URL to MP4 or similar
  duration: number; // in minutes
  category: Category;
  difficulty: Difficulty;
  steps: ExerciseStep[];
  createdAt: number;
}

export type ViewState = 'LIST' | 'EDITOR' | 'PLAYER';
