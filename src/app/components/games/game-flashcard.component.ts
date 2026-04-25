import { Component, inject, signal, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TheoryService, NOTES, CHORDS } from '../../services/theory.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-game-flashcard',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-studio-dark border border-gray-800 rounded-lg p-6 shadow-xl flex flex-col gap-6 items-center justify-center min-h-[300px] relative overflow-hidden">
      <!-- Background Graphic -->
      <div class="absolute inset-0 opacity-5 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-highlight to-studio-darker"></div>
      
      <h3 class="text-white font-bold tracking-widest uppercase text-sm absolute top-4 left-4 z-10">{{ lang.t('FLASHCARDS') }}</h3>
      
      <!-- Score -->
      <div class="absolute top-4 right-4 z-10 flex flex-col items-end">
         <span class="text-[10px] text-gray-500 font-bold uppercase">{{ lang.t('SCORE') }}</span>
         <span class="text-xl font-black text-highlight font-mono">{{ score() }}</span>
      </div>

      <div class="z-10 flex flex-col items-center gap-8 w-full max-w-md">
        <!-- The Card -->
        <div class="w-full bg-studio-dark border-2 border-gray-700 rounded-2xl p-8 flex flex-col items-center justify-center shadow-2xl transition-all duration-500"
             [ngClass]="isRevealed() ? 'border-highlight shadow-[0_0_30px_rgba(59,130,246,0.3)] scale-105' : 'hover:border-gray-500'">
          <span class="text-gray-500 text-xs uppercase font-bold tracking-widest mb-2" *ngIf="!isRevealed()">Guess the shape for</span>
          <span class="text-gray-500 text-xs uppercase font-bold tracking-widest mb-2 text-highlight" *ngIf="isRevealed()">Answer Revealed</span>
          
          <h2 class="text-4xl md:text-5xl font-black font-mono text-center" style="color: var(--text-primary);">
            {{ lang.t(currentNote()) }} {{ lang.t(currentChord()) }}
          </h2>
        </div>

        <!-- Controls -->
        <div class="flex gap-4 w-full">
          <button *ngIf="!isRevealed()" (click)="reveal()" class="flex-1 bg-highlight hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-colors text-sm uppercase tracking-wider">
            {{ lang.t('SHOW_ANSWER') }}
          </button>

          <ng-container *ngIf="isRevealed()">
            <button (click)="nextChord(false)" class="flex-1 bg-studio-darker hover:bg-gray-700 border border-gray-600 font-bold py-3 px-6 rounded-lg transition-colors text-sm uppercase tracking-wider" style="color: var(--text-primary);">
              Missed it
            </button>
            <button (click)="nextChord(true)" class="flex-1 bg-highlight hover:bg-blue-500 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-colors text-sm uppercase tracking-wider">
              Got it!
            </button>
          </ng-container>
        </div>
      </div>
    </div>
  `
})
export class GameFlashcardComponent implements OnDestroy {
  theory = inject(TheoryService);
  lang = inject(TranslationService);

  currentNote = signal('C');
  currentChord = signal('Major');
  isRevealed = signal(false);
  score = signal(0);

  chordTypes = Object.keys(CHORDS);

  constructor() {
    this.generateRandomChord();
    // Hide fretboard details initially to let user guess
    this.theory.previewRoot.set(null);
    this.theory.previewChordName.set(null);
  }

  generateRandomChord() {
    const randomNote = NOTES[Math.floor(Math.random() * NOTES.length)];
    const randomChord = this.chordTypes[Math.floor(Math.random() * this.chordTypes.length)];
    
    this.currentNote.set(randomNote);
    this.currentChord.set(randomChord);
    this.isRevealed.set(false);
    
    // Set preview to null so fretboard goes back to default or hides
    // Actually, we want to clear preview so user doesn't see it until reveal
    // We'll set a special "hidden" state or just let it show the default (selectedRoot) which might be a hint.
    // Let's just clear preview.
    this.theory.previewRoot.set(null);
    this.theory.previewChordName.set(null);
  }

  reveal() {
    this.isRevealed.set(true);
    // Update the fretboard to show the answer
    this.theory.previewRoot.set(this.currentNote());
    this.theory.previewChordName.set(this.currentChord());
    this.theory.selectedType.set('Chord');
  }

  nextChord(gotItRight: boolean) {
    if (gotItRight) {
      this.score.update(s => s + 1);
    } else {
      this.score.set(0); // Reset streak
    }
    this.generateRandomChord();
  }

  ngOnDestroy() {
    this.theory.previewRoot.set(null);
    this.theory.previewChordName.set(null);
  }
}
