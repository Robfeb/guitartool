import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TheoryService, STANDARD_SHAPES } from '../../services/theory.service';

const CAGED_INFO: Record<string, { color: string; colorDim: string; desc: string }> = {
  'C': { color: 'bg-red-500',    colorDim: 'bg-red-900/50 border-red-700',    desc: 'Open C shape. Notes cluster around the 1st-3rd frets.' },
  'A': { color: 'bg-orange-500', colorDim: 'bg-orange-900/50 border-orange-700', desc: 'Open A shape. Root on the A string (5th). Barred up the neck.' },
  'G': { color: 'bg-yellow-500', colorDim: 'bg-yellow-900/50 border-yellow-700', desc: 'Open G shape. Wide stretch, root on low E and high e.' },
  'E': { color: 'bg-green-500',  colorDim: 'bg-green-900/50 border-green-700',  desc: 'Open E shape. Root on low E string (6th). Most common barre.' },
  'D': { color: 'bg-blue-500',   colorDim: 'bg-blue-900/50 border-blue-700',   desc: 'Open D shape. Root on the D string (4th). Higher register.' },
};

function getShapeLetter(name: string): string {
  if (name.includes('E-Shape')) return 'E';
  if (name.includes('A-Shape')) return 'A';
  if (name.includes('G-Shape')) return 'G';
  if (name.includes('D-Shape')) return 'D';
  if (name.includes('C-Shape')) return 'C';
  return '?';
}

@Component({
  selector: 'app-caged-system',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="bg-studio-dark border border-gray-800 rounded-lg p-6 shadow-xl flex flex-col gap-6">
      
      <!-- 1. Positions (Visible by default) -->
      <div class="flex flex-col gap-3" *ngIf="shapesForCurrent().length > 0">
        <p class="text-xs text-string font-bold uppercase tracking-wider">
          {{ theory.effectiveRoot() }} {{ theory.effectiveChordName() }} — positions
        </p>
        <div class="flex flex-wrap gap-2">
          <button *ngFor="let shape of shapesForCurrent(); let i = index"
                  (click)="selectShape(i)"
                  class="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs font-bold transition-all hover:scale-105"
                  [ngClass]="theory.selectedVoicingIndex() === i
                    ? getInfo(shape.letter).color + ' text-white border-transparent shadow-lg'
                    : getInfo(shape.letter).colorDim + ' text-gray-300 hover:text-white'">
            <span class="text-lg font-black leading-none">{{ shape.letter }}</span>
            <div class="flex flex-col items-start leading-none">
              <span>{{ shape.letter }}-Shape</span>
              <span class="text-[10px] opacity-70">fret {{ shape.minFret }}</span>
            </div>
          </button>
        </div>
      </div>

      <!-- 2. Sequence on the neck (Toggleable) -->
      <div class="border-t border-gray-800 pt-4">
        <button (click)="showSequence.set(!showSequence())"
                class="w-full flex items-center justify-between group">
          <span class="text-[10px] text-string font-bold uppercase tracking-widest group-hover:text-white transition">
            Sequence on the neck →
          </span>
          <span class="text-[10px] text-gray-500 group-hover:text-white transition uppercase font-bold tracking-wider">
            {{ showSequence() ? '▲ Hide' : '▼ Show' }}
          </span>
        </button>

        <div *ngIf="showSequence()" class="mt-4 flex flex-col gap-2">
          <div class="flex items-center gap-0.5 overflow-x-auto pb-1">
            <div *ngFor="let letter of repeatSequence"
                 class="flex-shrink-0 w-8 h-8 rounded text-sm font-black flex items-center justify-center text-white"
                 [ngClass]="getInfo(letter).color + ' opacity-80'">
              {{ letter }}
            </div>
          </div>
          <p class="text-[10px] text-gray-600">Shapes repeat every 12 frets. Each shape's root links to the next.</p>
        </div>
      </div>

      <!-- 3. CAGED Theory/Legend (Toggleable, at the bottom) -->
      <div class="border-t border-gray-800 pt-4">
        <button (click)="showTheory.set(!showTheory())"
                class="w-full flex items-center justify-between group">
          <span class="text-[10px] text-string font-bold uppercase tracking-widest group-hover:text-white transition">
            CAGED System Theory
          </span>
          <span class="text-[10px] text-gray-500 group-hover:text-white transition uppercase font-bold tracking-wider">
            {{ showTheory() ? '▲ Hide' : '▼ Show' }}
          </span>
        </button>

        <div *ngIf="showTheory()" class="mt-4 flex flex-col gap-5">
          <!-- Theory Summary -->
          <div class="bg-gray-800 border border-gray-700 rounded-lg p-4 text-xs text-gray-400 leading-relaxed">
            <p class="mb-2">The <strong class="text-white">CAGED system</strong> maps the entire fretboard using <strong class="text-white">5 repeating shapes</strong> derived from open chord positions: <strong class="text-highlight">C – A – G – E – D</strong>.</p>
            <p>Each shape interlocks with the next. Learning all 5 for any chord means you can play it <em>anywhere on the neck</em>.</p>
          </div>

          <!-- 5 Shapes Legend -->
          <div class="flex gap-2 flex-wrap">
            <div *ngFor="let letter of cagedOrder"
                 class="flex-1 min-w-[44px] flex flex-col items-center gap-1 rounded-lg p-2 border"
                 [ngClass]="getInfo(letter).colorDim">
              <span class="text-xl font-black text-white">{{ letter }}</span>
              <span class="text-[10px] text-gray-400 text-center leading-tight">{{ getInfo(letter).desc }}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class CagedSystemComponent {
  theory = inject(TheoryService);
  cagedOrder = ['C', 'A', 'G', 'E', 'D'];
  repeatSequence = ['C','A','G','E','D','C','A','G','E','D','C','A'];

  showTheory = signal(false);
  showSequence = signal(false);

  getInfo(letter: string) {
    return CAGED_INFO[letter] ?? CAGED_INFO['E'];
  }

  shapesForCurrent = computed(() => {
    const chordName = this.theory.effectiveChordName();
    const shapes = STANDARD_SHAPES[chordName] || [];
    return shapes.map(s => ({
      letter: getShapeLetter(s.name),
      minFret: s.frets.filter((f): f is number => f !== null && f > 0).reduce((a, b) => Math.min(a, b), 99),
    }));
  });

  selectShape(voicingIndex: number) {
    this.theory.selectedVoicingIndex.set(voicingIndex);
  }
}
