import { Component, inject, computed, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TheoryService, STANDARD_SHAPES } from '../../services/theory.service';
import { TranslationService } from '../../services/translation.service';

const CAGED_INFO_BASE: Record<string, { color: string; colorDim: string; descKey: string }> = {
  'C': { color: 'bg-red-500',    colorDim: 'bg-red-900/50 border-red-700',    descKey: 'DESC_C' },
  'A': { color: 'bg-orange-500', colorDim: 'bg-orange-900/50 border-orange-700', descKey: 'DESC_A' },
  'G': { color: 'bg-yellow-500', colorDim: 'bg-yellow-900/50 border-yellow-700', descKey: 'DESC_G' },
  'E': { color: 'bg-green-500',  colorDim: 'bg-green-900/50 border-green-700',  descKey: 'DESC_E' },
  'D': { color: 'bg-blue-500',   colorDim: 'bg-blue-900/50 border-blue-700',   descKey: 'DESC_D' },
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
          {{ theory.effectiveRoot() }} {{ lang.t(theory.effectiveChordName().toUpperCase().replace(' ', '_')) }} — {{ lang.t('POSITIONS') }}
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
            {{ lang.t('SEQUENCE') }} →
          </span>
          <span class="text-[10px] text-gray-500 group-hover:text-white transition uppercase font-bold tracking-wider">
            {{ showSequence() ? '▲ ' + lang.t('HIDE') : '▼ ' + lang.t('SHOW') }}
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
          <p class="text-[10px] text-gray-600">{{ lang.t('SEQUENCE_DESC') }}</p>
        </div>
      </div>

      <!-- 3. CAGED Theory/Legend (Toggleable, at the bottom) -->
      <div class="border-t border-gray-800 pt-4">
        <button (click)="showTheory.set(!showTheory())"
                class="w-full flex items-center justify-between group">
          <span class="text-[10px] text-string font-bold uppercase tracking-widest group-hover:text-white transition">
            {{ lang.t('CAGED_SYSTEM') }} {{ lang.t('THEORY') }}
          </span>
          <span class="text-[10px] text-gray-500 group-hover:text-white transition uppercase font-bold tracking-wider">
            {{ showTheory() ? '▲ ' + lang.t('HIDE') : '▼ ' + lang.t('SHOW') }}
          </span>
        </button>

        <div *ngIf="showTheory()" class="mt-4 flex flex-col gap-5">
          <!-- Theory Summary -->
          <div class="bg-gray-800 border border-gray-700 rounded-lg p-4 text-xs text-gray-400 leading-relaxed">
            <p class="mb-2 italic">{{ lang.t('CAGED_THEORY_SUM') }}</p>
            <p>{{ lang.t('CAGED_THEORY_LINK') }}</p>
          </div>

          <!-- 5 Shapes Legend -->
          <div class="flex gap-2 flex-wrap">
            <div *ngFor="let letter of cagedOrder"
                 class="flex-1 min-w-[44px] flex flex-col items-center gap-1 rounded-lg p-2 border"
                 [ngClass]="getInfo(letter).colorDim">
              <span class="text-xl font-black text-white">{{ letter }}</span>
              <span class="text-[10px] text-gray-400 text-center leading-tight">{{ lang.t(getInfo(letter).descKey) }}</span>
            </div>
          </div>
        </div>
      </div>

    </div>
  `
})
export class CagedSystemComponent {
  theory = inject(TheoryService);
  lang = inject(TranslationService);
  
  cagedOrder = ['C', 'A', 'G', 'E', 'D'];
  repeatSequence = ['C','A','G','E','D','C','A','G','E','D','C','A'];

  showTheory = signal(false);
  showSequence = signal(false);

  getInfo(letter: string) {
    return CAGED_INFO_BASE[letter] ?? CAGED_INFO_BASE['E'];
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
