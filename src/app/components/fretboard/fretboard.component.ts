import { Component, inject, HostListener, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TheoryService, FretNote, TUNINGS, CHORDS, SCALES, STANDARD_SHAPES, NOTES } from '../../services/theory.service';
import { TranslationService } from '../../services/translation.service';
import * as Tone from 'tone';

@Component({
  selector: 'app-fretboard',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="w-full py-2">
      <!-- Top Row: Select Key and Mode -->
      <div class="flex flex-col lg:flex-row items-start lg:items-end gap-4 md:gap-6 mb-6 pl-4 md:pl-12 pr-4 md:pr-12">
         <!-- Title & Strum -->
         <div class="flex items-center gap-3">
             <h2 class="text-lg md:text-xl font-black text-string tracking-tighter xl:tracking-widest uppercase">{{ lang.t('FRETBOARD') }}</h2>
             <button *ngIf="theory.selectedType() === 'Chord'" 
                    (click)="strumChord()" 
                    class="bg-highlight hover:bg-highlight/80 text-white w-10 h-10 rounded-full shadow-lg transition transform hover:scale-110 flex items-center justify-center border-4 border-studio-darker"
                    [attr.title]="lang.t('STRUM')">
               <svg class="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 20 20"><path d="M4 4l12 6-12 6z"></path></svg>
             </button>
         </div>

         <!-- Select Key -->
         <div class="flex flex-col gap-1.5 flex-grow w-full max-w-xl">
             <span class="text-[9px] text-gray-500 uppercase tracking-widest font-black">{{ lang.t('SELECT_KEY') }}</span>
             <div class="flex bg-studio-darker/50 rounded-md overflow-x-auto border border-gray-800 no-scrollbar shadow-inner">
               <button *ngFor="let note of notes" 
                       class="flex-1 min-w-[2.5rem] py-2 text-xs font-black transition hover:bg-highlight hover:text-white"
                       [ngClass]="{'bg-root text-white shadow-lg': theory.selectedRoot() === note, 'text-gray-500': theory.selectedRoot() !== note}"
                       (click)="theory.selectedRoot.set(note); theory.previewRoot.set(null); theory.previewChordName.set(null); theory.previewType.set(null)">
                 {{ lang.t(note) }}
               </button>
             </div>
         </div>

         <!-- Mode Select -->
         <div class="flex flex-col gap-1.5 w-full sm:w-32">
             <span class="text-[9px] text-gray-500 uppercase tracking-widest font-black">{{ lang.t('MODE') }}</span>
             <select 
               [ngModel]="theory.selectedType()"
               (ngModelChange)="onTypeChange($event)"
               class="bg-studio-darker border border-gray-800 text-white text-[11px] font-bold rounded focus:ring-highlight block w-full p-2 h-[34px] shadow-inner">
               <option value="Scale" class="bg-studio-dark text-white">{{ lang.t('SCALE') }}</option>
               <option value="Chord" class="bg-studio-dark text-white">{{ lang.t('CHORD') }}</option>
             </select>
         </div>

         <!-- Color By Note Toggle -->
         <div class="flex flex-col gap-1.5 w-full sm:w-28">
             <span class="text-[9px] text-gray-500 uppercase tracking-widest font-black whitespace-nowrap">{{ lang.t('COLORS') }}</span>
             <label class="flex items-center justify-center gap-2 cursor-pointer h-[34px] bg-studio-darker border border-gray-800 px-2 rounded shadow-inner hover:bg-gray-800 transition">
               <input type="checkbox" [ngModel]="theory.colorByNote()" (ngModelChange)="theory.colorByNote.set($event)"
                      class="accent-highlight w-4 h-4 rounded">
               <span class="text-[10px] font-bold text-white uppercase">{{ theory.colorByNote() ? lang.t('ON') : lang.t('OFF') }}</span>
             </label>
         </div>
      </div>

      <!-- Fretboard Area (Full Width, Horizontal Scroll on Mobile) -->
      <div class="w-full overflow-x-auto no-scrollbar mb-6">
         <div class="min-w-[800px] flex flex-col gap-1 select-none pr-4 md:pr-12 pl-4 md:pl-12">
            <!-- Fret Numbers -->
            <div class="flex text-[10px] text-gray-600 mb-2 font-black ml-12">
              <div *ngFor="let fret of fretNumbers()" class="flex-1 text-center font-mono">
                {{ fret === 0 ? 'OPEN' : fret }}
              </div>
            </div>
            
            <div class="relative bg-fretboard border-4 border-studio-darker rounded shadow-2xl pb-4 pt-4">
              <div *ngFor="let stringNotes of fretboard(); let i = index" 
                   class="flex relative items-center mb-1 group">
                   
                <div class="w-12 flex min-w-[3.5rem] items-center justify-center font-black text-lg text-gray-700 bg-studio-darker/50">
                  {{ lang.t(stringNotes[0].note) }}
                </div>
                   
                <div class="absolute left-14 right-0 h-0.5 bg-string opacity-40 z-0 shadow-sm transition group-hover:bg-white/50 group-hover:opacity-100" 
                     [style.height.px]="(6-i)*0.8 + 1"></div>
                     
                <div *ngFor="let note of stringNotes; let f = index" 
                     class="flex-1 flex justify-center z-10 border-r border-fret border-opacity-10 py-2 relative"
                     [ngClass]="{'border-l-4 border-l-black': f === 1}">
                     
                  <div *ngIf="(i === 2 || i === 4) && [3,5,7,9,15,17,19,21].includes(f) && i===2" 
                       class="absolute pointer-events-none w-4 h-4 rounded-full bg-white/5 shadow-inner" style="top: 150%;"></div>
                  <div *ngIf="f === 12 && (i === 1 || i === 4)" 
                       class="absolute pointer-events-none w-4 h-4 rounded-full bg-white/5 shadow-inner" style="top: 150%;"></div>
                     
                  <button 
                    class="w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-black transition-all shadow-md active:scale-90"
                    [ngClass]="{
                      'bg-root text-white scale-110 shadow-root/50 z-20 ring-2 ring-white': note.interval === 0,
                      'bg-highlight text-white': !theory.colorByNote() && note.interval !== null && note.interval !== 0,
                      'text-white': theory.colorByNote() && note.interval !== null && note.interval !== 0,
                      'bg-studio-darker text-gray-600 opacity-30 hover:opacity-100': note.interval === null
                    }"
                    [style.background-color]="theory.colorByNote() && note.interval !== null && note.interval !== 0 ? getNoteColor(note.note) : ''"
                    (click)="playNote(note)">
                    <span *ngIf="theory.showFingers() && note.finger" class="text-sm">
                      {{ note.finger }}
                    </span>
                    
                    <ng-container *ngIf="!theory.showFingers() || !note.finger">
                      <span *ngIf="learningMode()" class="text-[10px]">
                        {{ lang.t(note.note) }}
                      </span>
                      <span *ngIf="!learningMode() && note.interval !== null">
                        {{ getIntervalName(note.interval) }}
                      </span>
                      <span *ngIf="!learningMode() && note.interval === null" class="opacity-0 group-hover:opacity-100 transition">
                        {{ lang.t(note.note) }}
                      </span>
                    </ng-container>
                  </button>
                </div>
              </div>
            </div>
         </div>
      </div>

      <!-- Advanced Options Toggle -->
      <div class="pl-4 md:pl-12 pr-4 md:pr-12">
        <button class="md:hidden w-full py-2 mb-4 flex items-center justify-center gap-2 bg-studio-darker border border-gray-800 rounded text-xs font-bold text-gray-400 hover:text-white transition"
                (click)="showAdvanced.set(!showAdvanced())">
          {{ showAdvanced() ? '▲ ' + lang.t('HIDE') : '▼ ' + lang.t('SHOW') }} OPTIONS
        </button>

        <!-- Bottom Controls Row -->
        <div class="flex flex-col md:flex-row flex-wrap items-start md:items-center gap-4 md:gap-6"
             [ngClass]="showAdvanced() ? 'flex' : 'hidden md:flex'">
           
           <!-- Chord / Scale Name Button Row -->
           <div class="flex flex-wrap gap-2 overflow-x-auto no-scrollbar py-1 flex-grow">
             <span class="text-[10px] text-gray-500 font-bold uppercase tracking-widest self-center mr-2 shrink-0">{{ lang.t(theory.selectedType().toUpperCase()) }}:</span>
             <button 
               *ngFor="let name of currentOptions()"
               (click)="selectName(name)"
               class="px-3 py-1.5 rounded-full text-[10px] font-bold transition-all border shrink-0"
               [ngClass]="theory.selectedName() === name
                 ? 'bg-highlight text-white border-highlight shadow-lg scale-105'
                 : 'bg-fretboard text-string border-gray-700 hover:border-highlight hover:text-white'"
             >
               {{ lang.t(name.toUpperCase().replace(' ', '_')) }}
             </button>
           </div>

           <!-- Voicing Control -->
           <div class="flex items-center gap-2 bg-studio-darker/30 p-1 rounded-md border border-gray-800 shrink-0" *ngIf="theory.selectedType() === 'Chord'">
             <button class="bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded text-white text-[10px] font-bold" (click)="rotateVoicing(-1)">{{ lang.t('PREV') }}</button>
             <div class="flex flex-col items-center min-w-[3rem]">
               <span class="text-white text-[10px] font-black">{{ theory.selectedVoicingIndex() + 1 }} / {{ theory.generatedVoicings().length }}</span>
               <span *ngIf="currentCagedShape()" class="text-[8px] font-black text-green-500 uppercase">{{ currentCagedShape() }}-Shape</span>
             </div>
             <button class="bg-gray-700 hover:bg-gray-600 px-3 py-1.5 rounded text-white text-[10px] font-bold" (click)="rotateVoicing(1)">{{ lang.t('NEXT') }}</button>
           </div>

           <!-- Multi-toggle Row -->
           <div class="flex items-center gap-4 shrink-0">
             <label *ngIf="theory.selectedType() === 'Chord'"
                    class="flex items-center gap-2 cursor-pointer text-[10px] font-bold text-string/80 hover:text-white transition">
               <input type="checkbox" [ngModel]="theory.showFingers()" (ngModelChange)="theory.showFingers.set($event)"
                      class="accent-highlight w-4 h-4 rounded">
               <span>{{ lang.t('FINGERS') }}</span>
             </label>

             <label class="flex items-center gap-2 cursor-pointer text-[10px] font-bold text-string/80 hover:text-white transition">
               <input type="checkbox" [ngModel]="theory.learningMode()" (ngModelChange)="theory.learningMode.set($event)"
                      class="accent-highlight w-4 h-4 rounded">
               <span>{{ lang.t('NOTES') }}</span>
             </label>
           </div>

           <!-- Tuning & Range Dropdowns -->
           <div class="flex items-center gap-4 ml-auto lg:ml-0 shrink-0">
             <div class="flex items-center gap-2">
               <label class="text-[10px] text-gray-500 font-bold uppercase tracking-widest hidden sm:block">{{ lang.t('TUNING') }}</label>
               <select [ngModel]="theory.selectedTuning()" (ngModelChange)="theory.selectedTuning.set($event)"
                 class="bg-fretboard border border-gray-700 text-white text-[11px] rounded focus:ring-highlight block w-28 p-1.5">
                 <option *ngFor="let tuning of tunings" [value]="tuning">{{ tuning }}</option>
               </select>
             </div>

             <div class="flex items-center gap-2">
               <label class="text-[10px] text-gray-500 font-bold uppercase tracking-widest hidden sm:block">{{ lang.t('FRETS') }}</label>
               <select [ngModel]="theory.fretRange()" (ngModelChange)="theory.fretRange.set(+($event))"
                 class="bg-fretboard border border-gray-700 text-white text-[11px] rounded focus:ring-highlight block w-16 p-1.5">
                 <option [value]="16">16</option>
                 <option [value]="22">22</option>
               </select>
             </div>
           </div>
        </div>
      </div>
    </div>
  `
})
export class FretboardComponent {
  theory = inject(TheoryService);
  lang = inject(TranslationService);
  Math = Math;
  notes = NOTES;

  learningMode = this.theory.learningMode;
  fretboard = this.theory.visibleFretboard;
  showAdvanced = signal(false);

  // Now a signal-based computed array for the header [0, 1, ..., 16/22]
  fretNumbers = computed(() => Array.from({ length: this.theory.fretRange() + 1 }, (_, i) => i));

  synth: Tone.PolySynth | null = null;

  @HostListener('window:keydown', ['$event'])
  async handleKeyboardEvent(event: KeyboardEvent) {
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA') {
      return;
    }

    const key = event.key.toLowerCase();
    const notesMap: Record<string, string> = {
      'c': 'C', 'd': 'D', 'e': 'E', 'f': 'F', 'g': 'G', 'a': 'A', 'b': 'B'
    };

    if (notesMap[key]) {
      const selectedNote = notesMap[key];
      this.theory.selectedRoot.set(selectedNote);
      this.theory.previewRoot.set(null);
      this.theory.previewChordName.set(null);
      this.theory.previewType.set(null);
      
      if (this.theory.selectedType() === 'Chord') {
        await this.strumChord();
      } else {
        await this.playRootFrequency(selectedNote);
      }
    }
  }

  async playRootFrequency(noteName: string) {
    if (Tone.context.state !== 'running') {
      await Tone.start();
    }
    if (!this.synth) {
      this.synth = new Tone.PolySynth(Tone.Synth).toDestination();
    }
    const freq = this.theory.getFrequency(noteName, 3); 
    this.synth.triggerAttackRelease(freq, '8n');
  }

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
    this.theory.previewRoot.set(null);
    this.theory.previewChordName.set(null);
    this.theory.previewType.set(null);
    this.theory.selectedVoicingIndex.set(0);
  }

  onTypeChange(newType: 'Scale' | 'Chord') {
    this.theory.selectedType.set(newType);
    this.theory.previewRoot.set(null);
    this.theory.previewChordName.set(null);
    this.theory.previewType.set(null);
    const newOptions = this.currentOptions();
    if (!newOptions.includes(this.theory.selectedName())) {
      this.theory.selectedName.set(newOptions[0]);
    }
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
    return this.theory.currentCagedShape();
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

  getNoteColor(noteName: string): string {
    const hueMap: Record<string, number> = {
      'C': 0, 'C#': 30, 'D': 60, 'D#': 90, 'E': 120, 'F': 150,
      'F#': 180, 'G': 210, 'G#': 240, 'A': 270, 'A#': 300, 'B': 330
    };
    const hue = hueMap[noteName] || 0;
    return `hsl(${hue}, 70%, 50%)`;
  }
}
