
export type Difficulty = 'Beginner' | 'Intermediate' | 'Advanced';
export type Category = 'Strength' | 'Cardio' | 'Flexibility' | 'Balance' | 'HIIT';
export type WorkoutCategory = 'Fitness' | 'Relaxation';

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

// Wrapper for an exercise inside a workout (allows duplicates with unique IDs)
export interface WorkoutExercise extends Exercise {
  uniqueId: string; 
}

export interface Workout {
  id: string;
  title: string;
  description: string;
  category: WorkoutCategory;
  difficulty: Difficulty;
  totalDuration: number;
  exercises: WorkoutExercise[];
  createdAt: number;
}

export type ViewState = 'LIST' | 'EDITOR' | 'PLAYER' | 'WORKOUT_BUILDER' | 'WORKOUT_SORTER';
