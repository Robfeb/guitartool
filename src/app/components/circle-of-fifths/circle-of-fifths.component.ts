import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TheoryService, NOTES } from '../../services/theory.service';
import { TranslationService } from '../../services/translation.service';

const CIRCLE_OF_FIFTHS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F'];

@Component({
  selector: 'app-circle-of-fifths',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-studio-dark border border-gray-800 rounded-lg p-6 shadow-xl flex flex-col items-center">
      <h3 class="text-sm font-bold text-string mb-6 uppercase tracking-widest text-center">{{ lang.t('CIRCLE_OF_FIFTHS') }}</h3>
      
      <div class="relative w-64 h-64 rounded-full border-4 border-gray-800 flex items-center justify-center">
        <!-- Center Hole -->
        <div class="absolute w-32 h-32 bg-studio-darker rounded-full border-4 border-gray-800 z-10 flex items-center justify-center shadow-inner">
          <div class="text-center">
            <span class="block text-2xl font-bold text-white">{{ lang.t(theory.selectedRoot()) }}</span>
            <span class="block text-xs text-highlight font-semibold">{{ lang.t(theory.selectedName().toUpperCase()) }}</span>
          </div>
        </div>
        
        <!-- Notes in the Circle -->
        <div *ngFor="let note of circle; let i = index" 
             class="absolute w-10 h-10 -ml-5 -mt-5 flex items-center justify-center font-bold rounded-full transition-all cursor-pointer z-20 shadow-md"
             [ngStyle]="getTransform(i)"
             [ngClass]="{
               'bg-root text-white scale-125 shadow-[0_0_15px_rgba(239,68,68,0.5)] border-2 border-white': note === theory.selectedRoot(),
               'bg-fretboard text-string hover:text-white': note !== theory.selectedRoot()
             }"
             (click)="theory.selectedRoot.set(note)">
          {{ lang.t(note) }}
        </div>
      </div>
      
      <!-- Explanation Toggle Button -->
      <button class="mt-8 text-xs text-string font-semibold uppercase tracking-wider hover:text-white transition" 
              (click)="showExplanation.set(!showExplanation())">
        {{ showExplanation() ? lang.t('HIDE') + ' ' + lang.t('THEORY') : lang.t('SHOW') + ' ' + lang.t('THEORY') }}
      </button>

      <div *ngIf="showExplanation()" class="mt-4 bg-gray-900 border border-gray-800 rounded p-4 max-w-xs">
        <p class="text-[10px] text-gray-400 leading-relaxed mb-3">
          {{ lang.currentLang() === 'en' ? 'The Circle of Fifths is a visual representation of keys and chord relationships.' : 'El Círculo de Quintas es una representación visual de las tonalidades y las relaciones entre acordes.' }}
        </p>
        <p class="text-[10px] text-gray-400 leading-relaxed">
          {{ lang.currentLang() === 'en' ? 'Neighbors around your selected root form the bedrock IV and V chords.' : 'Las notas adyacentes a tu raíz seleccionada forman los acordes fundamentales IV y V.' }}
        </p>
      </div>
    </div>
  `
})
export class CircleOfFifthsComponent {
  theory = inject(TheoryService);
  lang = inject(TranslationService);
  
  circle = CIRCLE_OF_FIFTHS;
  showExplanation = signal(false);

  getTransform(index: number) {
    const angle = (index * 30 - 90) * (Math.PI / 180); 
    const radius = 105; 
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    
    return {
      transform: `translate(${x}px, ${y}px)`,
      left: '50%',
      top: '50%'
    };
  }
}
