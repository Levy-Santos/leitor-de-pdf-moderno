export interface TtsState {
  isPlaying: boolean;
  isPaused: boolean;
  currentBlockId: string | null;
  rate: number;
  availableVoices: SpeechSynthesisVoice[];
  selectedVoice: SpeechSynthesisVoice | null;
}

export type TtsListener = (state: TtsState) => void;

class TtsService {
  private synth: SpeechSynthesis | null = null;
  private currentUtterance: SpeechSynthesisUtterance | null = null;
  private listeners: Set<TtsListener> = new Set();
  private state: TtsState = {
    isPlaying: false,
    isPaused: false,
    currentBlockId: null,
    rate: 1.0,
    availableVoices: [],
    selectedVoice: null,
  };

  private queue: { id: string; text: string }[] = [];
  private queueIndex = 0;

  constructor() {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      this.synth = window.speechSynthesis;
      this.loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this.loadVoices();
      }
    }
  }

  private loadVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    this.state.availableVoices = voices;

    // Pick best Portuguese voice by default
    const ptVoice =
      voices.find((v) => v.lang.startsWith('pt-BR') || v.lang.startsWith('pt')) ||
      voices.find((v) => v.default) ||
      voices[0] ||
      null;

    this.state.selectedVoice = ptVoice;
    this.notify();
  }

  public subscribe(listener: TtsListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private notify() {
    for (const listener of this.listeners) {
      listener({ ...this.state });
    }
  }

  public setRate(rate: number) {
    this.state.rate = rate;
    this.notify();
    if (this.state.isPlaying && !this.state.isPaused) {
      // Restart current with new rate
      const current = this.queue[this.queueIndex];
      if (current) {
        this.speakBlock(current.id, current.text);
      }
    }
  }

  public setVoice(voiceUri: string) {
    const voice = this.state.availableVoices.find((v) => v.voiceURI === voiceUri) || null;
    this.state.selectedVoice = voice;
    this.notify();
  }

  public playQueue(items: { id: string; text: string }[], startIndex = 0) {
    if (!this.synth) return;
    this.stop();
    this.queue = items;
    this.queueIndex = Math.max(0, Math.min(startIndex, items.length - 1));

    if (this.queue.length > 0 && this.queue[this.queueIndex]) {
      const item = this.queue[this.queueIndex];
      this.speakBlock(item.id, item.text);
    }
  }

  private speakBlock(id: string, text: string) {
    if (!this.synth) return;
    this.synth.cancel();

    this.state.isPlaying = true;
    this.state.isPaused = false;
    this.state.currentBlockId = id;
    this.notify();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = this.state.rate;
    if (this.state.selectedVoice) {
      utterance.voice = this.state.selectedVoice;
    }

    utterance.onend = () => {
      // Advance to next paragraph
      this.queueIndex++;
      if (this.queueIndex < this.queue.length && this.state.isPlaying) {
        const next = this.queue[this.queueIndex];
        this.speakBlock(next.id, next.text);
      } else {
        this.stop();
      }
    };

    utterance.onerror = (e) => {
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        console.warn('SpeechSynthesis error:', e);
      }
      this.stop();
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
  }

  public pause() {
    if (!this.synth) return;
    this.synth.pause();
    this.state.isPaused = true;
    this.notify();
  }

  public resume() {
    if (!this.synth) return;
    this.synth.resume();
    this.state.isPaused = false;
    this.notify();
  }

  public stop() {
    if (!this.synth) return;
    this.synth.cancel();
    this.state.isPlaying = false;
    this.state.isPaused = false;
    this.state.currentBlockId = null;
    this.notify();
  }

  public next() {
    if (this.queueIndex + 1 < this.queue.length) {
      this.queueIndex++;
      const next = this.queue[this.queueIndex];
      this.speakBlock(next.id, next.text);
    } else {
      this.stop();
    }
  }

  public prev() {
    if (this.queueIndex > 0) {
      this.queueIndex--;
      const prev = this.queue[this.queueIndex];
      this.speakBlock(prev.id, prev.text);
    }
  }
}

export const ttsService = new TtsService();
