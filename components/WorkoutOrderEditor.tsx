
import React, { useState } from 'react';
import { Workout, WorkoutExercise } from '../types';
import { Save, ArrowLeft, GripVertical, ChevronDown, ChevronUp, Trash2, Clock } from 'lucide-react';
import { ExerciseCard } from './ExerciseCard';

interface WorkoutOrderEditorProps {
  workout: Workout;
  onSave: (workout: Workout) => void;
  onCancel: () => void;
}

export const WorkoutOrderEditor: React.FC<WorkoutOrderEditorProps> = ({ workout, onSave, onCancel }) => {
  const [items, setItems] = useState<WorkoutExercise[]>(workout.exercises);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [draggedItemIndex, setDraggedItemIndex] = useState<number | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(prev => prev === id ? null : id);
  };

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    setDraggedItemIndex(index);
    // Required for Firefox to allow drag
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, index: number) => {
    e.preventDefault();
    if (draggedItemIndex === null || draggedItemIndex === index) return;

    const newItems = [...items];
    const draggedItem = newItems[draggedItemIndex];
    newItems.splice(draggedItemIndex, 1);
    newItems.splice(index, 0, draggedItem);

    setItems(newItems);
    setDraggedItemIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedItemIndex(null);
  };

  const removeItem = (uniqueId: string) => {
    setItems(prev => prev.filter(i => i.uniqueId !== uniqueId));
  };

  const handleSave = () => {
    // Recalculate duration based on current list
    const totalDuration = items.reduce((acc, curr) => acc + curr.duration, 0);
    onSave({
        ...workout,
        exercises: items,
        totalDuration
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
       {/* Header */}
       <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between shadow-sm">
         <div className="flex items-center gap-3">
            <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
                <h1 className="text-lg font-bold text-gray-800">Organize Workout</h1>
                <p className="text-xs text-gray-500">{items.length} exercises • {items.reduce((a,b) => a + b.duration, 0)} mins total</p>
            </div>
         </div>
         <button 
           onClick={handleSave}
           className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-md"
         >
           <Save className="w-4 h-4" />
           Finish & Save
         </button>
       </div>

       <div className="max-w-3xl mx-auto w-full p-4 pb-20">
          <p className="text-sm text-gray-500 mb-4 bg-blue-50 text-blue-700 px-4 py-3 rounded-lg border border-blue-100 flex items-center gap-2">
            <GripVertical className="w-4 h-4" />
            Drag and drop items to reorder your workout sequence. Click arrow to view details.
          </p>

          <div className="space-y-3">
            {items.map((item, index) => (
                <div 
                    key={item.uniqueId}
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragEnd={handleDragEnd}
                    className={`bg-white rounded-xl border transition-all duration-200 ${
                        draggedItemIndex === index ? 'opacity-50 border-indigo-400 scale-[0.98]' : 'border-gray-200 shadow-sm hover:shadow-md'
                    }`}
                >
                    {/* List Tile Header */}
                    <div className="flex items-center p-3 gap-3">
                        <div className="cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 p-2">
                            <GripVertical className="w-5 h-5" />
                        </div>
                        
                        <div className="flex-grow">
                            <div className="flex items-center gap-2">
                                <span className="bg-gray-100 text-gray-600 text-xs font-bold w-6 h-6 rounded flex items-center justify-center">
                                    {index + 1}
                                </span>
                                <h3 className="font-bold text-gray-800">{item.title}</h3>
                            </div>
                            <p className="text-xs text-gray-500 line-clamp-1 mt-0.5 ml-8">{item.description}</p>
                        </div>

                        <div className="flex items-center gap-3 text-gray-500 text-xs font-medium whitespace-nowrap">
                             <span className="flex items-center gap-1">
                                 <Clock className="w-3 h-3" /> {item.duration}m
                             </span>
                        </div>

                        <div className="flex items-center gap-1 border-l border-gray-100 pl-2">
                             <button 
                                onClick={() => toggleExpand(item.uniqueId)}
                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-colors"
                             >
                                 {expandedId === item.uniqueId ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                             </button>
                             <button 
                                onClick={() => removeItem(item.uniqueId)}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                             >
                                 <Trash2 className="w-5 h-5" />
                             </button>
                        </div>
                    </div>

                    {/* Expanded Content */}
                    {expandedId === item.uniqueId && (
                        <div className="p-4 border-t border-gray-100 bg-gray-50/50 rounded-b-xl animate-fade-in">
                            <div className="max-w-md mx-auto pointer-events-none transform scale-95 origin-top">
                                {/* Reuse Exercise Card for preview, disable interactions */}
                                <ExerciseCard 
                                    exercise={item} 
                                    onPlay={() => {}} 
                                    onEdit={() => {}} 
                                />
                            </div>
                        </div>
                    )}
                </div>
            ))}
            
            {items.length === 0 && (
                <div className="text-center py-12 text-gray-400 border-2 border-dashed border-gray-200 rounded-xl">
                    No exercises in this workout.
                </div>
            )}
          </div>
       </div>
    </div>
  );
};
