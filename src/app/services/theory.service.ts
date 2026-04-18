import { Injectable, computed, signal, effect } from '@angular/core';

export const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];

export type TuningDef = { note: string; octave: number }[];
export const TUNINGS: Record<string, TuningDef> = {
  'Standard': [
    { note: 'E', octave: 4 }, { note: 'B', octave: 3 }, { note: 'G', octave: 3 },
    { note: 'D', octave: 3 }, { note: 'A', octave: 2 }, { note: 'E', octave: 2 }
  ],
  'Drop D': [
    { note: 'E', octave: 4 }, { note: 'B', octave: 3 }, { note: 'G', octave: 3 },
    { note: 'D', octave: 3 }, { note: 'A', octave: 2 }, { note: 'D', octave: 2 }
  ],
  'Open D': [
    { note: 'D', octave: 4 }, { note: 'A', octave: 3 }, { note: 'F#', octave: 3 },
    { note: 'D', octave: 3 }, { note: 'A', octave: 2 }, { note: 'D', octave: 2 }
  ],
  'Open G': [
    { note: 'D', octave: 4 }, { note: 'B', octave: 3 }, { note: 'G', octave: 3 },
    { note: 'D', octave: 3 }, { note: 'G', octave: 2 }, { note: 'D', octave: 2 }
  ]
};

export const SCALES: Record<string, number[]> = {
  'Major': [0, 2, 4, 5, 7, 9, 11],
  'Minor': [0, 2, 3, 5, 7, 8, 10],
  'Pentatonic Major': [0, 2, 4, 7, 9],
  'Pentatonic Minor': [0, 3, 5, 7, 10],
  'Dorian': [0, 2, 3, 5, 7, 9, 10],
  'Mixolydian': [0, 2, 4, 5, 7, 9, 10],
  'Lydian': [0, 2, 4, 6, 7, 9, 11]
};

export const CHORDS: Record<string, number[]> = {
  'Major': [0, 4, 7],
  'Minor': [0, 3, 7],
  'Diminished': [0, 3, 6],
  'Augmented': [0, 4, 8],
  'Major 7th': [0, 4, 7, 11],
  'Minor 7th': [0, 3, 7, 10],
  'Dominant 7th': [0, 4, 7, 10],
  'Sus 4': [0, 5, 7]
};

export const CHORD_PROGRESSIONS: Record<string, { formula: string; description: string }> = {
  'Rock/Blues':      { formula: 'I – IV – V',          description: 'The backbone of rock and blues. Raw, powerful, and universally recognised.' },
  'Pop':             { formula: 'I – V – vi – IV',      description: 'The most popular chord progression of the modern era. Uplifting and anthemic.' },
  'Doo-wop':         { formula: 'I – vi – IV – V',      description: 'Classic 50s/60s sound. Nostalgic, smooth, and romantic.' },
  'Country':         { formula: 'IV – iii – ii – I',    description: 'A descending movement common in country and folk ballads. Melancholic resolve.' },
  'Jazz':            { formula: 'ii – V – I',           description: 'The foundational jazz turnaround. Moves from subdominant to dominant to tonic, creating strong harmonic pull.' },
  'Rock':            { formula: 'vi – IV – I',          description: 'Minor-rooted rock anthem feel. Dark, anthemic, and very modern.' },
  'Folk-rock':       { formula: 'I – II – IV – V',      description: 'Bright and driving with an upward surge. Common in folk-rock and indie music.' },
  'Southern Rock':   { formula: 'I – bVII – IV',        description: 'The signature Southern Rock sound. The flat-VII gives a bluesy Mixolydian flavour.' },
  'Rock Alternativo':{ formula: 'IV – I – III – vi',    description: 'Unexpected movement through major and minor. Creates a cinematic, unexpected tension.' },
  'Grunge':          { formula: 'I – III – IV – iv',    description: 'The iv (minor IV) creates a dark, brooding colour. A hallmark of grunge and alternative rock.' },
};

export interface FretNote {
  note: string;
  octave: number;
  interval: number | null; 
  fret: number;
  stringIdx: number;
  finger?: number;
}

export interface Voicing {
  frets: (number | null)[]; // Array of 6 numbers (or null for muted string)
  fingers: (number | null)[]; // Array of 6 numbers (1-4) or null
}

export interface ChordShape {
    name: string;
    frets: (number | null)[];  // index 0=high e .. 5=low E
    rootString: number;        
    rootFretInShape: number;
}

export const STANDARD_SHAPES: Record<string, ChordShape[]> = {
  'Major': [
    { name: 'E-Shape', frets: [0, 0, 1, 2, 2, 0], rootString: 5, rootFretInShape: 0 },
    { name: 'A-Shape', frets: [0, 2, 2, 2, 0, null], rootString: 4, rootFretInShape: 0 },
    { name: 'D-Shape', frets: [2, 3, 2, 0, null, null], rootString: 3, rootFretInShape: 0 },
    { name: 'C-Shape', frets: [0, 1, 0, 2, 3, null], rootString: 4, rootFretInShape: 3 },
    { name: 'G-Shape', frets: [3, 0, 0, 0, 2, 3], rootString: 5, rootFretInShape: 3 },
  ],
  'Minor': [
    { name: 'E-Shape (Minor)', frets: [0, 0, 0, 2, 2, 0], rootString: 5, rootFretInShape: 0 },
    { name: 'A-Shape (Minor)', frets: [0, 1, 2, 2, 0, null], rootString: 4, rootFretInShape: 0 },
    { name: 'D-Shape (Minor)', frets: [1, 3, 2, 0, null, null], rootString: 3, rootFretInShape: 0 },
    { name: 'C-Shape (Minor)', frets: [null, 1, 0, 1, 3, null], rootString: 4, rootFretInShape: 3 },
    { name: 'G-Shape (Minor)', frets: [3, null, 0, 0, 1, 3], rootString: 5, rootFretInShape: 3 },
  ],
  'Major 7th': [
    { name: 'E-Shape', frets: [0, 0, 1, 1, 2, 0], rootString: 5, rootFretInShape: 0 },
    { name: 'A-Shape', frets: [0, 2, 1, 2, 0, null], rootString: 4, rootFretInShape: 0 },
    { name: 'D-Shape', frets: [2, 2, 2, 0, null, null], rootString: 3, rootFretInShape: 0 },
    { name: 'C-Shape', frets: [0, 0, 0, 2, 3, null], rootString: 4, rootFretInShape: 3 },
    { name: 'G-Shape', frets: [2, 0, 0, 0, 2, 3], rootString: 5, rootFretInShape: 3 },
  ],
  'Minor 7th': [
    { name: 'E-Shape', frets: [0, 3, 0, 2, 2, 0], rootString: 5, rootFretInShape: 0 },
    { name: 'A-Shape', frets: [0, 1, 0, 2, 0, null], rootString: 4, rootFretInShape: 0 },
    { name: 'D-Shape', frets: [1, 1, 2, 0, null, null], rootString: 3, rootFretInShape: 0 },
    { name: 'C-Shape', frets: [null, 1, 3, 1, 3, null], rootString: 4, rootFretInShape: 3 },
    { name: 'G-Shape', frets: [1, null, 0, 0, 1, 3], rootString: 5, rootFretInShape: 3 },
  ],
  'Dominant 7th': [
    { name: 'E-Shape', frets: [0, 0, 1, 0, 2, 0], rootString: 5, rootFretInShape: 0 },
    { name: 'A-Shape', frets: [0, 2, 0, 2, 0, null], rootString: 4, rootFretInShape: 0 },
    { name: 'D-Shape', frets: [2, 1, 2, 0, null, null], rootString: 3, rootFretInShape: 0 },
    { name: 'C-Shape', frets: [0, 1, 3, 2, 3, null], rootString: 4, rootFretInShape: 3 },
    { name: 'G-Shape', frets: [1, 0, 0, 0, 2, 3], rootString: 5, rootFretInShape: 3 },
  ],
  'Sus 4': [
    { name: 'E-Shape', frets: [0, 0, 2, 2, 2, 0], rootString: 5, rootFretInShape: 0 },
    { name: 'A-Shape', frets: [0, 3, 2, 2, 0, null], rootString: 4, rootFretInShape: 0 },
    { name: 'D-Shape', frets: [3, 3, 2, 0, null, null], rootString: 3, rootFretInShape: 0 },
    { name: 'C-Shape', frets: [null, 1, 0, 3, 3, null], rootString: 4, rootFretInShape: 3 },
  ],
  'Diminished': [
    { name: 'A-Shape', frets: [null, 1, 2, 1, 0, null], rootString: 4, rootFretInShape: 0 },
    { name: 'D-Shape', frets: [1, 3, 1, 0, null, null], rootString: 3, rootFretInShape: 0 },
  ],
  'Augmented': [
    { name: 'A-Shape', frets: [1, 2, 2, 3, 0, null], rootString: 4, rootFretInShape: 0 },
    { name: 'D-Shape', frets: [2, 3, 3, 0, null, null], rootString: 3, rootFretInShape: 0 },
  ]
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

  // Preview signals: set by Songwriting Progressions chord buttons.
  // When non-null, the fretboard shows this chord WITHOUT changing the root note selector.
  previewRoot = signal<string | null>(null);
  previewChordName = signal<string | null>(null);

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
      } catch (e) {
        console.error('Failed to load state', e);
      }
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
        selectedProgressionStyle: this.selectedProgressionStyle()
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

  // Calculate generic board (uses effectiveRoot so preview works independently)
  allNotesFretboard = computed(() => {
    const rootIdx = NOTES.indexOf(this.effectiveRoot());
    const intervals = this.activeIntervals();
    const tuning = TUNINGS[this.selectedTuning()] || TUNINGS['Standard'];
    
    return tuning.map((stringTune, stringIdx) => {
      const startNoteIdx = NOTES.indexOf(stringTune.note);
      let currentOctave = stringTune.octave;
      
      const stringNotes: FretNote[] = [];
      for (let fret = 0; fret <= 22; fret++) {
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

  // Generated voicings (uses effectiveRoot + effectiveChordName)
  generatedVoicings = computed(() => {
    if (this.selectedType() !== 'Chord') return [];
    
    const typeName = this.effectiveChordName();
    const shapes = STANDARD_SHAPES[typeName] || [];
    
    const voicings: Voicing[] = [];
    const rootNote = this.effectiveRoot();
    
    const curTuning = TUNINGS[this.selectedTuning()] || TUNINGS['Standard'];
    const stdTuning = TUNINGS['Standard'];

    for (const shape of shapes) {
       // Find standard tuning root mathematically:
       const stdStringNote = stdTuning[shape.rootString].note;
       const stdNoteIdx = NOTES.indexOf(stdStringNote);
       const targetNoteIdx = NOTES.indexOf(rootNote);
       
       let targetRootFret = targetNoteIdx - stdNoteIdx;
       if (targetRootFret < 0) targetRootFret += 12;
       
       // Ensure targetRootFret is above or equal to shape's base root fret
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
              // Standard fret position
              let finalFret = fretDef + shift;
              
              // Calculate delta for the current tuning
              const sIdx = NOTES.indexOf(stdTuning[i].note);
              const cIdx = NOTES.indexOf(curTuning[i].note);
              let delta = sIdx - cIdx;
              
              // If standard is E (4), current is D (2). Delta = +2. We need to fret 2 frets higher!
              if (delta < -6) delta += 12; 
              if (delta > 6) delta -= 12;
              
              finalFret += delta;
              
              if (finalFret > 22 || finalFret < 0) valid = false;
              absoluteFrets[i] = finalFret;
          }
       }
       
       if (valid) {
          // Remove duplicate signatures
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
    
    // Sort by lowest fret position (open/nut shapes first, higher neck shapes last)
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
    
    // get playable non-open frets
    const played = frets
      .map((f, i) => ({ fret: f, sIdx: i }))
      .filter(x => x.fret !== null && x.fret > 0)
      .sort((a, b) => {
         if (a.fret !== b.fret) return a.fret! - b.fret!;
         return b.sIdx - a.sIdx; // descending string index (lowest pitch first)
      });
      
    if (played.length === 0) return fingers;
    
    let currentFinger = 1;
    let minFret = played[0].fret;
    
    // Check if minFret covers multiple strings = barre
    const minFretItems = played.filter(x => x.fret === minFret);
    const isBarre = minFretItems.length > 1; 
    
    for (const item of played) {
       if (isBarre && item.fret === minFret) {
           fingers[item.sIdx] = 1;
       } else {
           if (isBarre && currentFinger === 1) currentFinger = 2; // advance finger
           fingers[item.sIdx] = currentFinger;
           currentFinger++;
       }
    }
    
    return fingers;
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

  getFrequency(note: string, octave: number): string {
    return `${note}${octave}`;
  }
}
