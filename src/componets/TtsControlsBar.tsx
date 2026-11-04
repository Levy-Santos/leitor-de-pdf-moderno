import React from 'react';
import { 
  Play, 
  Pause, 
  SkipBack, 
  SkipForward, 
  Square, 
  Volume2, 
  Gauge 
} from 'lucide-react';
import { TtsState, ttsService } from '../services/tts';
import { ReadingSettings, THEMES } from '../types/reader';

interface TtsControlsBarProps {
  ttsState: TtsState;
  settings: ReadingSettings;
  onClose: () => void;
}

export const TtsControlsBar: React.FC<TtsControlsBarProps> = ({
  ttsState,
  settings,
  onClose,
}) => {
  if (!ttsState.isPlaying && !ttsState.isPaused) return null;

  const currentTheme = THEMES[settings.theme];

  const rates = [0.8, 1.0, 1.25, 1.5, 2.0];

  const cycleRate = () => {
    const currentIndex = rates.indexOf(ttsState.rate);
    const nextIndex = (currentIndex + 1) % rates.length;
    ttsService.setRate(rates[nextIndex]);
  };

  return (
    <div
      className="fixed bottom-20 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-md rounded-2xl shadow-2xl p-3 flex items-center justify-between gap-2 border animate-in slide-in-from-bottom-4"
      style={{
        backgroundColor: currentTheme.uiBg,
        color: currentTheme.text,
        borderColor: currentTheme.accent,
      }}
    >
      <div className="flex items-center gap-2 min-w-0">
        <div
          className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 animate-pulse"
          style={{ backgroundColor: `${currentTheme.accent}20`, color: currentTheme.accent }}
        >
          <Volume2 className="w-4 h-4" />
        </div>
        <div className="min-w-0">
          <div className="text-xs font-bold truncate">Narração em Voz Alta</div>
          <div className="text-[10px] opacity-70 truncate">
            {ttsState.isPaused ? 'Pausado' : 'Reproduzindo texto...'}
          </div>
        </div>
      </div>

      {/* Control Buttons */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          onClick={() => ttsService.prev()}
          className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 opacity-80 hover:opacity-100 transition-colors"
          title="Parágrafo anterior"
        >
          <SkipBack className="w-4 h-4" />
        </button>

        <button
          onClick={() => {
            if (ttsState.isPaused) {
              ttsService.resume();
            } else {
              ttsService.pause();
            }
          }}
          className="p-2 rounded-xl text-white shadow-md transition-transform active:scale-95"
          style={{ backgroundColor: currentTheme.accent }}
          title={ttsState.isPaused ? 'Continuar' : 'Pausar'}
        >
          {ttsState.isPaused ? <Play className="w-4 h-4 fill-current" /> : <Pause className="w-4 h-4 fill-current" />}
        </button>

        <button
          onClick={() => ttsService.next()}
          className="p-1.5 rounded-lg hover:bg-black/10 dark:hover:bg-white/10 opacity-80 hover:opacity-100 transition-colors"
          title="Próximo parágrafo"
        >
          <SkipForward className="w-4 h-4" />
        </button>

        {/* Speed toggle pill */}
        <button
          onClick={cycleRate}
          className="px-2 py-1 rounded-lg border text-xs font-mono font-bold flex items-center gap-1 hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
          style={{ borderColor: currentTheme.uiBorder }}
          title="Velocidade da narração"
        >
          <Gauge className="w-3 h-3 opacity-60" />
          <span>{ttsState.rate}x</span>
        </button>

        {/* Stop / Close button */}
        <button
          onClick={() => {
            ttsService.stop();
            onClose();
          }}
          className="p-1.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-colors"
          title="Parar narração"
        >
          <Square className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
