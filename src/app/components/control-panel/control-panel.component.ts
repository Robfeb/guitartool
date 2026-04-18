import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TheoryService, NOTES, SCALES, CHORDS, TUNINGS, CHORD_PROGRESSIONS } from '../../services/theory.service';
import { CagedSystemComponent } from '../caged-system/caged-system.component';

// Roman numeral → { semitone offset, quality suffix }
const ROMAN_MAP: Record<string, { offset: number; quality: string }> = {
  'I':    { offset: 0,  quality: '' },
  'II':   { offset: 2,  quality: '' },
  'III':  { offset: 4,  quality: '' },
  'IV':   { offset: 5,  quality: '' },
  'V':    { offset: 7,  quality: '' },
  'VI':   { offset: 9,  quality: '' },
  'VII':  { offset: 11, quality: '' },
  'bII':  { offset: 1,  quality: '' },
  'bIII': { offset: 3,  quality: '' },
  'bVI':  { offset: 8,  quality: '' },
  'bVII': { offset: 10, quality: '' },
  'ii':   { offset: 2,  quality: 'm' },
  'iii':  { offset: 4,  quality: 'm' },
  'iv':   { offset: 5,  quality: 'm' },
  'vi':   { offset: 9,  quality: 'm' },
  'vii':  { offset: 11, quality: 'dim' },
};

@Component({
  selector: 'app-control-panel',
  standalone: true,
  imports: [CommonModule, FormsModule, CagedSystemComponent],
  template: `
    <div class="bg-studio-dark border border-gray-800 rounded-lg p-6 shadow-xl flex flex-col gap-6">
      
      <!-- Primary Controls Row -->
      <div class="flex flex-wrap gap-4 items-end">
        <!-- Root Note Selector -->
        <div class="flex flex-col gap-2">
          <label class="text-xs text-string font-bold uppercase tracking-wider">Root Note</label>
          <div class="flex bg-fretboard rounded-md overflow-hidden border border-gray-700">
            <button *ngFor="let note of notes" 
                    class="px-2 py-2 text-sm font-semibold transition hover:bg-highlight hover:text-white"
                    [ngClass]="{'bg-root text-white': theory.selectedRoot() === note}"
                    (click)="theory.selectedRoot.set(note); theory.previewRoot.set(null); theory.previewChordName.set(null)">
              {{ note }}
            </button>
          </div>
        </div>

        <!-- Type Selector -->
        <div class="flex flex-col gap-2 flex-grow max-w-[120px]">
          <label class="text-xs text-string font-bold uppercase tracking-wider">Type</label>
          <select 
            [ngModel]="theory.selectedType()"
            (ngModelChange)="onTypeChange($event)"
            class="bg-fretboard border border-gray-700 text-white text-sm rounded focus:ring-highlight focus:border-highlight block w-full p-2.5">
            <option value="Scale">Scale</option>
            <option value="Chord">Chord</option>
          </select>
        </div>

      </div>

      <!-- CAGED System -->
      <div class="border-t border-gray-800 pt-4">
        <button class="w-full flex items-center justify-between mb-3 group"
                (click)="showCaged.set(!showCaged())">
          <span class="text-xs text-string font-bold uppercase tracking-wider group-hover:text-white transition">
            CAGED System
          </span>
          <span class="text-xs text-gray-500 group-hover:text-white transition uppercase font-bold tracking-wider">
            {{ showCaged() ? '▲ Hide' : '▼ Show' }}
          </span>
        </button>
        <app-caged-system *ngIf="showCaged()"></app-caged-system>
      </div>

      <!-- Songwriting Progressions — entire header is clickable -->
      <div class="border-t border-gray-800 pt-4">
        <button class="w-full flex items-center justify-between mb-3 group"
                (click)="showProgressions.set(!showProgressions())">
          <span class="text-xs text-string font-bold uppercase tracking-wider group-hover:text-white transition">
            Songwriting Progressions
          </span>
          <span class="text-xs text-gray-500 group-hover:text-white transition uppercase font-bold tracking-wider">
            {{ showProgressions() ? '▲ Hide' : '▼ Show' }}
          </span>
        </button>

        <div *ngIf="showProgressions()" class="flex flex-col gap-3">
          <!-- Style Buttons -->
          <div class="flex flex-wrap gap-2">
            <button *ngFor="let style of progressionKeys"
                    (click)="theory.selectedProgressionStyle.set(style)"
                    class="px-3 py-1.5 rounded-full text-xs font-bold transition-all border"
                    [ngClass]="theory.selectedProgressionStyle() === style
                      ? 'bg-highlight text-white border-highlight shadow-lg'
                      : 'bg-fretboard text-string border-gray-700 hover:border-highlight hover:text-white'">
              {{ style }}
            </button>
          </div>

          <!-- Progression Details Card -->
          <div class="bg-gray-800 rounded-lg p-4 border border-blue-900 border-opacity-40 flex items-start gap-4">
            <div class="flex-shrink-0 text-center min-w-[120px]">
              <p class="text-xl font-black text-highlight font-mono leading-none">{{ currentProgression.formula }}</p>
              <p class="text-xs text-gray-500 mt-1 uppercase tracking-wider">{{ theory.selectedProgressionStyle() }}</p>
            </div>
            <p class="text-xs text-gray-400 italic leading-relaxed border-l border-gray-700 pl-4">{{ currentProgression.description }}</p>
          </div>

          <!-- Chord Note Resolution Row -->
          <div class="flex flex-wrap items-end gap-2 bg-fretboard rounded-lg p-3 border border-gray-700">
            <span class="text-xs text-gray-500 font-bold uppercase tracking-wider self-center mr-2">In {{ theory.selectedRoot() }}:</span>
            <ng-container *ngFor="let degree of resolvedChords(); let last = last">
              <div class="flex flex-col items-center gap-1">
                <span class="text-[10px] text-gray-500 font-mono">{{ degree.roman }}</span>
                <button
                  (click)="selectChord(degree)"
                  class="text-sm font-black px-3 py-1.5 rounded-lg shadow-sm transition-all hover:scale-110 hover:shadow-lg active:scale-95"
                  [ngClass]="degree.quality === 'm'   ? 'bg-blue-900/60 text-blue-200 border border-blue-700 hover:bg-blue-700 hover:text-white' :
                             degree.quality === 'dim' ? 'bg-purple-900/60 text-purple-200 border border-purple-700 hover:bg-purple-700 hover:text-white' :
                             'bg-studio-darker text-white border border-gray-600 hover:border-highlight hover:bg-highlight'"
                  [title]="'Play ' + degree.note + (degree.quality || ' Major') + ' on fretboard'">
                  {{ degree.note }}{{ degree.quality }}
                </button>
              </div>
              <span *ngIf="!last" class="text-gray-600 font-bold text-lg self-end pb-1.5">–</span>
            </ng-container>
          </div>
        </div>
      </div>
      
      <!-- Composition Mode Helper (Scale mode only) -->
      <div *ngIf="theory.compositionNotes().secondaryDominants.length > 0" class="pt-4 border-t border-gray-800 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h4 class="text-xs text-string font-bold uppercase tracking-wider mb-2">Secondary Dominants</h4>
          <div class="flex flex-wrap gap-2">
            <span *ngFor="let chord of theory.compositionNotes().secondaryDominants" class="bg-gray-800 text-xs px-2 py-1 rounded text-white border border-gray-700 shadow-inner">
              {{ chord }}
            </span>
          </div>
        </div>
        <div>
          <h4 class="text-xs text-string font-bold uppercase tracking-wider mb-2">Modal Interchange</h4>
          <div class="flex flex-wrap gap-2">
            <span *ngFor="let chord of theory.compositionNotes().modalInterchange" class="bg-gray-800 text-xs px-2 py-1 rounded text-white border border-gray-700 shadow-inner">
              {{ chord }}
            </span>
          </div>
        </div>
      </div>
      
    </div>
  `
})
export class ControlPanelComponent {
  theory = inject(TheoryService);
  notes = NOTES;
  tunings = Object.keys(TUNINGS);
  progressionKeys = Object.keys(CHORD_PROGRESSIONS);
  showProgressions = signal(false);
  showCaged = signal(false);

  get currentProgression() {
    return CHORD_PROGRESSIONS[this.theory.selectedProgressionStyle()]
      ?? { formula: '', description: '' };
  }

  resolvedChords(): { roman: string; note: string; quality: string }[] {
    const formula = this.currentProgression.formula;
    if (!formula) return [];

    const rootIdx = NOTES.indexOf(this.theory.selectedRoot());

    // Split on en-dash or hyphen, trim whitespace
    const degrees = formula.split(/\s*[–\-]\s*/).map(d => d.trim()).filter(Boolean);

    return degrees.map(roman => {
      const entry = ROMAN_MAP[roman];
      if (!entry) return { roman, note: roman, quality: '' };
      const noteIdx = (rootIdx + entry.offset) % 12;
      return { roman, note: NOTES[noteIdx], quality: entry.quality };
    });
  }

  selectChord(degree: { note: string; quality: string }) {
    // Map quality suffix → chord type name in CHORDS
    const qualityToName: Record<string, string> = {
      '':    'Major',
      'm':   'Minor',
      'dim': 'Diminished',
    };
    const chordName = qualityToName[degree.quality] ?? 'Major';

    // Set PREVIEW signals — fretboard updates without touching selectedRoot/selectedName
    this.theory.previewRoot.set(degree.note);
    this.theory.previewChordName.set(chordName);
    this.theory.selectedType.set('Chord');
    this.theory.selectedVoicingIndex.set(0);
  }

  onTypeChange(newType: 'Scale' | 'Chord') {
    this.theory.selectedType.set(newType);
    const newOptions = this.currentOptions();
    if (!newOptions.includes(this.theory.selectedName())) {
      this.theory.selectedName.set(newOptions[0]);
    }
    this.theory.selectedVoicingIndex.set(0);
  }

  currentOptions(): string[] {
    if (this.theory.selectedType() === 'Scale') {
      return Object.keys(SCALES);
    }
    return Object.keys(CHORDS);
  }
}
