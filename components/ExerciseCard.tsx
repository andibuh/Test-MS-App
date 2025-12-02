import React from 'react';
import { Play, Clock, BarChart, Tag } from 'lucide-react';
import { Exercise } from '../types';

interface ExerciseCardProps {
  exercise: Exercise;
  onPlay: (exercise: Exercise) => void;
  onEdit: (exercise: Exercise) => void;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({ exercise, onPlay, onEdit }) => {
  return (
    <div 
      className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer group flex flex-col h-full border border-gray-100"
      onClick={() => onEdit(exercise)}
    >
      {/* Thumbnail Section */}
      <div className="relative h-48 w-full bg-gray-200 overflow-hidden shrink-0">
        {exercise.thumbnail ? (
          <img 
            src={exercise.thumbnail} 
            alt={exercise.title} 
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">
            No Thumbnail
          </div>
        )}
        
        {/* Play Button Overlay - Clicking this triggers play, bubbling stopped */}
        <div 
          className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          onClick={(e) => {
            e.stopPropagation();
            onPlay(exercise);
          }}
        >
          <div className="bg-white/20 backdrop-blur-sm p-4 rounded-full hover:bg-white/40 transition-colors">
            <Play className="w-8 h-8 text-white fill-current" />
          </div>
        </div>
        
        <div className="absolute top-2 right-2 bg-black/60 backdrop-blur-md px-2 py-1 rounded-md text-xs font-medium text-white flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {exercise.duration} min
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-800 mb-2 line-clamp-1">{exercise.title}</h3>
        <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-grow">{exercise.description}</p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-gray-100">
          <div className="flex items-center gap-2 text-xs font-medium text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
            <Tag className="w-3 h-3" />
            {exercise.category}
          </div>
          <div className={`flex items-center gap-2 text-xs font-medium px-2 py-1 rounded-full ${
            exercise.difficulty === 'Beginner' ? 'text-green-600 bg-green-50' :
            exercise.difficulty === 'Intermediate' ? 'text-yellow-600 bg-yellow-50' :
            'text-red-600 bg-red-50'
          }`}>
            <BarChart className="w-3 h-3" />
            {exercise.difficulty}
          </div>
        </div>
      </div>
    </div>
  );
};
