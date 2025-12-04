import React, { useState, useEffect } from 'react';
import { Plus, Dumbbell, Search, Filter, X, Layers, PlayCircle, Edit3, Trash2, Clock } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Exercise, Workout, WorkoutExercise, ViewState } from './types';
import { INITIAL_EXERCISES, CATEGORIES, DIFFICULTIES } from './constants';
import { ExerciseCard } from './components/ExerciseCard';
import { ExerciseEditor } from './components/ExerciseEditor';
import { VideoPlayerView } from './components/VideoPlayerView';
import { WorkoutOrderEditor } from './components/WorkoutOrderEditor';

const WORKOUT_CATEGORIES = ['Fitness', 'Relaxation'];

const App: React.FC = () => {
  // --- State ---
  const [exercises, setExercises] = useState<Exercise[]>(() => {
    const saved = localStorage.getItem('fitflow_exercises');
    return saved ? JSON.parse(saved) : INITIAL_EXERCISES;
  });

  const [workouts, setWorkouts] = useState<Workout[]>(() => {
      const saved = localStorage.getItem('fitflow_workouts');
      return saved ? JSON.parse(saved) : [];
  });

  const [view, setView] = useState<ViewState>('LIST');
  const [libraryMode, setLibraryMode] = useState<'EXERCISES' | 'WORKOUTS'>('EXERCISES');
  
  const [activeExercise, setActiveExercise] = useState<Exercise | null>(null);
  
  // Workout Builder State
  const [currentWorkout, setCurrentWorkout] = useState<Workout | null>(null);

  // Search & Filter State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('All');

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('fitflow_exercises', JSON.stringify(exercises));
  }, [exercises]);

  useEffect(() => {
      localStorage.setItem('fitflow_workouts', JSON.stringify(workouts));
  }, [workouts]);

  // --- Handlers: Exercises ---

  const handleCreateExercise = () => {
    setActiveExercise(null);
    setView('EDITOR');
  };

  const handleEditExercise = (ex: Exercise) => {
    setActiveExercise(ex);
    setView('EDITOR');
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

  // --- Handlers: Workouts ---

  const handleCreateWorkout = () => {
      // Initialize a new empty workout
      const newWorkout: Workout = {
          id: uuidv4(),
          title: '',
          description: '',
          category: 'Fitness',
          difficulty: 'Beginner',
          exercises: [],
          totalDuration: 0,
          createdAt: Date.now()
      };
      setCurrentWorkout(newWorkout);
      setView('WORKOUT_BUILDER');
      setLibraryMode('EXERCISES'); // Show exercises to add
  };

  const handleEditWorkout = (workout: Workout) => {
      setCurrentWorkout({...workout});
      setView('WORKOUT_BUILDER'); // Or maybe straight to sorter? For now builder logic applies.
  };

  const handleAddToWorkout = (exercise: Exercise) => {
      if (!currentWorkout) return;

      const alreadyExists = currentWorkout.exercises.some(e => e.id === exercise.id);
      
      if (alreadyExists) {
          const confirm = window.confirm(`"${exercise.title}" is already in this workout. Add it again?`);
          if (!confirm) return;
      }

      const workoutExercise: WorkoutExercise = {
          ...exercise,
          uniqueId: uuidv4() // Create a unique ID for this specific instance in the list
      };

      setCurrentWorkout(prev => {
          if(!prev) return null;
          return {
              ...prev,
              exercises: [...prev.exercises, workoutExercise],
              totalDuration: prev.totalDuration + exercise.duration
          };
      });
  };

  const handleGoToSorter = () => {
      if(!currentWorkout) return;
      if(!currentWorkout.title.trim()) {
          alert("Please enter a workout title before proceeding.");
          return;
      }
      if(currentWorkout.exercises.length === 0) {
          alert("Please add at least one exercise.");
          return;
      }
      setView('WORKOUT_SORTER');
  };

  const handleFinalizeWorkout = (finalWorkout: Workout) => {
      setWorkouts(prev => {
          const exists = prev.find(w => w.id === finalWorkout.id);
          if(exists) {
              return prev.map(w => w.id === finalWorkout.id ? finalWorkout : w);
          }
          return [finalWorkout, ...prev];
      });
      setCurrentWorkout(null);
      setView('LIST');
      setLibraryMode('WORKOUTS'); // Switch to see the result
  };
  
  const handleDeleteWorkout = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if(window.confirm('Delete this workout?')) {
          setWorkouts(prev => prev.filter(w => w.id !== id));
      }
  };


  // --- Filter Logic ---
  const filteredExercises = exercises.filter(ex => {
    const searchLower = searchQuery.toLowerCase();
    const matchesSearch = 
      ex.title.toLowerCase().includes(searchLower) ||
      ex.description.toLowerCase().includes(searchLower) ||
      ex.category.toLowerCase().includes(searchLower) || 
      ex.difficulty.toLowerCase().includes(searchLower);

    const matchesCategory = selectedCategory === 'All' || ex.category === selectedCategory;
    const matchesDifficulty = selectedDifficulty === 'All' || ex.difficulty === selectedDifficulty;

    return matchesSearch && matchesCategory && matchesDifficulty;
  });

  const clearFilters = () => {
      setSearchQuery('');
      setSelectedCategory('All');
      setSelectedDifficulty('All');
  };

  const hasActiveFilters = searchQuery !== '' || selectedCategory !== 'All' || selectedDifficulty !== 'All';

  // --- Render ---

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
      case 'WORKOUT_SORTER':
          return currentWorkout ? (
              <WorkoutOrderEditor 
                workout={currentWorkout}
                onSave={handleFinalizeWorkout}
                onCancel={() => setView('WORKOUT_BUILDER')}
              />
          ) : null;
      case 'LIST':
      case 'WORKOUT_BUILDER':
      default:
        // Combined Main View
        const isBuilder = view === 'WORKOUT_BUILDER';

        return (
          <div className="min-h-screen bg-gray-50 pb-20">
             {/* Main App Bar */}
            <header className={`bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm transition-colors ${isBuilder ? 'border-b-indigo-200 bg-indigo-50/50' : ''}`}>
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
                <div className="flex items-center gap-2 cursor-pointer" onClick={() => {
                    if(!isBuilder) clearFilters();
                }}>
                  <div className={`${isBuilder ? 'bg-indigo-600' : 'bg-gray-800'} p-2 rounded-lg transition-colors`}>
                    <Dumbbell className="w-6 h-6 text-white" />
                  </div>
                  <h1 className="text-xl font-bold text-gray-900 tracking-tight hidden sm:block">
                      {isBuilder ? 'Workout Builder' : <span>FitFlow<span className="text-indigo-600">Pro</span></span>}
                  </h1>
                </div>

                <div className="flex items-center gap-3">
                    {isBuilder ? (
                        <>
                             <button 
                                onClick={() => {
                                    if(window.confirm('Discard unsaved workout?')) {
                                        setCurrentWorkout(null);
                                        setView('LIST');
                                    }
                                }}
                                className="text-gray-600 hover:bg-gray-200 px-3 py-2 rounded-lg text-sm font-medium"
                             >
                                 Cancel
                             </button>
                             <button 
                                onClick={handleGoToSorter}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
                             >
                                 <Layers className="w-4 h-4" />
                                 Review & Save ({currentWorkout?.exercises.length})
                             </button>
                        </>
                    ) : (
                        <>
                            <button 
                                onClick={handleCreateWorkout}
                                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                            >
                                <Layers className="w-4 h-4" />
                                <span className="hidden sm:inline">Create Workout</span>
                            </button>
                            <button 
                                onClick={handleCreateExercise}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
                            >
                                <Plus className="w-4 h-4" />
                                <span className="hidden sm:inline">New Exercise</span>
                            </button>
                        </>
                    )}
                </div>
              </div>
            </header>

            {/* Workout Metadata Form (Only in Builder Mode) */}
            {isBuilder && currentWorkout && (
                <div className="bg-white border-b border-indigo-100 shadow-sm animate-fade-in">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                             <div className="md:col-span-8 space-y-4">
                                 <div>
                                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Workout Title</label>
                                    <input 
                                        type="text" 
                                        value={currentWorkout.title}
                                        onChange={(e) => setCurrentWorkout({...currentWorkout, title: e.target.value})}
                                        placeholder="e.g. Monday Morning HIIT"
                                        className="w-full text-xl font-bold border-b-2 border-gray-200 focus:border-indigo-500 outline-none py-2 bg-transparent placeholder-gray-300"
                                    />
                                 </div>
                                 <div>
                                     <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                                     <textarea 
                                        value={currentWorkout.description}
                                        onChange={(e) => setCurrentWorkout({...currentWorkout, description: e.target.value})}
                                        placeholder="Describe the goal of this workout..."
                                        rows={2}
                                        className="w-full text-sm border border-gray-200 rounded-lg p-2 focus:ring-1 focus:ring-indigo-500 outline-none"
                                     />
                                 </div>
                             </div>
                             <div className="md:col-span-4 space-y-4 bg-gray-50 p-4 rounded-lg border border-gray-100">
                                 <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                                     <span className="text-sm font-medium text-gray-600">Total Duration</span>
                                     <span className="text-lg font-bold text-indigo-600">{currentWorkout.totalDuration} min</span>
                                 </div>
                                 <div className="grid grid-cols-2 gap-3">
                                     <div>
                                         <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Category</label>
                                         <select 
                                            value={currentWorkout.category}
                                            onChange={(e) => setCurrentWorkout({...currentWorkout, category: e.target.value as any})}
                                            className="w-full text-sm bg-white border border-gray-200 rounded p-1.5"
                                         >
                                             {WORKOUT_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                         </select>
                                     </div>
                                     <div>
                                         <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Difficulty</label>
                                         <select 
                                            value={currentWorkout.difficulty}
                                            onChange={(e) => setCurrentWorkout({...currentWorkout, difficulty: e.target.value as any})}
                                            className="w-full text-sm bg-white border border-gray-200 rounded p-1.5"
                                         >
                                             {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                                         </select>
                                     </div>
                                 </div>
                             </div>
                        </div>
                    </div>
                </div>
            )}

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
               
               {/* Mode Switcher (Only in List Mode) */}
               {!isBuilder && (
                   <div className="flex justify-center mb-8">
                       <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 inline-flex">
                           <button 
                             onClick={() => setLibraryMode('EXERCISES')}
                             className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${libraryMode === 'EXERCISES' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                           >
                               Exercises
                           </button>
                           <button 
                             onClick={() => setLibraryMode('WORKOUTS')}
                             className={`px-6 py-2 rounded-lg text-sm font-bold transition-all ${libraryMode === 'WORKOUTS' ? 'bg-indigo-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-50'}`}
                           >
                               Workouts
                           </button>
                       </div>
                   </div>
               )}

               {/* -- WORKOUTS LIST -- */}
               {(!isBuilder && libraryMode === 'WORKOUTS') && (
                   <div className="animate-fade-in">
                       <h2 className="text-2xl font-bold text-gray-800 mb-6">Your Workouts ({workouts.length})</h2>
                       {workouts.length > 0 ? (
                           <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                               {workouts.map(workout => (
                                   <div key={workout.id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
                                       <div className="h-3 bg-indigo-600 w-full"></div>
                                       <div className="p-6">
                                           <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${workout.category === 'Fitness' ? 'bg-orange-100 text-orange-700' : 'bg-teal-100 text-teal-700'}`}>
                                                        {workout.category}
                                                    </span>
                                                    <h3 className="text-xl font-bold text-gray-900 mt-2">{workout.title}</h3>
                                                </div>
                                                <button onClick={(e) => handleDeleteWorkout(e, workout.id)} className="text-gray-300 hover:text-red-500">
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                           </div>
                                           <p className="text-gray-500 text-sm mb-4 line-clamp-2">{workout.description}</p>
                                           
                                           <div className="flex items-center gap-4 text-xs text-gray-500 font-medium mb-6">
                                                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {workout.totalDuration} min</span>
                                                <span className="flex items-center gap-1"><Layers className="w-3 h-3" /> {workout.exercises.length} Exercises</span>
                                                <span className="flex items-center gap-1"><Dumbbell className="w-3 h-3" /> {workout.difficulty}</span>
                                           </div>

                                           <button 
                                            onClick={() => handleEditWorkout(workout)}
                                            className="w-full py-2 bg-gray-50 hover:bg-gray-100 text-gray-700 font-bold rounded-lg flex items-center justify-center gap-2 border border-gray-200 transition-colors"
                                           >
                                               <Edit3 className="w-4 h-4" /> Edit / View
                                           </button>
                                       </div>
                                   </div>
                               ))}
                           </div>
                       ) : (
                           <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 border-dashed">
                               <Layers className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                               <h3 className="text-gray-900 font-medium">No Workouts Created</h3>
                               <p className="text-gray-500 text-sm">Switch to Exercises or click "Create Workout" to start.</p>
                           </div>
                       )}
                   </div>
               )}

               {/* -- EXERCISES LIST (Available in List Mode & Builder Mode) -- */}
               {((!isBuilder && libraryMode === 'EXERCISES') || isBuilder) && (
                   <div className="animate-fade-in">
                        <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-800">
                                    {isBuilder ? 'Add Exercises' : 'Exercise Library'}
                                </h2>
                                <span className="text-gray-500 text-sm">
                                    {filteredExercises.length} results
                                </span>
                            </div>

                            {/* Search & Filter Bar */}
                            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                                <div className="relative group">
                                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
                                    <input 
                                        type="text" 
                                        placeholder="Search..." 
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                                    />
                                    {searchQuery && (
                                        <button onClick={() => setSearchQuery('')} className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600">
                                            <X className="w-4 h-4" />
                                        </button>
                                    )}
                                </div>
                                
                                <div className="flex gap-2 overflow-x-auto pb-1 sm:pb-0">
                                    <select 
                                        value={selectedCategory}
                                        onChange={(e) => setSelectedCategory(e.target.value)}
                                        className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                                    >
                                        <option value="All">All Categories</option>
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                    
                                    <select 
                                        value={selectedDifficulty}
                                        onChange={(e) => setSelectedDifficulty(e.target.value)}
                                        className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                                    >
                                        <option value="All">All Levels</option>
                                        {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                                    </select>
                                    
                                    {hasActiveFilters && (
                                        <button 
                                            onClick={clearFilters}
                                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm transition-colors flex items-center gap-1 shrink-0"
                                        >
                                            <X className="w-3 h-3" /> Clear
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>

                        {filteredExercises.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                {filteredExercises.map(ex => {
                                    // Count how many times this exercise is in the current builder workout
                                    const count = isBuilder && currentWorkout 
                                        ? currentWorkout.exercises.filter(e => e.id === ex.id).length 
                                        : 0;

                                    return (
                                        <ExerciseCard 
                                            key={ex.id} 
                                            exercise={ex} 
                                            onEdit={handleEditExercise}
                                            onPlay={(e) => {
                                                setActiveExercise(e);
                                                setView('PLAYER');
                                            }}
                                            isBuilderMode={isBuilder}
                                            onAddToWorkout={handleAddToWorkout}
                                            addedCount={count}
                                        />
                                    );
                                })}
                            </div>
                        ) : (
                            <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
                                <Search className="w-8 h-8 text-gray-300 mx-auto mb-4" />
                                <h3 className="text-lg font-medium text-gray-900">No exercises found</h3>
                            </div>
                        )}
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