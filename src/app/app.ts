import { Component, effect, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ControlPanelComponent } from './components/control-panel/control-panel.component';
import { FretboardComponent } from './components/fretboard/fretboard.component';
import { CircleOfFifthsComponent } from './components/circle-of-fifths/circle-of-fifths.component';

@Component({
  selector: 'app-root',
  imports: [CommonModule, ControlPanelComponent, FretboardComponent, CircleOfFifthsComponent],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  title = 'guitartool';
  showCircle = signal(false);
  isDarkMode = signal(true);

  constructor() {
     effect(() => {
        if (this.isDarkMode()) {
           document.documentElement.classList.add('dark');
        } else {
           document.documentElement.classList.remove('dark');
        }
     });
  }
}

