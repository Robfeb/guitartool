import { Component, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TheoryService } from '../../services/theory.service';
import { TranslationService } from '../../services/translation.service';

@Component({
  selector: 'app-tutorial',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div *ngIf="theory.showTutorial()" class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm transition-opacity">
      <div class="bg-studio-dark border border-gray-700 rounded-2xl shadow-2xl max-w-xl w-full overflow-hidden flex flex-col">
        
        <!-- Header -->
        <div class="bg-gray-900 p-4 border-b border-gray-800 flex justify-between items-center">
          <h2 class="text-white font-bold tracking-widest uppercase">{{ lang.t('TUTORIAL') }}</h2>
          <button (click)="close()" class="text-gray-500 hover:text-white transition w-8 h-8 rounded-full bg-gray-800 flex items-center justify-center">✕</button>
        </div>

        <!-- Content Carousel -->
        <div class="p-6 md:p-8 flex-grow relative overflow-hidden min-h-[250px]">
          <div class="flex transition-transform duration-500 ease-in-out h-full" [style.transform]="'translateX(-' + (currentStep() * 100) + '%)'">
            
            <!-- Step 1: Welcome -->
            <div class="w-full flex-shrink-0 px-4 flex flex-col justify-center items-center text-center">
               <div class="w-16 h-16 bg-gradient-to-br from-highlight to-blue-800 rounded-full flex items-center justify-center mb-6 shadow-[0_0_20px_rgba(59,130,246,0.3)]">
                  <span class="text-white text-3xl">🎸</span>
               </div>
               <h3 class="text-2xl font-black text-white mb-2 font-mono">Guitar Tool</h3>
               <p class="text-gray-400 leading-relaxed">{{ lang.t('TUTORIAL_WELCOME') }}</p>
            </div>

            <!-- Step 2: Metronome -->
            <div class="w-full flex-shrink-0 px-4 flex flex-col justify-center text-center">
               <div class="text-4xl mb-4">⏱️</div>
               <h3 class="text-xl font-bold text-white mb-2 uppercase tracking-wide">{{ lang.t('METRONOME') }}</h3>
               <p class="text-gray-400 leading-relaxed">{{ lang.t('TUTORIAL_METRONOME') }}</p>
            </div>

            <!-- Step 3: Fretboard -->
            <div class="w-full flex-shrink-0 px-4 flex flex-col justify-center text-center">
               <div class="text-4xl mb-4">🎼</div>
               <h3 class="text-xl font-bold text-white mb-2 uppercase tracking-wide">{{ lang.t('FRETBOARD') }}</h3>
               <p class="text-gray-400 leading-relaxed">{{ lang.t('TUTORIAL_FRETBOARD') }}</p>
            </div>

            <!-- Step 4: CAGED -->
            <div class="w-full flex-shrink-0 px-4 flex flex-col justify-center text-center">
               <div class="text-4xl mb-4">📦</div>
               <h3 class="text-xl font-bold text-white mb-2 uppercase tracking-wide">{{ lang.t('CAGED_SYSTEM') }}</h3>
               <p class="text-gray-400 leading-relaxed">{{ lang.t('TUTORIAL_CAGED') }}</p>
            </div>

            <!-- Step 5: Games -->
            <div class="w-full flex-shrink-0 px-4 flex flex-col justify-center text-center">
               <div class="text-4xl mb-4">🎮</div>
               <h3 class="text-xl font-bold text-highlight mb-2 uppercase tracking-wide">{{ lang.t('GAMES') }}</h3>
               <p class="text-gray-400 leading-relaxed">{{ lang.t('TUTORIAL_GAMES') }}</p>
            </div>

          </div>
        </div>

        <!-- Footer / Navigation -->
        <div class="p-4 border-t border-gray-800 bg-gray-900 flex justify-between items-center">
          <div class="flex gap-2">
            <div *ngFor="let step of steps; let i = index" 
                 class="w-2.5 h-2.5 rounded-full transition-colors"
                 [ngClass]="i === currentStep() ? 'bg-highlight' : 'bg-gray-700'">
            </div>
          </div>
          
          <div class="flex gap-3">
             <button *ngIf="currentStep() > 0" (click)="prev()" class="px-4 py-2 text-sm font-bold text-gray-400 hover:text-white uppercase tracking-wider">
               {{ lang.t('PREV') }}
             </button>
             <button *ngIf="currentStep() < steps.length - 1" (click)="next()" class="px-6 py-2 bg-highlight hover:bg-blue-500 text-white text-sm font-bold rounded uppercase tracking-wider shadow-lg">
               {{ lang.t('NEXT') }}
             </button>
             <button *ngIf="currentStep() === steps.length - 1" (click)="close()" class="px-6 py-2 bg-green-600 hover:bg-green-500 text-white text-sm font-bold rounded uppercase tracking-wider shadow-lg">
               {{ lang.t('START') }}
             </button>
          </div>
        </div>

      </div>
    </div>
  `
})
export class TutorialComponent {
  theory = inject(TheoryService);
  lang = inject(TranslationService);
  
  currentStep = signal(0);
  steps = [0, 1, 2, 3, 4]; // 5 steps

  @HostListener('window:keydown.escape')
  onEscape() {
    this.close();
  }

  next() {
    if (this.currentStep() < this.steps.length - 1) {
      this.currentStep.update(v => v + 1);
    }
  }

  prev() {
    if (this.currentStep() > 0) {
      this.currentStep.update(v => v - 1);
    }
  }

  close() {
    this.theory.showTutorial.set(false);
    this.theory.tutorialCompleted.set(true);
  }
}
