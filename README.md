# 🎸 Rob's Guitar Tool

Welcome to **Rob's Guitar Tool**, a high-performance, interactive guitar theory workstation designed for songwriters, learners, and teachers. Built with modern web technologies, it provides a "studio-first" experience for mapping out the fretboard and exploring musical theory.

## ✨ Key Features

### 🎹 Interactive Fretboard
- **Dynamic Note Mapping**: Visualize all notes or intervals (R, 3, 5, etc.) in any key.
- **CAGED System Integration**: Instantly view and jump between all 5 CAGED shapes for any chord.
- **Physical Accuracy**: 22-fret neck with realistic marker positions and string gauges.
- **Audio Feedback**: Powered by Tone.js—click any note to hear it, or use the **Strum** button to play the entire voicing.

### 🥁 Drum Rhythm Machine & Metronome
- **7 Musical Styles**: Built-in drum sequencer with styles including Rock, Blues, Pop, Ballad, Hard Rock, Reggae, and Heavy.
- **High-Fidelity Metronome**: Precise electronic click with adjustable time signatures and accent logic.
- **The Mixer**: Independent volume sliders for balancing the metronome click against the drum patterns.
- **Visual Sync**: Real-time beat indicators synced across audio and UI.

### ⌨️ Keyboard Shortcuts (Power User Features)
- **`M`**: Start/Stop the global metronome and drum playback.
- **`C, D, E, F, G, A, B`**: Fast-switch the root note of the entire application.
- *Safety*: Shortcuts are automatically disabled when typing in input fields.

### 📚 Theory & Composition
- **Composition Helpers**: Secondary dominants and modal interchange suggestions in scale mode.
- **Songwriting Progressions**: A library of 10 musical styles (Rock, Jazz, Grunge, etc.) that resolve formulas into actual note names.
- **Theory References**: Persistent reference panels for the CAGED System and Neck Sequences.
- **Circle of Fifths**: A toggleable visual reference for key relationships Tip: Persists across sessions.

### 🛠️ Advanced Controls
- **Specialized Tunings**: Support for Standard, Drop D, and dedicated **Lap Steel** tunings (C6, Open G, Open D).
- **Voicing Engine**: Cycles through the best fingerings across the neck for any chord.
- **100% Persistence**: Every single setting—from mixer volumes to panel visibility—is automatically saved to `localStorage`.

## 🚀 Tech Stack

- **Framework**: [Angular 21](https://angular.dev/) (utilizing Signals & Standalone Components)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Audio**: [Tone.js](https://tonejs.github.io/)
- **State**: Native Angular Signal-based state management with Persistence Effect.

## 📦 Getting Started

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Robfeb/guitartool.git
   cd guitartool
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm start
   ```

4. Open [http://localhost:4200](http://localhost:4200) in your browser.

## 📖 How to Use

1. **Pick a Key**: Use the `C` through `B` keys on your keyboard to quickly switch roots.
2. **Start a Groove**: Toggle the Metronome panel, pick a Drum Rhythm (e.g., 'Reggae'), and hit Play (or press `M`).
3. **Explore Progressions**: Open the "Songwriting Progressions" sections and click a chord button to preview it on the fretboard.
4. **Master the Theory**: Toggle the "CAGED Reference" or "Neck Sequences" at the bottom of the page to keep theory essentials in view.
5. **Set Your Balance**: Use the Mixer sliders in the Metronome panel to blend the click and drum volume to your liking.

---

*Designed with ❤️ for Guitarists.*
