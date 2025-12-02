import React, { useState, useRef } from 'react';
import { Save, Plus, Trash2, Image as ImageIcon, Sparkles, ChevronDown, ChevronUp, GripVertical, Video, ArrowLeft, Clock } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Exercise, ExerciseStep, Variant, Category, Difficulty } from '../types';
import { CATEGORIES, DIFFICULTIES } from '../constants';
import { generateExerciseDescription, suggestVariants } from '../services/geminiService';

interface ExerciseEditorProps {
  initialData?: Exercise | null;
  onSave: (exercise: Exercise) => void;
  onCancel: () => void;
}

const EMPTY_EXERCISE: Exercise = {
  id: '',
  title: '',
  description: '',
  thumbnail: null,
  videoUrl: '',
  duration: 15,
  category: 'Strength',
  difficulty: 'Beginner',
  steps: [],
  createdAt: 0,
};

export const ExerciseEditor: React.FC<ExerciseEditorProps> = ({ initialData, onSave, onCancel }) => {
  const [exercise, setExercise] = useState<Exercise>(initialData ? { ...initialData } : { ...EMPTY_EXERCISE, id: uuidv4(), createdAt: Date.now() });
  const [isGenerating, setIsGenerating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- Handlers for Main Exercise ---

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setExercise(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateDescription = async () => {
    if (!exercise.title) return;
    setIsGenerating(true);
    const desc = await generateExerciseDescription(exercise.title, exercise.category);
    if (desc) setExercise(prev => ({ ...prev, description: desc }));
    setIsGenerating(false);
  };

  const handleThumbnailUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setExercise(prev => ({ ...prev, thumbnail: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Handlers for Steps ---

  const addStep = () => {
    const newStep: ExerciseStep = {
      id: uuidv4(),
      order: exercise.steps.length + 1,
      title: '',
      description: '',
      timestamp: 0,
      images: [],
      variants: []
    };
    setExercise(prev => ({ ...prev, steps: [...prev.steps, newStep] }));
  };

  const updateStep = (id: string, field: keyof ExerciseStep, value: any) => {
    setExercise(prev => ({
      ...prev,
      steps: prev.steps. map(s => s.id === id ? { ...s, [field]: value } : s)
    }));
  };

  const removeStep = (id: string) => {
    setExercise(prev => ({
      ...prev,
      steps: prev.steps.filter(s => s.id !== id).map((s, idx) => ({ ...s, order: idx + 1 }))
    }));
  };

  const handleStepImageUpload = (stepId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const step = exercise.steps.find(s => s.id === stepId);
        if (step && step.images.length < 2) {
           updateStep(stepId, 'images', [...step.images, reader.result as string]);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // --- Handlers for Variants ---

  const addVariant = (stepId: string) => {
     const step = exercise.steps.find(s => s.id === stepId);
     if (!step) return;
     const newVariant: Variant = { id: uuidv4(), type: 'easier', description: '' };
     updateStep(stepId, 'variants', [...step.variants, newVariant]);
  };

  const updateVariant = (stepId: string, variantId: string, field: keyof Variant, value: any) => {
    const step = exercise.steps.find(s => s.id === stepId);
    if (!step) return;
    const updatedVariants = step.variants.map(v => v.id === variantId ? { ...v, [field]: value } : v);
    updateStep(stepId, 'variants', updatedVariants);
  };

  const removeVariant = (stepId: string, variantId: string) => {
    const step = exercise.steps.find(s => s.id === stepId);
    if (!step) return;
    updateStep(stepId, 'variants', step.variants.filter(v => v.id !== variantId));
  };

  const handleSuggestVariants = async (stepId: string) => {
      const step = exercise.steps.find(s => s.id === stepId);
      if(!step || !step.description) return;
      
      const resultJson = await suggestVariants(step.description);
      try {
          const result = JSON.parse(resultJson);
          const newVariants: Variant[] = [];
          if(result.easier) newVariants.push({id: uuidv4(), type: 'easier', description: result.easier});
          if(result.harder) newVariants.push({id: uuidv4(), type: 'harder', description: result.harder});
          
          if(newVariants.length > 0) {
              updateStep(stepId, 'variants', [...step.variants, ...newVariants]);
          }
      } catch (e) {
          console.error("Failed to parse variants JSON", e);
      }
  };


  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
       {/* Sticky Header */}
       <div className="sticky top-0 z-30 bg-white border-b border-gray-200 px-4 py-4 flex items-center justify-between shadow-sm">
         <div className="flex items-center gap-3">
            <button onClick={onCancel} className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
                <ArrowLeft className="w-5 h-5" />
            </button>
            <h1 className="text-lg font-bold text-gray-800">
                {initialData ? 'Edit Exercise' : 'New Exercise'}
            </h1>
         </div>
         <button 
           onClick={() => onSave(exercise)}
           className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2 transition-colors shadow-md hover:shadow-lg"
         >
           <Save className="w-4 h-4" />
           Save
         </button>
       </div>

       <div className="max-w-4xl mx-auto w-full p-4 space-y-8 pb-20">
          
          {/* Main Details Card */}
          <div className="bg-white rounded-xl shadow-md border border-gray-200 p-6 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Exercise Title</label>
                        <input 
                            type="text" 
                            name="title"
                            value={exercise.title}
                            onChange={handleInputChange}
                            placeholder="e.g. Burpee Box Jump"
                            className="w-full px-4 py-2 bg-white text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm placeholder-gray-400"
                        />
                    </div>
                    <div>
                        <div className="flex justify-between items-center mb-1">
                             <label className="block text-sm font-bold text-gray-700">Description</label>
                             <button 
                                onClick={handleGenerateDescription}
                                disabled={isGenerating || !exercise.title}
                                className="text-xs flex items-center gap-1 text-indigo-600 hover:text-indigo-800 font-medium disabled:opacity-50"
                             >
                                 <Sparkles className="w-3 h-3" />
                                 {isGenerating ? 'Thinking...' : 'AI Enhance'}
                             </button>
                        </div>
                        <textarea 
                            name="description"
                            value={exercise.description}
                            onChange={handleInputChange}
                            rows={3}
                            className="w-full px-4 py-2 bg-white text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all shadow-sm placeholder-gray-400"
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Category</label>
                            <select 
                                name="category" 
                                value={exercise.category} 
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 bg-white text-black border border-gray-300 rounded-lg outline-none shadow-sm"
                            >
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-gray-700 mb-1">Difficulty</label>
                            <select 
                                name="difficulty" 
                                value={exercise.difficulty} 
                                onChange={handleInputChange}
                                className="w-full px-4 py-2 bg-white text-black border border-gray-300 rounded-lg outline-none shadow-sm"
                            >
                                {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-bold text-gray-700 mb-1">Video URL (MP4 or YouTube)</label>
                        <div className="flex gap-2">
                            <div className="relative flex-grow">
                                <Video className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                <input 
                                    type="text" 
                                    name="videoUrl"
                                    value={exercise.videoUrl}
                                    onChange={handleInputChange}
                                    placeholder="https://youtube.com/..."
                                    className="w-full pl-9 pr-4 py-2 bg-white text-black border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm placeholder-gray-400"
                                />
                            </div>
                        </div>
                    </div>

                    <div>
                         <label className="block text-sm font-bold text-gray-700 mb-1">Thumbnail</label>
                         <div 
                           className="bg-white border-2 border-dashed border-gray-300 rounded-lg h-40 w-full flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors overflow-hidden relative"
                           onClick={() => fileInputRef.current?.click()}
                         >
                            {exercise.thumbnail ? (
                                <img src={exercise.thumbnail} alt="Thumbnail" className="w-full h-full object-cover" />
                            ) : (
                                <>
                                    <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                                    <span className="text-sm text-gray-500">Click to upload image</span>
                                </>
                            )}
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/*"
                                onChange={handleThumbnailUpload}
                            />
                         </div>
                    </div>
                </div>
            </div>
          </div>

          {/* Steps Section */}
          <div className="space-y-4">
              <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-800">Execution Steps</h2>
                  <button onClick={addStep} className="text-sm text-indigo-600 font-bold hover:bg-indigo-50 px-3 py-1 rounded-lg transition-colors flex items-center gap-1 border border-indigo-100 bg-white">
                      <Plus className="w-4 h-4" /> Add Step
                  </button>
              </div>

              {exercise.steps.length === 0 && (
                  <div className="text-center py-10 bg-white rounded-xl border border-gray-200 border-dashed text-gray-400 shadow-sm">
                      No steps added yet. Start building your exercise!
                  </div>
              )}

              {exercise.steps.map((step, index) => (
                  <div key={step.id} className="bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden">
                      <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                          <div className="flex items-center gap-3">
                              <span className="bg-white border border-gray-300 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-gray-700">
                                  {index + 1}
                              </span>
                              <span className="font-bold text-gray-700">{step.title || 'Untitled Step'}</span>
                          </div>
                          <button onClick={() => removeStep(step.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                              <Trash2 className="w-4 h-4" />
                          </button>
                      </div>
                      
                      <div className="p-4 grid grid-cols-1 md:grid-cols-12 gap-6">
                          <div className="md:col-span-8 space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col">
                                        <label className="text-xs font-bold text-gray-500 uppercase mb-1">Title</label>
                                        <input 
                                            type="text" 
                                            placeholder="Step Title" 
                                            value={step.title}
                                            onChange={(e) => updateStep(step.id, 'title', e.target.value)}
                                            className="w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-md text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-gray-400"
                                        />
                                    </div>
                                    <div className="flex flex-col">
                                         <label className="text-xs font-bold text-gray-500 uppercase mb-1">Time (Seconds)</label>
                                         <div className="relative">
                                            <Clock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                                            <input 
                                                type="number" 
                                                placeholder="0" 
                                                value={step.timestamp}
                                                onChange={(e) => updateStep(step.id, 'timestamp', parseInt(e.target.value) || 0)}
                                                className="w-full pl-9 pr-3 py-2 bg-white text-black border border-gray-300 rounded-md text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-gray-400"
                                            />
                                         </div>
                                    </div>
                                </div>
                                <div className="flex flex-col">
                                     <label className="text-xs font-bold text-gray-500 uppercase mb-1">Description</label>
                                     <textarea 
                                        placeholder="Detailed description of this step..." 
                                        value={step.description}
                                        onChange={(e) => updateStep(step.id, 'description', e.target.value)}
                                        rows={2}
                                        className="w-full px-3 py-2 bg-white text-black border border-gray-300 rounded-md text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 placeholder-gray-400"
                                    />
                                </div>
                                
                                {/* Variants Sub-section */}
                                <div className="bg-gray-50 rounded-lg p-3 space-y-2 border border-gray-200">
                                    <div className="flex justify-between items-center">
                                        <h4 className="text-xs font-bold text-gray-500 uppercase">Variants</h4>
                                         <div className="flex gap-2">
                                            <button 
                                                onClick={() => handleSuggestVariants(step.id)} 
                                                className="text-xs text-indigo-600 font-medium hover:underline flex items-center gap-1"
                                                disabled={!step.description}
                                            >
                                                <Sparkles className="w-3 h-3" /> AI Suggest
                                            </button>
                                            <button onClick={() => addVariant(step.id)} className="text-xs text-indigo-600 font-medium hover:underline flex items-center gap-1">
                                                <Plus className="w-3 h-3" /> Add
                                            </button>
                                         </div>
                                    </div>
                                    {step.variants.map(v => (
                                        <div key={v.id} className="flex gap-2 items-center">
                                            <select 
                                                value={v.type}
                                                onChange={(e) => updateVariant(step.id, v.id, 'type', e.target.value)}
                                                className={`text-xs font-medium rounded border px-2 py-2 outline-none ${v.type === 'easier' ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}
                                            >
                                                <option value="easier">Easier</option>
                                                <option value="harder">Harder</option>
                                            </select>
                                            <input 
                                                type="text" 
                                                value={v.description}
                                                onChange={(e) => updateVariant(step.id, v.id, 'description', e.target.value)}
                                                className="flex-grow text-xs px-2 py-2 bg-white text-black border border-gray-300 rounded outline-none focus:border-indigo-500 placeholder-gray-400"
                                                placeholder="Variant details..."
                                            />
                                            <button onClick={() => removeVariant(step.id, v.id)} className="text-gray-400 hover:text-red-500">
                                                <XIcon className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                          </div>

                          <div className="md:col-span-4 flex flex-col gap-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">Step Images (Max 2)</label>
                                <div className="grid grid-cols-2 gap-2">
                                    {step.images.map((img, i) => (
                                        <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200 group bg-white">
                                            <img src={img} alt="" className="w-full h-full object-cover" />
                                            <button 
                                                onClick={() => {
                                                    const newImages = step.images.filter((_, idx) => idx !== i);
                                                    updateStep(step.id, 'images', newImages);
                                                }}
                                                className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <XIcon className="w-3 h-3" />
                                            </button>
                                        </div>
                                    ))}
                                    {step.images.length < 2 && (
                                        <label className="aspect-square rounded-lg border-2 border-dashed border-gray-300 flex flex-col items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors bg-white">
                                            <ImageIcon className="w-6 h-6 text-gray-300" />
                                            <span className="text-[10px] text-gray-400 mt-1">Upload</span>
                                            <input type="file" className="hidden" accept="image/*" onChange={(e) => handleStepImageUpload(step.id, e)} />
                                        </label>
                                    )}
                                </div>
                          </div>
                      </div>
                  </div>
              ))}
          </div>

       </div>
    </div>
  );
};

// Helper Icon for local usage
const XIcon = ({ className }: { className?: string }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M18 6 6 18"/><path d="m6 6 18 18"/></svg>
);