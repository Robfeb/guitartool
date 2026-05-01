import { Component, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TheoryService, NOTES, CHORD_PROGRESSIONS } from '../../services/theory.service';
import { TranslationService } from '../../services/translation.service';
import * as Tone from 'tone';

@Component({
  selector: 'app-game-song',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="bg-studio-dark border border-gray-800 rounded-lg p-4 shadow-xl flex flex-col gap-4">
      <h3 class="text-white font-bold tracking-widest uppercase text-sm mb-2">{{ lang.t('PLAY_A_SONG') }}</h3>
      
      <div class="flex flex-wrap gap-4 items-end">
        <!-- Key Selection -->
        <div class="flex flex-col gap-1 w-16 sm:w-20">
          <label class="text-[10px] text-gray-500 uppercase font-bold">{{ lang.t('KEY') }}</label>
          <select [(ngModel)]="selectedKey" class="bg-gray-800 text-white rounded p-1.5 text-xs border border-gray-700 outline-none focus:border-highlight">
            <option *ngFor="let note of notes" [value]="note">{{ lang.t(note) }}</option>
          </select>
        </div>

        <!-- Progression Selection -->
        <div class="flex flex-col gap-1 w-40 sm:w-48">
          <label class="text-[10px] text-gray-500 uppercase font-bold">{{ lang.t('SONGWRITING') }}</label>
          <select [(ngModel)]="selectedStyle" class="bg-gray-800 text-white rounded p-1.5 text-xs border border-gray-700 outline-none focus:border-highlight">
            <option *ngFor="let style of progressionKeys" [value]="style">{{ style }}</option>
          </select>
        </div>

        <!-- Difficulty -->
        <div class="flex flex-col gap-1 w-24">
          <label class="text-[10px] text-gray-500 uppercase font-bold">{{ lang.t('DIFFICULTY') }}</label>
          <select [(ngModel)]="difficulty" class="bg-gray-800 text-white rounded p-1.5 text-xs border border-gray-700 outline-none focus:border-highlight">
            <option value="easy">{{ lang.t('EASY') }}</option>
            <option value="hard">{{ lang.t('HARD') }}</option>
          </select>
        </div>

        <!-- Chords Length -->
        <div class="flex flex-col gap-1 w-24">
          <label class="text-[10px] text-gray-500 uppercase font-bold">Length</label>
          <select [(ngModel)]="numberOfChords" class="bg-gray-800 text-white rounded p-1.5 text-xs border border-gray-700 outline-none focus:border-highlight">
            <option *ngFor="let n of [3, 4, 5, 6, 7, 8]" [value]="n">{{ n }}</option>
          </select>
        </div>

        <!-- Shape Selection (for Hard mode) -->
        <div class="flex flex-col gap-1 w-24">
          <label class="text-[10px] text-gray-500 uppercase font-bold">Shape</label>
          <select [(ngModel)]="selectedShape" class="bg-gray-800 text-white rounded p-1.5 text-xs border border-gray-700 outline-none focus:border-highlight">
            <option value="Random">Random</option>
            <option *ngFor="let s of ['E', 'A', 'G', 'D', 'C']" [value]="s">{{ s }}</option>
          </select>
        </div>

        <!-- Tempo -->
        <div class="flex flex-col gap-1 flex-grow md:flex-grow-0 md:w-32 min-w-[100px]">
          <label class="text-[10px] text-gray-500 uppercase font-bold">{{ lang.t('TEMPO') }}</label>
          <div class="flex items-center gap-2">
            <input type="range" min="60" max="200" [(ngModel)]="tempo" class="w-full accent-highlight">
            <span class="text-xs text-white w-8 text-right font-mono">{{ tempo }}</span>
          </div>
        </div>
      </div>

      <!-- Active Chord Display & Controls -->
      <div class="flex items-center justify-between bg-studio-darker border border-gray-800 rounded-lg p-4 mt-2">
        <div class="flex items-center gap-4">
          <button (click)="togglePlay()" 
            class="w-12 h-12 rounded-full flex items-center justify-center font-bold transition-all shadow-[0_0_15px_rgba(0,0,0,0.5)]"
            [ngClass]="isPlaying() ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-900/50' : 'bg-highlight hover:bg-blue-400 text-white shadow-blue-900/50'">
            <span class="text-xl leading-none" [class.ml-1]="!isPlaying()">
              {{ isPlaying() ? '■' : '▶' }}
            </span>
          </button>
          
          <div class="flex flex-col" *ngIf="isPlaying()">
            <span class="text-[10px] text-highlight font-bold uppercase tracking-widest animate-pulse">Now Playing</span>
            <div class="flex items-baseline gap-2">
              <span class="text-2xl font-black text-white font-mono">{{ lang.t(currentActiveChord().note) }}{{ currentActiveChord().quality }}</span>
              <span class="text-xs font-bold text-gray-500 uppercase tracking-tighter" *ngIf="currentShapeName()">({{ currentShapeName() }}-Shape)</span>
            </div>
          </div>
          <div class="flex flex-col" *ngIf="!isPlaying()">
            <span class="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Status</span>
            <span class="text-lg font-black text-gray-400 font-mono">Ready to play</span>
          </div>
        </div>
        
        <!-- Next Chords Preview -->
        <div class="hidden md:flex gap-2 opacity-50" *ngIf="isPlaying()">
           <span *ngFor="let chord of upcomingChords()" class="text-sm font-mono text-gray-500 border border-gray-700 bg-studio-darker px-2 py-1 rounded">
             {{ lang.t(chord.note) }}{{ chord.quality }}
           </span>
        </div>
      </div>

      <!-- Progression Overview -->
      <div class="flex flex-wrap gap-2 items-center justify-center mt-2 p-2 bg-studio-darker rounded border border-gray-800">
         <ng-container *ngFor="let degree of resolvedSequence(); let i = index; let last = last">
            <button (click)="previewChord(degree)"
               class="text-xs font-mono font-bold transition-colors cursor-pointer hover:text-white"
               [ngClass]="isPlaying() && currentChordIndex() === i ? 'text-highlight scale-110' : 'text-gray-500'">
               {{ lang.t(degree.note) }}{{ degree.quality }} ({{ degree.roman }})
            </button>
            <span *ngIf="!last" class="text-gray-700 text-xs">-</span>
         </ng-container>
      </div>
    </div>
  `
})
export class GameSongComponent implements OnDestroy {
  theory = inject(TheoryService);
  lang = inject(TranslationService);

  notes = NOTES;
  progressionKeys = Object.keys(CHORD_PROGRESSIONS);
  
  selectedKey = 'C';
  selectedStyle = 'Pop Anthem';
  difficulty: 'easy' | 'hard' = 'easy';
  tempo = 90;
  numberOfChords = 4;
  selectedShape: 'Random' | 'E' | 'A' | 'G' | 'D' | 'C' = 'Random';
  
  isPlaying = signal(false);
  currentChordIndex = signal(0);
  
  private sessionVoicingIndex = 0;
  private intervalId: any;

  get resolvedSequence() {
     const formula = CHORD_PROGRESSIONS[this.selectedStyle]?.formula || '';
      return () => {
         const scaleName = this.theory.selectedType() === 'Scale' ? this.theory.selectedName() : 'Major';
         const baseSeq = this.theory.resolveProgressionChords(this.selectedKey, formula, scaleName);
         if (!baseSeq || baseSeq.length === 0) return [];
        
        const finalSeq = [];
        for (let i = 0; i < this.numberOfChords; i++) {
           finalSeq.push(baseSeq[i % baseSeq.length]);
        }
        return finalSeq;
     };
  }

  get currentActiveChord() {
     return () => {
       const seq = this.resolvedSequence();
       if (!seq || seq.length === 0) return { note: '', quality: '', chordName: '' };
       return seq[this.currentChordIndex() % seq.length];
     };
  }

  get upcomingChords() {
      return () => {
         const seq = this.resolvedSequence();
         if (!seq || seq.length === 0) return [];
         const next1 = seq[(this.currentChordIndex() + 1) % seq.length];
         const next2 = seq[(this.currentChordIndex() + 2) % seq.length];
         return [next1, next2];
      };
  }

  currentShapeName(): string | null {
    if (!this.isPlaying()) return null;
    return this.theory.currentCagedShape();
  }

  async togglePlay() {
    if (Tone.context.state !== 'running') await Tone.start();
    if (this.isPlaying()) {
      this.stop();
    } else {
      this.play();
    }
  }

  play() {
    this.isPlaying.set(true);
    this.currentChordIndex.set(0);
    
    // Determine the voicing index for this session
    this.initSessionVoicing();
    
    this.applyCurrentChord();

    // Trigger Metronome
    this.theory.metronomeTempo.set(this.tempo);
    this.theory.metronomeIsPlaying.set(true);

    // Calculate ms per chord based on tempo (assuming 4 beats per chord)
    // ms per beat = 60000 / tempo.
    // ms per chord = ms per beat * 4
    const msPerChord = (60000 / this.tempo) * 4;

    this.intervalId = setInterval(() => {
      const seq = this.resolvedSequence();
      this.currentChordIndex.set((this.currentChordIndex() + 1) % seq.length);
      this.applyCurrentChord();
    }, msPerChord);
  }

  stop() {
    this.isPlaying.set(false);
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    // Stop Metronome
    this.theory.metronomeIsPlaying.set(false);
    
    // Clear preview so it returns to main selection
    this.theory.previewRoot.set(null);
    this.theory.previewChordName.set(null);
    this.theory.previewType.set(null);
    this.theory.showFingers.set(true);
  }

  private initSessionVoicing() {
    if (this.difficulty === 'easy') {
      this.sessionVoicingIndex = 0;
      return;
    }

    // Set preview root/name temporarily to generate voicings count
    const firstChord = this.currentActiveChord();
    this.theory.previewRoot.set(firstChord.note);
    this.theory.previewChordName.set(firstChord.chordName);
    
    const voicings = this.theory.generatedVoicings();
    
    if (this.selectedShape === 'Random') {
      if (voicings.length > 1) {
        this.sessionVoicingIndex = Math.floor(Math.random() * (voicings.length - 1)) + 1;
      } else {
        this.sessionVoicingIndex = 0;
      }
    } else {
      // Find the index that matches the selected shape
      const targetShapeName = `${this.selectedShape}-Shape`;
      const idx = voicings.findIndex(v => {
         // This is a bit tricky because Voicing doesn't have the name.
         // But we can check TheoryService.STANDARD_SHAPES
         const shapes = this.theory.getShapesForChord(firstChord.chordName);
         // Find which index in STANDARD_SHAPES matches our target
         const shapeIdx = shapes.findIndex(s => s.name === targetShapeName);
         // We'll assume the generated voicings preserve some order or we just pick one.
         return shapeIdx !== -1;
      });
      
      // Simpler way: search through the shapes and find the index
      const shapes = this.theory.getShapesForChord(firstChord.chordName);
      const foundIdx = shapes.findIndex(s => s.name === targetShapeName);
      this.sessionVoicingIndex = foundIdx !== -1 ? foundIdx : 0;
    }
  }

  applyCurrentChord() {
    const chord = this.currentActiveChord();
    this.theory.previewRoot.set(chord.note);
    this.theory.previewChordName.set(chord.chordName);
    this.theory.previewType.set('Chord');

    if (this.difficulty === 'hard') {
      this.theory.showFingers.set(false);
      this.theory.selectedVoicingIndex.set(this.sessionVoicingIndex);
    } else {
      this.theory.selectedVoicingIndex.set(0);
      this.theory.showFingers.set(true);
    }
  }

  previewChord(degree: any) {
    if (this.isPlaying()) return;
    this.theory.previewRoot.set(degree.note);
    this.theory.previewChordName.set(degree.chordName);
    this.theory.previewType.set('Chord');
    this.theory.selectedVoicingIndex.set(0);
  }

  ngOnDestroy() {
    this.stop();
  }
}
