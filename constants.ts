import { Exercise } from './types';

export const INITIAL_EXERCISES: Exercise[] = [
  {
    id: 'ex_1',
    title: 'Perfect Push-Up Guide',
    description: 'Master the fundamental upper body pushing exercise with proper form and tempo control.',
    thumbnail: 'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?q=80&w=2070&auto=format&fit=crop',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', // Using a reliable sample video for demo
    duration: 10,
    category: 'Strength',
    difficulty: 'Intermediate',
    createdAt: Date.now(),
    steps: [
      {
        id: 'step_1',
        order: 1,
        title: 'Setup Position',
        description: 'Place hands slightly wider than shoulder-width apart. Keep body in a straight plank line.',
        timestamp: 0,
        images: ['https://images.unsplash.com/photo-1566241440091-ec10de8db2e1?q=80&w=2016&auto=format&fit=crop'],
        variants: [
          { id: 'v1', type: 'easier', description: 'Perform on knees' }
        ]
      },
      {
        id: 'step_2',
        order: 2,
        title: 'Descent Phase',
        description: 'Lower your body until your chest nearly touches the floor. Elbows should be at a 45-degree angle.',
        timestamp: 10, // Simulated timestamp for demo
        images: [],
        variants: []
      },
      {
        id: 'step_3',
        order: 3,
        title: 'Explosive Push',
        description: 'Push back up to the starting position with power, keeping the core tight.',
        timestamp: 25, // Simulated timestamp for demo
        images: [],
        variants: [
          { id: 'v2', type: 'harder', description: 'Add a clap at the top' }
        ]
      }
    ]
  }
];

export const CATEGORIES: import('./types').Category[] = ['Strength', 'Cardio', 'Flexibility', 'Balance', 'HIIT'];
export const DIFFICULTIES: import('./types').Difficulty[] = ['Beginner', 'Intermediate', 'Advanced'];
