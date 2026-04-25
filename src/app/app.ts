import { Component, effect, inject, HostListener, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlPanelComponent } from './components/control-panel/control-panel.component';
import { FretboardComponent } from './components/fretboard/fretboard.component';
import { CircleOfFifthsComponent } from './components/circle-of-fifths/circle-of-fifths.component';
import { MetronomeComponent } from './components/metronome/metronome.component';
import { GameSongComponent } from './components/games/game-song.component';
import { GameFlashcardComponent } from './components/games/game-flashcard.component';
import { TutorialComponent } from './components/tutorial/tutorial.component';
import { TheoryService } from './services/theory.service';
import { TranslationService } from './services/translation.service';
import * as Tone from 'tone';

@Component({
  selector: 'app-root',
  imports: [CommonModule, ControlPanelComponent, FretboardComponent, CircleOfFifthsComponent, MetronomeComponent, GameSongComponent, GameFlashcardComponent, TutorialComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  theory = inject(TheoryService);
  lang = inject(TranslationService);
  menuOpen = signal(false);

  // Global click listener to ensure Tone.js starts on first interaction (required for iOS)
  @HostListener('document:click')
  async onFirstInteraction() {
    if (Tone.context.state !== 'running') {
      await Tone.start();
      console.log('Tone.js started');
    }
  }

  @HostListener('window:keydown', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    // Ignore if typing in an input or select
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'SELECT' || target.tagName === 'TEXTAREA') {
      return;
    }

    const key = event.key.toLowerCase();
    
    // Toggle Metronome
    if (key === 'm') {
      this.theory.metronomeIsPlaying.set(!this.theory.metronomeIsPlaying());
    }

    // Toggle Metronome
    if (key === 'm') {
      this.theory.metronomeIsPlaying.set(!this.theory.metronomeIsPlaying());
    }
  }

  constructor() {
     effect(() => {
        if (this.theory.isDarkMode()) {
           document.documentElement.classList.add('dark');
        } else {
           document.documentElement.classList.remove('dark');
        }
     });
  }
}

