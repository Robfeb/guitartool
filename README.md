# 🎸 Rob's Guitar Tool

Welcome to **Rob's Guitar Tool**, a high-performance, interactive guitar theory workstation designed for songwriters, learners, and teachers. Built with modern web technologies, it provides a "studio-first" experience for mapping out the fretboard and exploring musical theory.

## ✨ Key Features

### 🎹 Interactive Fretboard
- **Dynamic Note Mapping**: Visualize all notes or intervals (R, 3, 5, etc.) in any key.
- **CAGED System Integration**: Instantly view and jump between all 5 CAGED shapes for any chord.
- **Physical Accuracy**: 22-fret neck with realistic marker positions and string gauges.
- **Audio Feedback**: Powered by Tone.js—click any note to hear it, or use the **Strum** button to play the entire voicing.

### 📚 Theory & Composition
- **Chord/Scale Modes**: Switch between scale patterns (Major, Pentatonic, Dorian, etc.) and specific chord voicings.
- **Songwriting Progressions**: A library of 10 musical styles (Rock, Jazz, Grunge, etc.) that resolve formulas into actual note names based on your root note.
- **Circle of Fifths**: A toggleable visual reference for key relationships and theory.
- **Composition Helpers**: Secondary dominants and modal interchange suggestions in scale mode.

### 🛠️ Advanced Controls
- **Alternate Tunings**: Support for Standard, Drop D, Open G, and more.
- **Voicing Engine**: Cycles through the best fingerings across the neck for any chord.
- **Learning Mode**: Toggle between reading note names and musical intervals.
- **State Persistence**: The tool automatically remembers your root note, tuning, and active modules using `localStorage`.

## 🚀 Tech Stack

- **Framework**: [Angular 21](https://angular.dev/) (utilizing Signals & Standalone Components)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **Audio**: [Tone.js](https://tonejs.github.io/)
- **State**: Native Angular Signal-based state management with Persistence Effect.
- **Design**: Modern "Studio Dark" aesthetic with custom CSS glassmorphism.

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

1. **Pick a Root Note**: Select your key from the top-left control panel.
2. **Explore Progressions**: Open the "Songwriting Progressions" sections and click a chord button to preview it on the fretboard.
3. **Master the Neck**: Use the "CAGED System" panel to visualize how a single chord can be played in different shapes across the neck.
4. **Practice Fingerings**: Toggle "Fingers" in the fretboard header to see standard finger positions (1-4) for the active layout.
5. **Reference the Circle**: Toggle the "Circle of Fifths" in the global header for a theoretical overview.

---

*Designed with ❤️ for Guitarists.*
