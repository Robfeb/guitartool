import { Component, inject, signal, effect, OnDestroy, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TheoryService } from '../../services/theory.service';
import * as Tone from 'tone';

interface DrumPattern {
  k: number[]; // Kick steps (0-15)
  s: number[]; // Snare steps (0-15)
  h: number[]; // Hi-hat steps (0-15)
}

@Component({
  selector: 'app-metronome',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-studio-dark border border-gray-800 rounded-lg p-5 shadow-xl flex flex-wrap items-stretch gap-6 animate-in fade-in slide-in-from-top duration-300">
      
      <!-- Play/Mixer Column -->
      <div class="flex flex-col items-center justify-between gap-4 border-r border-gray-800 pr-6">
        <button (click)="togglePlay()"
                class="w-14 h-14 rounded-full flex items-center justify-center transition-all transform hover:scale-105 active:scale-95 shadow-lg border-4 border-studio-darker"
                [ngClass]="theory.metronomeIsPlaying() ? 'bg-red-500 hover:bg-red-400 text-white' : 'bg-highlight hover:bg-blue-400 text-white'">
          <svg *ngIf="!theory.metronomeIsPlaying()" class="w-6 h-6 ml-1" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z"></path></svg>
          <svg *ngIf="theory.metronomeIsPlaying()" class="w-6 h-6" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4h12v12H4z"></path></svg>
        </button>

        <!-- Mixer -->
        <div class="flex gap-4 h-24 items-end pb-2">
           <div class="flex flex-col items-center gap-1">
             <input type="range" orient="vertical" min="0" max="1" step="0.01" 
                    [ngModel]="theory.metronomeVolume()" (ngModelChange)="theory.metronomeVolume.set($event)"
                    class="h-16 w-1 accent-highlight appearance-none bg-gray-700 rounded-full cursor-pointer vertical-range">
             <span class="text-[8px] text-gray-500 font-bold tracking-tighter uppercase">Click</span>
           </div>
           <div class="flex flex-col items-center gap-1">
             <input type="range" orient="vertical" min="0" max="1" step="0.01" 
                    [ngModel]="theory.drumsVolume()" (ngModelChange)="theory.drumsVolume.set($event)"
                    class="h-16 w-1 accent-red-500 appearance-none bg-gray-700 rounded-full cursor-pointer vertical-range">
             <span class="text-[8px] text-gray-500 font-bold tracking-tighter uppercase">Drums</span>
           </div>
        </div>
      </div>

      <!-- Tempo & Click Controls -->
      <div class="flex flex-col gap-4">
        <div class="flex items-end gap-6">
           <div class="flex flex-col gap-1">
             <label class="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Tempo (BPM)</label>
             <div class="flex items-center gap-2">
               <button (click)="adjustTempo(-1)" class="w-8 h-8 rounded bg-gray-800 text-white hover:bg-gray-700 flex items-center justify-center font-bold shadow-sm transition active:scale-90">-</button>
               <input type="number" [ngModel]="theory.metronomeTempo()" (ngModelChange)="updateTempo($event)" min="10" max="240"
                      class="bg-fretboard border border-gray-700 text-white text-sm font-bold px-3 py-1.5 w-20 rounded focus:ring-2 focus:ring-highlight outline-none text-center">
               <button (click)="adjustTempo(1)" class="w-8 h-8 rounded bg-gray-800 text-white hover:bg-gray-700 flex items-center justify-center font-bold shadow-sm transition active:scale-90">+</button>
             </div>
           </div>

           <div class="flex flex-col gap-1">
             <label class="text-[10px] text-gray-500 uppercase tracking-widest font-bold text-center">Presets</label>
             <div class="flex gap-1">
               <button *ngFor="let p of [60, 80, 100, 120]" (click)="updateTempo(p)"
                       class="w-10 h-8 rounded bg-gray-800 text-[10px] font-bold transition-all border border-transparent"
                       [ngClass]="theory.metronomeTempo() === p ? 'border-highlight text-highlight' : 'text-gray-400 hover:text-white'">
                 {{ p }}
               </button>
             </div>
           </div>
        </div>

        <!-- Click Toggle & Accent -->
        <div class="flex items-center gap-4 bg-studio-darker/50 p-2 rounded-lg border border-gray-800">
           <label class="flex items-center gap-2 cursor-pointer group">
             <input type="checkbox" [ngModel]="theory.metronomeClickEnabled()" (ngModelChange)="theory.metronomeClickEnabled.set($event)"
                    class="accent-highlight w-4 h-4 rounded">
             <span class="text-[10px] font-bold text-gray-400 group-hover:text-white uppercase tracking-wider">Metronome Click</span>
           </label>
           <div class="w-px h-4 bg-gray-800 mx-2"></div>
           <label class="flex items-center gap-2 cursor-pointer group">
             <input type="checkbox" [ngModel]="theory.metronomeHasAccent()" (ngModelChange)="theory.metronomeHasAccent.set($event)"
                    class="accent-red-500 w-4 h-4 rounded">
             <span class="text-[10px] font-bold text-gray-400 group-hover:text-white uppercase tracking-wider">Accent Loop</span>
           </label>
        </div>
      </div>

      <!-- Rhythm Styles -->
      <div class="flex flex-col gap-1 border-l border-gray-800 pl-6">
        <label class="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Drum Rhythm</label>
        <div class="grid grid-cols-4 gap-1.5">
          <button *ngFor="let style of drumStyles"
                  (click)="theory.selectedDrumStyle.set(style)"
                  class="px-2 py-2 rounded text-[10px] font-black transition-all border border-transparent text-center"
                  [ngClass]="theory.selectedDrumStyle() === style 
                    ? 'bg-red-500 text-white shadow-lg scale-105' 
                    : 'bg-gray-800 text-gray-500 hover:text-white hover:bg-gray-700'">
            {{ style }}
          </button>
        </div>
      </div>

      <!-- Visual Indicator -->
      <div class="flex-grow flex flex-col justify-center gap-4 border-l border-gray-800 pl-6 min-w-[150px]">
        <div class="flex items-center gap-3">
          <div *ngFor="let i of beatArray(); let idx = index"
               class="w-4 h-4 rounded-full transition-all duration-75"
               [ngClass]="{
                 'bg-highlight shadow-[0_0_15px_rgba(59,130,246,1)] scale-125': currentBeat() === idx + 1,
                 'bg-red-500': currentBeat() === idx + 1 && idx === 0 && theory.metronomeHasAccent(),
                 'bg-gray-800': currentBeat() !== idx + 1,
                 'ring-1 ring-gray-700': idx === 0 && theory.metronomeHasAccent()
               }">
          </div>
        </div>
        
        <div class="flex flex-col gap-1">
           <div class="flex justify-between items-center pr-2">
             <span class="text-[9px] text-gray-500 uppercase font-black tracking-widest">Time Signature</span>
             <span class="text-[10px] font-mono text-highlight">{{ currentBeat() }} / {{ theory.metronomeBeats() }}</span>
           </div>
           <div class="flex gap-1">
             <button *ngFor="let b of [2, 3, 4, 6]" (click)="theory.metronomeBeats.set(b)"
                     class="flex-1 h-6 rounded text-[9px] font-bold"
                     [ngClass]="theory.metronomeBeats() === b ? 'bg-highlight text-white' : 'bg-studio-darker text-gray-600'">
               {{ b }}
             </button>
           </div>
        </div>
      </div>

    </div>
  `,
  styles: [`
    .vertical-range {
      writing-mode: bt-lr; /* IE */
      -webkit-appearance: slider-vertical; /* WebKit */
      width: 12px;
    }
  `]
})
export class MetronomeComponent implements OnDestroy {
  theory = inject(TheoryService);
  
  currentBeat = signal(0);
  currentStep = 0; // 0-15 for drum sequencer

  drumStyles = ['None', 'Rock', 'Pop', 'Blues', 'Ballad', 'Hard Rock', 'Reggae', 'Heavy'];

  private patterns: Record<string, DrumPattern> = {
    'Rock': { k: [0, 8, 10], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14] },
    'Pop': { k: [0, 2, 4, 6, 8, 10, 12, 14], s: [4, 12], h: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] },
    'Blues': { k: [0, 6, 12], s: [4, 10], h: [0, 2, 4, 6, 8, 10, 12, 14] }, // Shuffle feel simulated
    'Ballad': { k: [0, 11], s: [4, 12], h: [0, 4, 8, 12] },
    'Hard Rock': { k: [0, 2, 3, 8], s: [4, 12], h: [0, 2, 4, 6, 8, 10, 12, 14] },
    'Reggae': { k: [8], s: [8], h: [0, 2, 4, 6, 8, 10, 12, 14] }, // One drop
    'Heavy': { k: [0, 2, 4, 6, 8, 10, 12, 14], s: [4, 12], h: [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15] }
  };

  private loop: Tone.Loop | null = null;
  
  // Instruments
  private clickHigh: Tone.MembraneSynth;
  private clickLow: Tone.MembraneSynth;
  private drumKick: Tone.MembraneSynth;
  private drumSnare: Tone.NoiseSynth;
  private drumHiHat: Tone.NoiseSynth;

  constructor() {
    this.clickHigh = new Tone.MembraneSynth({ pitchDecay: 0.05, octaves: 4, envelope: { attack: 0.001, decay: 0.2, sustain: 0 } }).toDestination();
    this.clickLow = new Tone.MembraneSynth({ pitchDecay: 0.05, octaves: 2, envelope: { attack: 0.001, decay: 0.1, sustain: 0 } }).toDestination();
    
    this.drumKick = new Tone.MembraneSynth({ envelope: { attack: 0.001, decay: 0.2, sustain: 0 } }).toDestination();
    
    const snareFilter = new Tone.Filter(2000, 'bandpass').toDestination();
    this.drumSnare = new Tone.NoiseSynth({ envelope: { attack: 0.001, decay: 0.1, sustain: 0 } }).connect(snareFilter);
    
    const hatFilter = new Tone.Filter(8000, 'highpass').toDestination();
    this.drumHiHat = new Tone.NoiseSynth({ envelope: { attack: 0.001, decay: 0.05, sustain: 0 } }).connect(hatFilter);

    // Initial volumes
    this.updateVolumes();

    // Sync Playback state with global signal
    effect(() => {
      const isPlaying = this.theory.metronomeIsPlaying();
      isPlaying ? this.start() : this.stop();
    });

    // Sync BPM
    effect(() => {
      Tone.Transport.bpm.value = this.theory.metronomeTempo();
    });

    // Sync Volumes
    effect(() => {
      this.updateVolumes();
    });
  }

  updateVolumes() {
    const clickVol = Tone.gainToDb(this.theory.metronomeVolume());
    const drumVol = Tone.gainToDb(this.theory.drumsVolume());
    
    this.clickHigh.volume.value = clickVol - 10;
    this.clickLow.volume.value = clickVol - 15;
    
    this.drumKick.volume.value = drumVol - 5;
    this.drumSnare.volume.value = drumVol - 10;
    this.drumHiHat.volume.value = drumVol - 20;
  }

  beatArray = computed(() => Array(this.theory.metronomeBeats()).fill(0));

  async togglePlay() {
    if (Tone.context.state !== 'running') await Tone.start();
    this.theory.metronomeIsPlaying.set(!this.theory.metronomeIsPlaying());
  }

  private start() {
    this.currentBeat.set(0);
    this.currentStep = 0;

    // 16th note sequencer
    this.loop = new Tone.Loop((time) => {
      const beats = this.theory.metronomeBeats();
      const style = this.theory.selectedDrumStyle();
      const pattern = this.patterns[style];

      // Metronome Click (on the 4 quarter notes of the 16 steps)
      if (this.currentStep % 4 === 0) {
        this.currentBeat.update(b => (b % beats) + 1);
        if (this.theory.metronomeClickEnabled()) {
          const isAccent = this.currentBeat() === 1 && this.theory.metronomeHasAccent();
          isAccent ? this.clickHigh.triggerAttackRelease('C4', '32n', time) : this.clickLow.triggerAttackRelease('G2', '32n', time);
        }
      }

      // Drum Logic
      if (pattern) {
        if (pattern.k.includes(this.currentStep)) this.drumKick.triggerAttackRelease('A1', '16n', time);
        if (pattern.s.includes(this.currentStep)) this.drumSnare.triggerAttack(time);
        if (pattern.h.includes(this.currentStep)) this.drumHiHat.triggerAttack(time);
      }

      this.currentStep = (this.currentStep + 1) % 16;
    }, '16n').start(0);

    Tone.Transport.start();
  }

  private stop() {
    this.currentBeat.set(0);
    this.loop?.stop();
    this.loop?.dispose();
    this.loop = null;
    Tone.Transport.stop();
  }

  adjustTempo(delta: number) { this.updateTempo(this.theory.metronomeTempo() + delta); }
  updateTempo(val: any) {
    let num = Number(val);
    if (isNaN(num)) return;
    this.theory.metronomeTempo.set(Math.max(10, Math.min(240, num)));
  }

  ngOnDestroy() { this.stop(); [this.clickHigh, this.clickLow, this.drumKick, this.drumSnare, this.drumHiHat].forEach(i => i.dispose()); }
}
