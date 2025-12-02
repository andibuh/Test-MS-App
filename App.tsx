import React, { useState, useEffect } from 'react';
import { Plus, Dumbbell } from 'lucide-react';
import { Exercise, ViewState } from './types';
import { INITIAL_EXERCISES } from './constants';
import { ExerciseCard } from './components/ExerciseCard';
import { ExerciseEditor } from './components/ExerciseEditor';
import { VideoPlayerView } from './components/VideoPlayerView';

const App: React.FC = () => {
  const [exercises, setExercises] = useState<Exercise[]>(() => {
    const saved = localStorage.getItem('fitflow_exercises');
    return saved ? JSON.parse(saved) : INITIAL_EXERCISES;
  });

  const [view, setView] = useState<ViewState>('LIST');
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);

  useEffect(() => {
    localStorage.setItem('fitflow_exercises', JSON.stringify(exercises));
  }, [exercises]);

  const handleCreateNew = () => {
    setActiveExercise(null);
    setView('EDITOR');
  };

  const handleEdit = (ex: Exercise) => {
    setActiveExercise(ex);
    setView('EDITOR');
  };

  const handlePlay = (ex: Exercise) => {
    setActiveExercise(ex);
    setView('PLAYER');
  };

  const handleSaveExercise = (exercise: Exercise) => {
    setExercises(prev => {
      const exists = prev.find(e => e.id === exercise.id);
      if (exists) {
        return prev.map(e => e.id === exercise.id ? exercise : e);
      }
      return [exercise, ...prev];
    });
    setView('LIST');
    setActiveExercise(null);
  };

  const renderContent = () => {
    switch (view) {
      case 'EDITOR':
        return (
          <ExerciseEditor 
            initialData={activeExercise}
            onSave={handleSaveExercise}
            onCancel={() => setView('LIST')}
          />
        );
      case 'PLAYER':
        return activeExercise ? (
          <VideoPlayerView 
            exercise={activeExercise} 
            onClose={() => setView('LIST')} 
          />
        ) : null;
      case 'LIST':
      default:
        return (
          <div className="min-h-screen bg-gray-50 pb-20">
             {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="bg-indigo-600 p-2 rounded-lg">
                    <Dumbbell className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-xl font-bold text-gray-900 tracking-tight">FitFlow<span className="text-indigo-600">Pro</span></h1>
                </div>
                <button 
                  onClick={handleCreateNew}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  Create Exercise
                </button>
              </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
               <div className="flex items-center justify-between mb-6">
                 <h2 className="text-2xl font-bold text-gray-800">Your Library</h2>
                 <span className="text-gray-500 text-sm">{exercises.length} Exercises</span>
               </div>
               
               <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {exercises.map(ex => (
                    <ExerciseCard 
                      key={ex.id} 
                      exercise={ex} 
                      onEdit={handleEdit}
                      onPlay={handlePlay}
                    />
                  ))}
               </div>

               {exercises.length === 0 && (
                 <div className="text-center py-20">
                    <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Plus className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">No exercises yet</h3>
                    <p className="text-gray-500 mt-1">Create your first exercise to get started.</p>
                 </div>
               )}
            </main>
          </div>
        );
    }
  };

  return (
    <div className="antialiased text-gray-900 font-sans">
      {renderContent()}
    </div>
  );
};

export default App;
