import { Component, effect, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlPanelComponent } from './components/control-panel/control-panel.component';
import { FretboardComponent } from './components/fretboard/fretboard.component';
import { CircleOfFifthsComponent } from './components/circle-of-fifths/circle-of-fifths.component';
import { MetronomeComponent } from './components/metronome/metronome.component';
import { TheoryService } from './services/theory.service';
import { TranslationService } from './services/translation.service';

@Component({
  selector: 'app-root',
  imports: [CommonModule, ControlPanelComponent, FretboardComponent, CircleOfFifthsComponent, MetronomeComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  theory = inject(TheoryService);
  lang = inject(TranslationService);

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

