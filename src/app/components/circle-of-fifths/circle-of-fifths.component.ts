import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TheoryService, NOTES } from '../../services/theory.service';

const CIRCLE_OF_FIFTHS = ['C', 'G', 'D', 'A', 'E', 'B', 'F#', 'C#', 'G#', 'D#', 'A#', 'F'];

@Component({
  selector: 'app-circle-of-fifths',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-studio-dark border border-gray-800 rounded-lg p-6 shadow-xl flex flex-col items-center">
      <h3 class="text-sm font-bold text-string mb-6 uppercase tracking-widest text-center">Circle of Fifths</h3>
      
      <div class="relative w-64 h-64 rounded-full border-4 border-gray-800 flex items-center justify-center">
        <!-- Center Hole -->
        <div class="absolute w-32 h-32 bg-studio-darker rounded-full border-4 border-gray-800 z-10 flex items-center justify-center shadow-inner">
          <div class="text-center">
            <span class="block text-2xl font-bold text-white">{{ theory.selectedRoot() }}</span>
            <span class="block text-xs text-highlight font-semibold">{{ theory.selectedName() }}</span>
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
          {{ note | slice:0:2 }}
        </div>
      </div>
      
      <!-- Explanation Toggle Button -->
      <button class="mt-8 text-xs text-string font-semibold uppercase tracking-wider hover:text-white transition" 
              (click)="showExplanation.set(!showExplanation())">
        {{ showExplanation() ? 'Hide Explanation' : 'Show Explanation' }}
      </button>

      <div *ngIf="showExplanation()" class="mt-4 bg-gray-900 border border-gray-800 rounded p-4">
        <p class="text-xs text-gray-400 leading-relaxed mb-3">
          <strong>The Circle of Fifths</strong> is a visual representation of keys and chord relationships. 
          Moving clockwise (C -> G -> D), every step is a "Perfect Fifth" apart and adds one sharp (#) to the key signature. 
          Moving counter-clockwise adds one flat (b).
        </p>
        <p class="text-xs text-gray-400 leading-relaxed">
          The neighbors around your selected root (e.g., C has F and G next to it) form the bedrock <strong>IV</strong> and <strong>V</strong> chords of a progression, which resolve powerfully back home to the <strong>I</strong> (Root).
        </p>
      </div>
    </div>
  `
})
export class CircleOfFifthsComponent {
  theory = inject(TheoryService);
  circle = CIRCLE_OF_FIFTHS;
  showExplanation = signal(false);

  getTransform(index: number) {
    // 12 notes -> 30 degrees each
    const angle = (index * 30 - 90) * (Math.PI / 180); // -90 to start at top
    const radius = 105; // radius in px
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    
    return {
      transform: `translate(${x}px, ${y}px)`,
      left: '50%',
      top: '50%'
    };
  }
}
