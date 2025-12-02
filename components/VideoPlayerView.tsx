import React, { useState, useRef, useEffect } from 'react';
import { ChevronUp, ChevronDown, X, Clock, Info, ArrowLeft, Layers, AlertCircle, ExternalLink } from 'lucide-react';
import { Exercise, ExerciseStep } from '../types';

interface VideoPlayerViewProps {
  exercise: Exercise;
  onClose: () => void;
}

// Helper to extract YouTube ID
const getYouTubeId = (url: string) => {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? match[2] : null;
};

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: any;
  }
}

export const VideoPlayerView: React.FC<VideoPlayerViewProps> = ({ exercise, onClose }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const playerRef = useRef<any>(null); // For YouTube player instance
  
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isYouTube, setIsYouTube] = useState(false);
  const [playerError, setPlayerError] = useState<boolean>(false);
  const [youtubeId, setYoutubeId] = useState<string | null>(null);

  const steps = [...exercise.steps].sort((a, b) => a.timestamp - b.timestamp);
  const activeStep = steps[currentStepIndex];

  useEffect(() => {
    const id = getYouTubeId(exercise.videoUrl);
    setPlayerError(false); // Reset error on new video

    if (id) {
      setIsYouTube(true);
      setYoutubeId(id);
      
      // Load YouTube API if not already loaded
      if (!window.YT) {
        const tag = document.createElement('script');
        tag.src = "https://www.youtube.com/iframe_api";
        const firstScriptTag = document.getElementsByTagName('script')[0];
        firstScriptTag.parentNode?.insertBefore(tag, firstScriptTag);
      }
      
      // Wait for API to be ready then init
      const initPlayer = () => {
        if (window.YT && window.YT.Player) {
          try {
            playerRef.current = new window.YT.Player('youtube-player', {
              height: '100%',
              width: '100%',
              videoId: id,
              playerVars: {
                'playsinline': 1,
                'controls': 1,
                'origin': window.location.origin, // Critical for avoiding Error 150/153
                'modestbranding': 1,
                'rel': 0
              },
              events: {
                'onReady': (event: any) => {
                  // Start a timer to poll for time
                  setInterval(() => {
                     if (playerRef.current && playerRef.current.getCurrentTime) {
                       // Only update if player is actually playing (state 1)
                       if (playerRef.current.getPlayerState() === 1) {
                         updateStepFromTime(playerRef.current.getCurrentTime());
                       }
                     }
                  }, 500);
                },
                'onError': (e: any) => {
                  console.error("YouTube Player Error:", e.data);
                  // Error 101, 150, 153 mean playback restricted
                  setPlayerError(true);
                }
              }
            });
          } catch (e) {
            console.error("Failed to init YT player", e);
          }
        } else {
           setTimeout(initPlayer, 500);
        }
      };
      
      initPlayer();

    } else {
      setIsYouTube(false);
    }
    
    // Cleanup
    return () => {
      if(playerRef.current && typeof playerRef.current.destroy === 'function') {
        // playerRef.current.destroy(); // Keeping commented out to avoid React strict mode race conditions
      }
    };
  }, [exercise.videoUrl]);


  const updateStepFromTime = (time: number) => {
    // Find the step that corresponds to the current time
    let newIndex = 0;
    for (let i = 0; i < steps.length; i++) {
      if (time >= steps[i].timestamp) {
        newIndex = i;
      } else {
        break; 
      }
    }
    setCurrentStepIndex((prev) => prev !== newIndex ? newIndex : prev);
  };

  const handleNativeTimeUpdate = () => {
    if (!videoRef.current) return;
    updateStepFromTime(videoRef.current.currentTime);
  };

  const jumpToStep = (index: number) => {
    if (index < 0 || index >= steps.length) return;
    const time = steps[index].timestamp;

    if (isYouTube && playerRef.current && playerRef.current.seekTo) {
        playerRef.current.seekTo(time, true);
        playerRef.current.playVideo();
    } else if (videoRef.current) {
      videoRef.current.currentTime = time;
      videoRef.current.play();
    }
    setCurrentStepIndex(index);
  };

  const nextStep = () => jumpToStep(currentStepIndex + 1);
  const prevStep = () => jumpToStep(currentStepIndex - 1);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col h-screen w-screen overflow-hidden animate-in fade-in duration-300">
      
      {/* Top Bar (Overlay) */}
      <div className="absolute top-0 left-0 right-0 z-20 p-4 flex justify-between items-start pointer-events-none">
        <button 
          onClick={onClose}
          className="pointer-events-auto bg-black/40 hover:bg-black/60 backdrop-blur-md text-white p-2 rounded-full transition-colors border border-white/10"
        >
          <ArrowLeft className="w-6 h-6" />
        </button>
      </div>

      {/* Video Section - Fixed Height 65% - No Overlap */}
      <div className="flex-none h-[65%] bg-black w-full flex items-center justify-center relative overflow-hidden">
        {isYouTube ? (
             playerError ? (
               <div className="flex flex-col items-center justify-center text-white p-8 text-center bg-zinc-900 w-full h-full">
                 <AlertCircle className="w-12 h-12 text-red-500 mb-4 opacity-80" />
                 <h3 className="text-xl font-bold mb-2">Video Unavailable</h3>
                 <p className="text-gray-400 text-sm mb-6 max-w-xs mx-auto">
                   This video cannot be played in the embedded player due to YouTube restrictions.
                 </p>
                 <a 
                    href={exercise.videoUrl} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-full font-bold transition-colors flex items-center gap-2 shadow-lg"
                 >
                    <ExternalLink className="w-4 h-4" />
                    Watch on YouTube
                 </a>
               </div>
             ) : (
               <div id="youtube-player" className="w-full h-full"></div>
             )
        ) : (
            <video
              ref={videoRef}
              src={exercise.videoUrl}
              className="w-full h-full object-contain"
              controls
              playsInline
              onTimeUpdate={handleNativeTimeUpdate}
            />
        )}
      </div>

      {/* Card Section - Fixed Height 35% */}
      <div className="flex-none h-[35%] bg-white w-full border-t border-gray-200 flex flex-col z-10 shadow-[0_-5px_20px_rgba(0,0,0,0.1)]">
        {activeStep ? (
          <div className="flex h-full">
            {/* Main Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-indigo-600 text-white text-xs font-bold px-2 py-1 rounded-md">
                  Step {activeStep.order}
                </span>
                <span className="text-gray-500 text-xs flex items-center gap-1 font-medium">
                  <Clock className="w-3 h-3" />
                  {new Date(activeStep.timestamp * 1000).toISOString().substr(14, 5)}
                </span>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-tight">
                {activeStep.title}
              </h2>
              
              <p className="text-gray-700 text-sm leading-relaxed mb-4">
                {activeStep.description}
              </p>

              {/* Images & Variants */}
              <div className="space-y-4">
                {activeStep.images.length > 0 && (
                   <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                     {activeStep.images.map((img, idx) => (
                       <img key={idx} src={img} alt={`Step ${idx}`} className="h-20 w-20 object-cover rounded-lg border border-gray-200 shadow-sm shrink-0" />
                     ))}
                   </div>
                )}

                {activeStep.variants.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-gray-100">
                    <h4 className="text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                      <Layers className="w-3 h-3" /> Variants
                    </h4>
                    {activeStep.variants.map((v) => (
                      <div key={v.id} className={`p-2 rounded-md border text-sm flex items-start gap-2 ${
                        v.type === 'easier' ? 'bg-green-50 border-green-100 text-green-900' : 'bg-red-50 border-red-100 text-red-900'
                      }`}>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase mt-0.5 ${
                            v.type === 'easier' ? 'bg-green-200 text-green-800' : 'bg-red-200 text-red-800'
                        }`}>{v.type}</span>
                        <span className="text-xs leading-5">{v.description}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Navigation Controls (Right Side) */}
            <div className="w-20 bg-gray-50 border-l border-gray-200 flex flex-col items-center justify-center gap-6 py-4 shrink-0 shadow-inner">
               <button 
                onClick={prevStep}
                disabled={currentStepIndex === 0}
                className="p-3 rounded-full bg-white shadow-md border border-gray-200 text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-indigo-50 transition-colors active:scale-95"
               >
                 <ChevronUp className="w-6 h-6" />
               </button>
               
               <div className="flex flex-col items-center">
                 <span className="text-lg font-bold text-gray-900">{currentStepIndex + 1}</span>
                 <span className="text-[10px] text-gray-400 font-medium uppercase">of {steps.length}</span>
               </div>

               <button 
                onClick={nextStep}
                disabled={currentStepIndex === steps.length - 1}
                className="p-3 rounded-full bg-white shadow-md border border-gray-200 text-indigo-600 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-indigo-50 transition-colors active:scale-95"
               >
                 <ChevronDown className="w-6 h-6" />
               </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-gray-400">
            <div className="text-center">
              <Info className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p>No steps defined yet.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};