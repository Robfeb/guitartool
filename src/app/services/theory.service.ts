import { Injectable, signal, computed, effect, inject } from '@angular/core';
import { TranslationService, Lang } from './translation.service';

export interface FretNote {
  note: string;
  octave: number;
  interval: number | null; 
  fret: number;
  stringIdx: number;
  finger?: number;
}

export interface Voicing {
  frets: (number | null)[];
  fingers: (number | null)[];
}

export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export const SCALES: Record<string, number[]> = {
  'Major': [0, 2, 4, 5, 7, 9, 11],
  'Minor': [0, 2, 3, 5, 7, 8, 10],
  'Pentatonic Major': [0, 2, 4, 7, 9],
  'Pentatonic Minor': [0, 3, 5, 7, 10],
  'Dorian': [0, 2, 3, 5, 7, 9, 10],
  'Mixolydian': [0, 2, 4, 5, 7, 9, 10],
  'Lydian': [0, 2, 4, 6, 7, 9, 11],
};

export const CHORDS: Record<string, number[]> = {
  'Major': [0, 4, 7],
  'Minor': [0, 3, 7],
  'Dominant 7th': [0, 4, 7, 10],
  'Major 7th': [0, 4, 7, 11],
  'Minor 7th': [0, 3, 7, 10],
  'Diminished': [0, 3, 6],
  'Augmented': [0, 4, 8],
  'Sus 4': [0, 5, 7],
};

export const TUNINGS: Record<string, { note: string; octave: number }[]> = {
  'Standard': [
    { note: 'E', octave: 4 },
    { note: 'B', octave: 3 },
    { note: 'G', octave: 3 },
    { note: 'D', octave: 3 },
    { note: 'A', octave: 2 },
    { note: 'E', octave: 2 },
  ],
  'Drop D': [
    { note: 'E', octave: 4 },
    { note: 'B', octave: 3 },
    { note: 'G', octave: 3 },
    { note: 'D', octave: 3 },
    { note: 'A', octave: 2 },
    { note: 'D', octave: 2 },
  ],
  'Open G': [
    { note: 'D', octave: 4 },
    { note: 'B', octave: 3 },
    { note: 'G', octave: 3 },
    { note: 'D', octave: 3 },
    { note: 'G', octave: 2 },
    { note: 'D', octave: 2 },
  ],
  'Open D': [
    { note: 'D', octave: 4 },
    { note: 'A', octave: 3 },
    { note: 'F#', octave: 3 },
    { note: 'D', octave: 3 },
    { note: 'A', octave: 2 },
    { note: 'D', octave: 2 },
  ],
  'C6 (Lap Steel)': [
    { note: 'E', octave: 4 },
    { note: 'C', octave: 4 },
    { note: 'A', octave: 3 },
    { note: 'G', octave: 3 },
    { note: 'E', octave: 3 },
    { note: 'C', octave: 3 },
  ]
};

// Simple shape library for CAGED and common voicings
export const STANDARD_SHAPES: Record<string, { name: string; rootString: number; rootFretInShape: number; frets: (number | null)[] }[]> = {
  'Major': [
     { name: 'E-Shape', rootString: 5, rootFretInShape: 0, frets: [0, 0, 1, 2, 2, 0] },
     { name: 'A-Shape', rootString: 4, rootFretInShape: 0, frets: [0, 2, 2, 2, 0, null] },
     { name: 'D-Shape', rootString: 3, rootFretInShape: 0, frets: [2, 3, 2, 0, null, null] },
     { name: 'G-Shape', rootString: 5, rootFretInShape: 3, frets: [3, 0, 0, 0, 2, 3] },
     { name: 'C-Shape', rootString: 4, rootFretInShape: 3, frets: [0, 1, 0, 2, 3, null] },
  ],
  'Minor': [
     { name: 'E-Shape', rootString: 5, rootFretInShape: 0, frets: [0, 0, 0, 2, 2, 0] },
     { name: 'A-Shape', rootString: 4, rootFretInShape: 0, frets: [0, 1, 2, 2, 0, null] },
     { name: 'D-Shape', rootString: 3, rootFretInShape: 0, frets: [1, 3, 2, 0, null, null] },
     { name: 'G-Shape', rootString: 5, rootFretInShape: 3, frets: [3, 3, 3, 5, 5, 3] }, // barre version
     { name: 'C-Shape', rootString: 4, rootFretInShape: 3, frets: [null, 4, 5, 5, 3, null] }, 
  ],
  'Dominant 7th': [
     { name: 'E-Shape', rootString: 5, rootFretInShape: 0, frets: [0, 0, 1, 0, 2, 0] },
     { name: 'A-Shape', rootString: 4, rootFretInShape: 0, frets: [0, 2, 0, 2, 0, null] },
  ],
  'Major 7th': [
     { name: 'E-Shape', rootString: 5, rootFretInShape: 0, frets: [0, 0, 1, 1, null, 0] },
     { name: 'A-Shape', rootString: 4, rootFretInShape: 0, frets: [null, 2, 1, 2, 0, null] },
  ],
  'Minor 7th': [
     { name: 'E-Shape', rootString: 5, rootFretInShape: 0, frets: [0, 0, 0, 0, 2, 0] },
     { name: 'A-Shape', rootString: 4, rootFretInShape: 0, frets: [0, 1, 0, 2, 0, null] },
  ],
};

export const CHORD_PROGRESSIONS: Record<string, { formula: string; descriptionKey: string }> = {
  'Rock/Blues':      { formula: 'I – IV – V',          descriptionKey: 'DESC_ROCK_BLUES' },
  'Pop Anthem':      { formula: 'I – V – vi – IV',     descriptionKey: 'DESC_POP' },
  'Classic Doo-Wop': { formula: 'I – vi – IV – V',     descriptionKey: 'DESC_DOOWOP' },
  'Country/Folk':    { formula: 'I – V – vi – iii – IV – I', descriptionKey: 'DESC_COUNTRY' },
  'Jazz Turnaround': { formula: 'ii – V – I',          descriptionKey: 'DESC_JAZZ' },
  'Modern Rock':     { formula: 'vi – IV – I – V',     descriptionKey: 'DESC_ROCK' },
  'Folk Rock':       { formula: 'I – ii – IV – I',     descriptionKey: 'DESC_FOLK_ROCK' },
  'Southern Rock':   { formula: 'I – bVII – IV – I',   descriptionKey: 'DESC_SOUTHERN_ROCK' },
  'Cinematic':       { formula: 'i – bVI – bIII – bVII', descriptionKey: 'DESC_ALT_ROCK' },
  'Grunge/Alt':      { formula: 'I – bIII – IV – iv',  descriptionKey: 'DESC_GRUNGE' },
};

export const ROMAN_MAP: Record<string, { offset: number; quality: string }> = {
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

@Injectable({
  providedIn: 'root'
})
export class TheoryService {
  selectedRoot = signal('C');
  selectedType = signal<'Scale' | 'Chord'>('Chord');
  selectedName = signal('Major');
  learningMode = signal(true);
  showFingers = signal(true);
  
  selectedTuning = signal('Standard');
  selectedProgressionStyle = signal('Pop');
  selectedVoicingIndex = signal(0);
  
  // UI State
  isDarkMode = signal(true);
  showCircle = signal(false);
  fretRange = signal<number>(16);
  currentLang = signal<Lang>('en');
  
  metronomeTempo = signal(120);
  metronomeBeats = signal(4);
  showMetronome = signal(false);
  
  metronomeClickEnabled = signal(true);
  metronomeHasAccent = signal(true);
  
  selectedDrumStyle = signal<string>('None');
  
  // Mixer Volumes (0 to 1 range)
  metronomeVolume = signal(0.8);
  drumsVolume = signal(0.7);

  // Global Visibility States for Persistence
  showCagedPanel = signal(false);
  showProgressionsPanel = signal(false);
  showCagedTheory = signal(false);
  showSequenceTheory = signal(false);

  // Playback state (controlled by UI or Shortcuts)
  metronomeIsPlaying = signal(false);

  // Preview signals: set by Songwriting Progressions chord buttons.
  previewRoot = signal<string | null>(null);
  previewChordName = signal<string | null>(null);

  // Game & Tutorial States
  showGamesPanel = signal(false);
  activeGame = signal<'song'|'flashcard'|'none'>('none');
  showTutorial = signal(false);
  tutorialCompleted = signal(false);

  constructor() {
    // Load state from localStorage
    const saved = localStorage.getItem('guitarToolState');
    if (saved) {
      try {
        const state = JSON.parse(saved);
        this.selectedRoot.set(state.selectedRoot ?? 'C');
        this.selectedType.set(state.selectedType ?? 'Chord');
        this.selectedName.set(state.selectedName ?? 'Major');
        this.learningMode.set(state.learningMode ?? true);
        this.showFingers.set(state.showFingers ?? true);
        this.selectedTuning.set(state.selectedTuning ?? 'Standard');
        this.selectedProgressionStyle.set(state.selectedProgressionStyle ?? 'Pop');
        
        this.isDarkMode.set(state.isDarkMode ?? true);
        this.showCircle.set(state.showCircle ?? false);
        this.fretRange.set(state.fretRange ?? 16);
        this.currentLang.set(state.currentLang ?? 'en');
        
        // Metronome & Drums
        this.metronomeTempo.set(state.metronomeTempo ?? 120);
        this.metronomeBeats.set(state.metronomeBeats ?? 4);
        this.showMetronome.set(state.showMetronome ?? false);
        this.metronomeClickEnabled.set(state.metronomeClickEnabled ?? true);
        this.metronomeHasAccent.set(state.metronomeHasAccent ?? true);
        this.selectedDrumStyle.set(state.selectedDrumStyle ?? 'None');
        this.metronomeVolume.set(state.metronomeVolume ?? 0.8);
        this.drumsVolume.set(state.drumsVolume ?? 0.7);

        this.showCagedTheory.set(state.showCagedTheory ?? false);
        this.showSequenceTheory.set(state.showSequenceTheory ?? false);
        
        this.showGamesPanel.set(state.showGamesPanel ?? false);
        this.tutorialCompleted.set(state.tutorialCompleted ?? false);
        // Automatically show tutorial if not completed
        if (!this.tutorialCompleted()) {
          this.showTutorial.set(true);
        }
      } catch (e) {
        console.error('Failed to load state', e);
      }
    } else {
      // First time user
      this.showTutorial.set(true);
    }

    // Persist state on every change
    effect(() => {
      const state = {
        selectedRoot: this.selectedRoot(),
        selectedType: this.selectedType(),
        selectedName: this.selectedName(),
        learningMode: this.learningMode(),
        showFingers: this.showFingers(),
        selectedTuning: this.selectedTuning(),
        selectedProgressionStyle: this.selectedProgressionStyle(),
        isDarkMode: this.isDarkMode(),
        showCircle: this.showCircle(),
        fretRange: this.fretRange(),
        currentLang: this.currentLang(),
        metronomeTempo: this.metronomeTempo(),
        metronomeBeats: this.metronomeBeats(),
        showMetronome: this.showMetronome(),
        metronomeClickEnabled: this.metronomeClickEnabled(),
        metronomeHasAccent: this.metronomeHasAccent(),
        selectedDrumStyle: this.selectedDrumStyle(),
        metronomeVolume: this.metronomeVolume(),
        drumsVolume: this.drumsVolume(),
        showCagedTheory: this.showCagedTheory(),
        showSequenceTheory: this.showSequenceTheory(),
        showGamesPanel: this.showGamesPanel(),
        tutorialCompleted: this.tutorialCompleted()
      };
      localStorage.setItem('guitarToolState', JSON.stringify(state));
    });
  }

  // Effective values used by the fretboard (preview takes priority)
  effectiveRoot = computed(() => this.previewRoot() ?? this.selectedRoot());
  effectiveChordName = computed(() => this.previewChordName() ?? this.selectedName());

  activeIntervals = computed(() => {
    const type = this.selectedType();
    const name = this.effectiveChordName();
    if (type === 'Scale') return SCALES[name] || SCALES['Major'];
    return CHORDS[name] || CHORDS['Major'];
  });

  compositionNotes = computed(() => {
    const rootIdx = NOTES.indexOf(this.selectedRoot());
    const type = this.selectedType();
    const name = this.selectedName();
    
    let secondaryDominants: string[] = [];
    let modalInterchange: string[] = [];

    if (type === 'Scale' && name === 'Major') {
       secondaryDominants = [
         NOTES[(rootIdx + 9) % 12] + '7 (V/ii)',
         NOTES[(rootIdx + 11) % 12] + '7 (V/iii)',
         NOTES[(rootIdx + 0) % 12] + '7 (V/IV)',
         NOTES[(rootIdx + 2) % 12] + '7 (V/V)',
         NOTES[(rootIdx + 4) % 12] + '7 (V/vi)',
       ];
       modalInterchange = [
         NOTES[(rootIdx + 3) % 12] + 'Maj (bIII)',
         NOTES[(rootIdx + 5) % 12] + 'min (iv)',
         NOTES[(rootIdx + 8) % 12] + 'Maj (bVI)',
         NOTES[(rootIdx + 10) % 12] + 'Maj (bVII)',
       ];
    } else if (type === 'Scale' && name === 'Minor') {
       secondaryDominants = [
         NOTES[(rootIdx + 0) % 12] + '7 (V/iv)',
         NOTES[(rootIdx + 2) % 12] + '7 (V/v)',
         NOTES[(rootIdx + 8) % 12] + '7 (V/bVI)',
         NOTES[(rootIdx + 10) % 12] + '7 (V/bVII)',
       ];
       modalInterchange = [
         NOTES[(rootIdx + 0) % 12] + 'Maj (I)',
         NOTES[(rootIdx + 5) % 12] + 'Maj (IV)',
       ];
    }
    return { secondaryDominants, modalInterchange };
  });

  // Calculate generic board
  allNotesFretboard = computed(() => {
    const rootIdx = NOTES.indexOf(this.effectiveRoot());
    const intervals = this.activeIntervals();
    const tuning = TUNINGS[this.selectedTuning()] || TUNINGS['Standard'];
    const maxFret = this.fretRange();
    
    return tuning.map((stringTune, stringIdx) => {
      const startNoteIdx = NOTES.indexOf(stringTune.note);
      let currentOctave = stringTune.octave;
      
      const stringNotes: FretNote[] = [];
      for (let fret = 0; fret <= maxFret; fret++) {
        const noteIdx = (startNoteIdx + fret) % 12;
        if (fret > 0 && noteIdx === 0) {
          currentOctave++;
        }
        
        let distance = noteIdx - rootIdx;
        if (distance < 0) distance += 12;
        
        const isIncluded = intervals.includes(distance);
        stringNotes.push({
          note: NOTES[noteIdx],
          octave: currentOctave,
          interval: isIncluded ? distance : null,
          fret,
          stringIdx
        });
      }
      return stringNotes;
    });
  });

  // Generated voicings
  generatedVoicings = computed(() => {
    if (this.selectedType() !== 'Chord') return [];
    
    const typeName = this.effectiveChordName();
    const shapes = STANDARD_SHAPES[typeName] || [];
    
    const voicings: Voicing[] = [];
    const rootNote = this.effectiveRoot();
    const maxFretLimit = this.fretRange();
    
    const curTuning = TUNINGS[this.selectedTuning()] || TUNINGS['Standard'];
    const stdTuning = TUNINGS['Standard'];

    for (const shape of shapes) {
        const stdStringNote = stdTuning[shape.rootString].note;
        const stdNoteIdx = NOTES.indexOf(stdStringNote);
        const targetNoteIdx = NOTES.indexOf(rootNote);
        
        let targetRootFret = targetNoteIdx - stdNoteIdx;
        if (targetRootFret < 0) targetRootFret += 12;
        
        while (targetRootFret < shape.rootFretInShape) {
            targetRootFret += 12;
        }
        
        const shift = targetRootFret - shape.rootFretInShape;
        if (shift < 0) continue;
        
        let valid = true;
        const absoluteFrets: (number | null)[] = [null, null, null, null, null, null];
        
        for (let i = 0; i < 6; i++) {
           let fretDef = shape.frets[i];
           if (fretDef === null) {
               absoluteFrets[i] = null;
           } else {
               let finalFret = fretDef + shift;
               const sIdx = NOTES.indexOf(stdTuning[i].note);
               const cIdx = NOTES.indexOf(curTuning[i].note);
               let delta = sIdx - cIdx;
               
               if (delta < -6) delta += 12; 
               if (delta > 6) delta -= 12;
               
               finalFret += delta;
               
               if (finalFret > maxFretLimit || finalFret < 0) valid = false;
               absoluteFrets[i] = finalFret;
           }
        }
        
        if (valid) {
           const sig = absoluteFrets.join(',');
           if (!voicings.some(v => v.frets.join(',') === sig)) {
              voicings.push({ 
                  frets: absoluteFrets,
                  fingers: this.generateFingers(absoluteFrets)
              });
           }
        }
    }
    
    if (voicings.length === 0) voicings.push({ frets: [0, 0, 0, 0, 0, 0], fingers: [null, null, null, null, null, null] });
    
    voicings.sort((a, b) => {
      const minFret = (v: Voicing) => {
        const pressed = v.frets.filter((f): f is number => f !== null && f > 0);
        return pressed.length > 0 ? Math.min(...pressed) : 0;
      };
      return minFret(a) - minFret(b);
    });

    return voicings;
  });

  private generateFingers(frets: (number | null)[]): (number | null)[] {
    const fingers: (number | null)[] = [null, null, null, null, null, null];
    const played = frets
      .map((f, i) => ({ fret: f, sIdx: i }))
      .filter(x => x.fret !== null && x.fret > 0)
      .sort((a, b) => {
         if (a.fret !== b.fret) return a.fret! - b.fret!;
         return b.sIdx - a.sIdx; 
      });
      
    if (played.length === 0) return fingers;
    
    let currentFinger = 1;
    let minFret = played[0].fret;
    const minFretItems = played.filter(x => x.fret === minFret);
    const isBarre = minFretItems.length > 1; 
    
    for (const item of played) {
        if (isBarre && item.fret === minFret) {
            fingers[item.sIdx] = 1;
        } else {
            if (isBarre && currentFinger === 1) currentFinger = 2; 
            fingers[item.sIdx] = currentFinger;
            currentFinger++;
        }
    }
    return fingers;
  }

  getFrequency(note: string, octave: number): string {
    return `${note}${octave}`;
  }

  // The active board output for the component
  visibleFretboard = computed(() => {
     let board = this.allNotesFretboard();
     
     if (this.selectedType() === 'Scale') {
         // Show all notes in scale
         return board;
     } else {
         // Show specific voicing only
         const voicings = this.generatedVoicings();
         let idx = this.selectedVoicingIndex();
         if (idx >= voicings.length) idx = 0;
         const currentVoicing = voicings[idx];
         
         if (!currentVoicing) return board;

         // Map board to mask out non-voicing notes
         return board.map((stringList, sIdx) => {
             return stringList.map(noteInfo => {
                  const targetFret = currentVoicing.frets[sIdx];
                  if (targetFret === noteInfo.fret && targetFret !== null) {
                      return { ...noteInfo, finger: currentVoicing.fingers[sIdx] || undefined }; // keep note visible
                  }
                  return { ...noteInfo, interval: null, finger: undefined }; // mask it out
             });
         });
     }
  });

  // Helper to parse progression formula
  resolveProgressionChords(rootNote: string, formula: string): { roman: string; note: string; quality: string; chordName: string }[] {
    if (!formula) return [];
    const rootIdx = NOTES.indexOf(rootNote);
    const degrees = formula.split(/\s*[–\-]\s*/).map(d => d.trim()).filter(Boolean);

    const qualityToName: Record<string, string> = {
      '':    'Major',
      'm':   'Minor',
      'dim': 'Diminished',
    };

    return degrees.map(roman => {
      const entry = ROMAN_MAP[roman];
      if (!entry) return { roman, note: roman, quality: '', chordName: 'Major' };
      const noteIdx = (rootIdx + entry.offset) % 12;
      return { 
        roman, 
        note: NOTES[noteIdx], 
        quality: entry.quality,
        chordName: qualityToName[entry.quality] ?? 'Major'
      };
    });
  }

  getShapesForChord(chordName: string) {
    return STANDARD_SHAPES[chordName] || [];
  }

  currentCagedShape(): string | null {
    const chordName = this.effectiveChordName();
    const shapes = this.getShapesForChord(chordName);
    const idx = this.selectedVoicingIndex();
    const shape = shapes[idx];
    if (!shape) return null;
    if (shape.name.includes('E-Shape')) return 'E';
    if (shape.name.includes('A-Shape')) return 'A';
    if (shape.name.includes('G-Shape')) return 'G';
    if (shape.name.includes('D-Shape')) return 'D';
    if (shape.name.includes('C-Shape')) return 'C';
    return null;
  }
}
