import { Injectable, signal, computed, inject } from '@angular/core';
import { TheoryService } from './theory.service';

export type Lang = 'en' | 'es';

@Injectable({
  providedIn: 'root'
})
export class TranslationService {
  private theory = inject(TheoryService);

  // currentLang is now a signal that reflects the source of truth in TheoryService
  currentLang = signal<Lang>('en');

  private dict: Record<Lang, Record<string, string>> = {
    en: {
      APP_TITLE: "Rob's Guitar Tool",
      APP_SUBTITLE: "Interactive Fretboard & Theory",
      METRONOME: "Metronome",
      CIRCLE_OF_FIFTHS: "Circle of Fifths",
      FRETBOARD: "Fretboard",
      KEY: "Key",
      MODE: "Mode",
      SELECT_KEY: "Select Key",
      SCALE: "Scale",
      CHORD: "Chord",
      TUNING: "Tuning",
      VOICING: "Voicing",
      PATTERN: "Pattern",
      FINGERS: "Fingers",
      NOTES: "Notes",
      STRUM: "Strum Chord",
      IN_KEY: "In Key",
      TEMPO: "Tempo",
      PRESETS: "Presets",
      CLICK: "Click",
      DRUMS: "Drums",
      ACCENT: "Accent",
      RHYTHM: "Rhythm",
      DRUM_RHYTHM: "Drum Rhythm",
      CAGED_SYSTEM: "CAGED System",
      SONGWRITING: "Songwriting Progressions",
      THEORY: "Theory",
      POSITIONS: "positions",
      SEQUENCE: "Sequence on the neck",
      HIDE: "Hide",
      SHOW: "Show",
      REFERENCE: "Reference",
      FRETS: "Frets",
      // Notes
      "C": "C", "C#": "C#", "D": "D", "D#": "D#", "E": "E", "F": "F", "F#": "F#", "G": "G", "G#": "G#", "A": "A", "A#": "A#", "B": "B",
      // Theory Specifics
      MAJOR: "Major",
      MINOR: "Minor",
      DIMINISHED: "Diminished",
      AUGMENTED: "Augmented",
      MAJOR_7TH: "Major 7th",
      MINOR_7TH: "Minor 7th",
      DOMINANT_7TH: "Dominant 7th",
      SUS_4: "Sus 4",
      PENTATONIC_MAJOR: "Pentatonic Major",
      PENTATONIC_MINOR: "Pentatonic Minor",
      DORIAN: "Dorian",
      MIXOLYDIAN: "Mixolydian",
      LYDIAN: "Lydian",
      // Progressions
      DESC_ROCK_BLUES: "The backbone of rock and blues. Raw, powerful, and universally recognised.",
      DESC_POP: "The most popular chord progression of the modern era. Uplifting and anthemic.",
      DESC_DOOWOP: "Classic 50s/60s sound. Nostalgic, smooth, and romantic.",
      DESC_COUNTRY: "A descending movement common in country and folk ballads. Melancholic resolve.",
      DESC_JAZZ: "The foundational jazz turnaround. Moves from subdominant to dominant to tonic, creating strong harmonic pull.",
      DESC_ROCK: "Minor-rooted rock anthem feel. Dark, anthemic, and very modern.",
      DESC_FOLK_ROCK: "Bright and driving with an upward surge. Common in folk-rock and indie music.",
      DESC_SOUTHERN_ROCK: "The signature Southern Rock sound. The flat-VII gives a bluesy Mixolydian flavour.",
      DESC_ALT_ROCK: "Unexpected movement through major and minor. Creates a cinematic, unexpected tension.",
      DESC_GRUNGE: "The iv (minor IV) creates a dark, brooding colour. A hallmark of grunge and alternative rock.",
      // CAGED Info
      DESC_C: "Open C shape. Notes cluster around the 1st-3rd frets.",
      DESC_A: "Open A shape. Root on the A string (5th). Barred up the neck.",
      DESC_G: "Open G shape. Wide stretch, root on low E and high e.",
      DESC_E: "Open E shape. Root on low E string (6th). Most common barre.",
      DESC_D: "Open D shape. Root on the D string (4th). Higher register.",
      CAGED_THEORY_SUM: "The CAGED system maps the entire fretboard using 5 repeating shapes derived from open chord positions: C – A – G – E – D.",
      CAGED_THEORY_LINK: "Each shape interlocks with the next. Learning all 5 for any chord means you can play it anywhere on the neck.",
      SEQUENCE_DESC: "Shapes repeat every 12 frets. Each shape's root links to the next.",
      // Drum Styles
      STYLE_NONE: "None",
      STYLE_ROCK: "Rock",
      STYLE_BLUES: "Blues",
      STYLE_POP: "Pop",
      STYLE_BALLAD: "Ballad",
      STYLE_HARD_ROCK: "Hard Rock",
      STYLE_REGGAE: "Reggae",
      STYLE_HEAVY: "Heavy",
      // Composition
      SECONDARY_DOMINANTS: "Secondary Dominants",
      MODAL_INTERCHANGE: "Modal Interchange",
      // UI Misc
      PREV: "Prev",
      NEXT: "Next"
    },
    es: {
      APP_TITLE: "Guitar Tool de Rob",
      APP_SUBTITLE: "Diapasón Interactivo y Teoría",
      METRONOME: "Metrónomo",
      CIRCLE_OF_FIFTHS: "Círculo de Quintas",
      FRETBOARD: "Diapasón",
      KEY: "Tono",
      MODE: "Modo",
      SELECT_KEY: "Seleccionar Tono",
      SCALE: "Escala",
      CHORD: "Acorde",
      TUNING: "Afinación",
      VOICING: "Voicing",
      PATTERN: "Patrón",
      FINGERS: "Dedos",
      NOTES: "Notas",
      STRUM: "Rasguear Acorde",
      IN_KEY: "En Tono",
      TEMPO: "Tempo",
      PRESETS: "Ajustes",
      CLICK: "Click",
      DRUMS: "Batería",
      ACCENT: "Acento",
      RHYTHM: "Ritmo",
      DRUM_RHYTHM: "Ritmo de Batería",
      CAGED_SYSTEM: "Sistema CAGED",
      SONGWRITING: "Progresiones de Canciones",
      THEORY: "Teoría",
      POSITIONS: "posiciones",
      SEQUENCE: "Secuencia en el mástil",
      HIDE: "Ocultar",
      SHOW: "Mostrar",
      REFERENCE: "Referencia",
      FRETS: "Trastes",
      // Notes
      "C": "Do", "C#": "Do#", "D": "Re", "D#": "Re#", "E": "Mi", "F": "Fa", "F#": "Fa#", "G": "Sol", "G#": "Sol#", "A": "La", "A#": "La#", "B": "Si",
      // Theory Specifics
      MAJOR: "Mayor",
      MINOR: "Menor",
      DIMINISHED: "Disminuido",
      AUGMENTED: "Aumentado",
      MAJOR_7TH: "Mayor 7ª",
      MINOR_7TH: "Menor 7ª",
      DOMINANT_7TH: "Dominante 7ª",
      SUS_4: "Sus 4",
      PENTATONIC_MAJOR: "Pentatónica Mayor",
      PENTATONIC_MINOR: "Pentatónica Menor",
      DORIAN: "Dórico",
      MIXOLYDIAN: "Mixolidio",
      LYDIAN: "Lidio",
      // Progressions
      DESC_ROCK_BLUES: "La base del rock y el blues. Crudo, potente y universalmente reconocido.",
      DESC_POP: "La progresión de acordes más popular de la era moderna. Optimista y grandiosa.",
      DESC_DOOWOP: "Sonido clásico de los 50/60. Nostálgico, suave y romántico.",
      DESC_COUNTRY: "Un movimiento descendente común en baladas country y folk. Resolución melancólica.",
      DESC_JAZZ: "El giro fundamental del jazz. Se mueve de subdominante a dominante y a tónica, creando una fuerte atracción armónica.",
      DESC_ROCK: "Sensación de himno de rock con raíz menor. Oscuro, grandioso y muy moderno.",
      DESC_FOLK_ROCK: "Brillante y enérgico con un impulso ascendente. Común en el folk-rock y la música indie.",
      DESC_SOUTHERN_ROCK: "El sonido característico del Southern Rock. El bemol-VII aporta un sabor Mixolidio bluesero.",
      DESC_ALT_ROCK: "Movimiento inesperado a través de mayores y menores. Crea una tensión cinematográfica e inesperada.",
      DESC_GRUNGE: "El iv (IV menor) crea un color oscuro y melancólico. Un sello distintivo del grunge y el rock alternativo.",
      // CAGED Info
      DESC_C: "Forma de Do abierto. Las notas se agrupan alrededor de los trastes 1 a 3.",
      DESC_A: "Forma de La abierto. Raíz en la cuerda La (5ª). Cejilla a lo largo del mástil.",
      DESC_G: "Forma de Sol abierto. Gran estiramiento, raíz en Mi bajo y Mi agudo.",
      DESC_E: "Forma de Mi abierto. Raíz en la cuerda Mi bajo (6ª). La cejilla más común.",
      DESC_D: "Forma de Re abierto. Raíz en la cuerda Re (4ª). Registro más agudo.",
      CAGED_THEORY_SUM: "El sistema CAGED mapea todo el diapasón utilizando 5 formas repetitivas derivadas de las posiciones de acordes abiertos: C – A – G – E – D.",
      CAGED_THEORY_LINK: "Cada forma se entrelaza con la siguiente. Aprender las 5 para cualquier acorde significa que puedes tocarlo en cualquier parte del mástil.",
      SEQUENCE_DESC: "Las formas se repiten cada 12 trastes. La raíz de cada forma conecta con la siguiente.",
      // Drum Styles
      STYLE_NONE: "Ninguno",
      STYLE_ROCK: "Rock",
      STYLE_BLUES: "Blues",
      STYLE_POP: "Pop",
      STYLE_BALLAD: "Balada",
      STYLE_HARD_ROCK: "Hard Rock",
      STYLE_REGGAE: "Reggae",
      STYLE_HEAVY: "Heavy",
      // Composition
      SECONDARY_DOMINANTS: "Dominantes Secundarios",
      MODAL_INTERCHANGE: "Intercambio Modal",
      // UI Misc
      PREV: "Ant",
      NEXT: "Sig"
    }
  };

  constructor() {
    // Synchronize with TheoryService currentLang
    this.currentLang = this.theory.currentLang;
  }

  setLanguage(lang: Lang) {
    this.theory.currentLang.set(lang);
  }

  t(key: string): string {
    return this.dict[this.currentLang()][key] || key;
  }
}
