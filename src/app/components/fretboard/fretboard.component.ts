import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TheoryService, FretNote, TUNINGS, CHORDS, SCALES, STANDARD_SHAPES } from '../../services/theory.service';
import * as Tone from 'tone';

@Component({
  selector: 'app-fretboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="overflow-x-auto w-full py-2">
      <!-- Embedded Fretboard Header -->
      <div class="flex flex-wrap items-end justify-between mb-6 pl-12 gap-4">
        
        <!-- Left: Title -->
        <div class="flex items-center gap-4">
           <h2 class="text-xl font-black text-string tracking-widest">FRETBOARD</h2>
           
           <!-- Strum Button directly next to title -->
           <button *ngIf="theory.selectedType() === 'Chord'" 
                  (click)="strumChord()" 
                  class="bg-highlight hover:bg-blue-400 text-white w-10 h-10 rounded-full shadow-lg transition transform hover:scale-110 flex items-center justify-center border-4 border-studio-darker"
                  title="Strum Chord">
             <svg class="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z"></path></svg>
           </button>

            <!-- Active Key -->
           <div class="flex flex-col leading-none text-right border-l border-gray-700 pl-4">
             <span class="text-[10px] text-gray-500 uppercase tracking-widest">Active Key</span>
             <span class="text-base font-black text-white">{{ theory.selectedRoot() }} <span class="text-highlight">{{ theory.selectedName() }}</span></span>
           </div>
        </div>

        <!-- Right: Fretboard specific controls -->
        <div class="flex items-center gap-6">
           
           <!-- Voicing Control (Only if Chord) -->
           <div class="flex items-center gap-3" *ngIf="theory.selectedType() === 'Chord'">
             <label class="text-xs text-string font-bold uppercase tracking-wider">Voicing Pattern</label>
             <button class="bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded text-white text-sm" (click)="rotateVoicing(-1)">Prev</button>
             <span class="text-white text-sm font-bold w-8 text-center">{{ theory.selectedVoicingIndex() + 1 }} / {{ theory.generatedVoicings().length }}</span>
             <button class="bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded text-white text-sm" (click)="rotateVoicing(1)">Next</button>
             <!-- CAGED shape badge -->
             <span *ngIf="currentCagedShape()"
                   class="text-xs font-black px-2 py-0.5 rounded-full border border-green-600 text-green-400">
               {{ currentCagedShape() }}-Shape
             </span>
           </div>

           <!-- Show Finger Numbers (Only if Chord) -->
           <label *ngIf="theory.selectedType() === 'Chord'"
                  class="flex items-center gap-2 cursor-pointer text-xs font-bold text-string hover:text-white transition group">
             <input type="checkbox"
                    [ngModel]="theory.showFingers()"
                    (ngModelChange)="theory.showFingers.set($event)"
                    class="accent-highlight w-4 h-4 rounded">
             <span>Fingers</span>
           </label>

           <!-- Learning Mode -->
           <label class="flex items-center gap-2 cursor-pointer text-xs font-bold text-string hover:text-white transition group">
             <input type="checkbox"
                    [ngModel]="theory.learningMode()"
                    (ngModelChange)="theory.learningMode.set($event)"
                    class="accent-highlight w-4 h-4 rounded">
             <span>Notes</span>
           </label>

          
           
           <!-- Tuning Header Dropdown -->
           <div class="flex items-center gap-2">
             <label class="text-xs text-string font-bold uppercase tracking-wider">Tuning</label>
             <select 
               [ngModel]="theory.selectedTuning()"
               (ngModelChange)="theory.selectedTuning.set($event)"
               class="bg-fretboard border border-gray-700 text-white text-sm rounded focus:ring-highlight focus:border-highlight block w-32 p-1.5">
               <option *ngFor="let tuning of tunings" [value]="tuning">{{ tuning }}</option>
             </select>
           </div>

        </div>
      </div>

      <!-- Chord / Scale Name Button Row -->
      <div class="flex flex-wrap gap-2 pl-12 mb-4">
        <span class="text-xs text-string font-bold uppercase tracking-wider self-center mr-2">{{ theory.selectedType() }}:</span>
        <button 
          *ngFor="let name of currentOptions()"
          (click)="selectName(name)"
          class="px-3 py-1.5 rounded-full text-xs font-bold transition-all border"
          [ngClass]="theory.selectedName() === name
            ? 'bg-highlight text-white border-highlight shadow-lg scale-105'
            : 'bg-fretboard text-string border-gray-700 hover:border-highlight hover:text-white'"
        >
          {{ name }}
        </button>
      </div>

      <!-- Scrollable fretboard area -->
      <div class="min-w-[800px] flex flex-col gap-1 select-none mt-2">
        <!-- Fret Numbers -->
        <div class="flex text-xs text-string mb-2 font-bold ml-12">
          <div *ngFor="let fret of fretNumbers" class="flex-1 text-center font-mono">
            {{ fret === 0 ? 'Open' : fret }}
          </div>
        </div>
        
        <!-- Fretboard Grid -->
        <div class="relative bg-fretboard border-4 border-studio-darker rounded shadow-2xl pb-4 pt-4">

          <!-- Strings -->
          <div *ngFor="let stringNotes of fretboard(); let i = index" 
               class="flex relative items-center mb-1 group">
               
            <!-- Tuning Label -->
            <div class="w-12 flex min-w-[3rem] items-center justify-center font-bold text-lg text-gray-600 bg-studio-darker/50 border-y border-transparent">
              {{ stringNotes[0].note }}
            </div>
               
            <!-- The actual visual string line -->
            <div class="absolute left-12 right-0 h-0.5 bg-string opacity-50 z-0 shadow-sm transition group-hover:bg-white group-hover:opacity-100" 
                 [style.height.px]="(6-i)*0.8 + 1"></div>
                 
            <div *ngFor="let note of stringNotes; let f = index" 
                 class="flex-1 flex justify-center z-10 border-r border-fret border-opacity-20 py-2 relative"
                 [ngClass]="{'border-l-4 border-l-black': f === 1}">
                 
              <!-- Marker for specific frets (3, 5, 7, 9, 12, etc.) between strings. We just render them as background dots conditionally -->
              <div *ngIf="f === Math.floor(f) && (i === 2 || i === 4) && [3,5,7,9,15,17,19,21].includes(f) && i===2" 
                   class="absolute pointer-events-none w-4 h-4 rounded-full bg-string bg-opacity-20 shadow-inner" style="top: 150%;"></div>
              <div *ngIf="f === 12 && (i === 1 || i === 4)" 
                   class="absolute pointer-events-none w-4 h-4 rounded-full bg-string bg-opacity-20 shadow-inner" style="top: 150%;"></div>
                 
              <!-- Interactive Note Circle -->
              <button 
                class="w-10 h-10 rounded-full flex items-center justify-center text-xs font-bold transition-all shadow-md active:scale-90"
                [ngClass]="{
                  'bg-root text-white scale-110 shadow-root/50 z-20 ring-2 ring-white': note.interval === 0,
                  'bg-highlight text-white': note.interval !== null && note.interval !== 0,
                  'bg-studio-darker text-gray-500 opacity-30 hover:opacity-100': note.interval === null
                }"
                (click)="playNote(note)">
                <!-- Finger Mode -->
                <span *ngIf="theory.showFingers() && note.finger" class="text-[14px]">
                  {{ note.finger }}
                </span>
                
                <!-- Normal Mode -->
                <ng-container *ngIf="!theory.showFingers() || !note.finger">
                  <span *ngIf="learningMode()" class="text-[10px]">
                    {{ note.note }}
                  </span>
                  <span *ngIf="!learningMode() && note.interval !== null">
                    {{ getIntervalName(note.interval) }}
                  </span>
                  <span *ngIf="!learningMode() && note.interval === null">
                    {{ note.note }}
                  </span>
                </ng-container>
              </button>
            </div>
          </div>
        </div>
      </div><!-- /min-w scrollable -->
    </div><!-- /overflow-x-auto -->
  `
})
export class FretboardComponent {
  theory = inject(TheoryService);
  Math = Math;

  learningMode = this.theory.learningMode;
  fretboard = this.theory.visibleFretboard;

  // Just an array for the header [0, 1, 2, ..., 22]
  fretNumbers = Array.from({ length: 23 }, (_, i) => i);

  synth: Tone.PolySynth | null = null;

  get tunings() {
    return Object.keys(TUNINGS);
  }

  currentOptions(): string[] {
    return this.theory.selectedType() === 'Scale'
      ? Object.keys(SCALES)
      : Object.keys(CHORDS);
  }

  selectName(name: string) {
    this.theory.selectedName.set(name);
    this.theory.selectedVoicingIndex.set(0);
  }

  rotateVoicing(dir: number) {
    const len = this.theory.generatedVoicings().length;
    if (len === 0) return;
    let next = this.theory.selectedVoicingIndex() + dir;
    if (next >= len) next = 0;
    if (next < 0) next = len - 1;
    this.theory.selectedVoicingIndex.set(next);
  }

  currentCagedShape(): string | null {
    const chordName = this.theory.effectiveChordName();
    const shapes = STANDARD_SHAPES[chordName] || [];
    const idx = this.theory.selectedVoicingIndex();
    const shape = shapes[idx];
    if (!shape) return null;
    if (shape.name.includes('E-Shape')) return 'E';
    if (shape.name.includes('A-Shape')) return 'A';
    if (shape.name.includes('G-Shape')) return 'G';
    if (shape.name.includes('D-Shape')) return 'D';
    if (shape.name.includes('C-Shape')) return 'C';
    return null;
  }

  async playNote(note: FretNote) {
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }
    if (!this.synth) {
      this.synth = new Tone.PolySynth(Tone.Synth).toDestination();
    }
    const freq = this.theory.getFrequency(note.note, note.octave);
    this.synth.triggerAttackRelease(freq, '8n');
  }

  async strumChord() {
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }
    if (!this.synth) {
      this.synth = new Tone.PolySynth(Tone.Synth).toDestination();
    }

    const notesToPlay: string[] = [];
    const board = this.fretboard();
    // strum thickest string (high index) to thinnest (low index)
    for (let i = board.length - 1; i >= 0; i--) {
      const stringNotes = board[i];
      for (const note of stringNotes) {
        if (note.interval !== null) {
          notesToPlay.push(this.theory.getFrequency(note.note, note.octave));
        }
      }
    }

    if (notesToPlay.length > 0) {
      const now = Tone.now();
      notesToPlay.forEach((freq, idx) => {
        this.synth!.triggerAttackRelease(freq, '2n', now + (idx * 0.05));
      });
    }
  }

  getIntervalName(interval: number | null): string {
    if (interval === null) return '';
    const names: Record<number, string> = {
      0: 'R', 1: 'b2', 2: '2', 3: 'b3', 4: '3', 5: '4', 6: 'b5',
      7: '5', 8: 'b6', 9: '6', 10: 'b7', 11: '7'
    };
    return names[interval] || '';
  }
}
