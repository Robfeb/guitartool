import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MetronomeComponent } from './metronome.component';
import { TheoryService } from '../../services/theory.service';
import { TranslationService } from '../../services/translation.service';
import { signal } from '@angular/core';

class MockSynth {
  toDestination() { return this; }
  triggerAttackRelease() {}
  triggerAttack() {}
  connect() { return this; }
  volume = { value: 0 };
  dispose() {}
}

class MockFilter {
  toDestination() { return this; }
  dispose() {}
}

class MockLoop {
  constructor(callback: any, interval: any) {}
  start() { return this; }
  stop() {}
  dispose() {}
}

vi.mock('tone', () => {
  return {
    gainToDb: vi.fn((val) => val * 10),
    Transport: {
      bpm: { value: 120 },
      start: vi.fn(),
      stop: vi.fn(),
    },
    context: {
      state: 'suspended',
    },
    start: vi.fn().mockResolvedValue(undefined),
    MembraneSynth: vi.fn().mockImplementation(function() { return new MockSynth() }),
    NoiseSynth: vi.fn().mockImplementation(function() { return new MockSynth() }),
    Filter: vi.fn().mockImplementation(function() { return new MockFilter() }),
    Loop: vi.fn().mockImplementation(function(c, i) { return new MockLoop(c, i) }),
  };
});

import * as Tone from 'tone';

describe('MetronomeComponent', () => {
  let component: MetronomeComponent;
  let fixture: ComponentFixture<MetronomeComponent>;
  let mockTheoryService: any;
  let mockTranslationService: any;

  beforeEach(async () => {
    mockTheoryService = {
      metronomeIsPlaying: signal(false),
      metronomeTempo: signal(120),
      metronomeVolume: signal(0.8),
      drumsVolume: signal(0.7),
      metronomeBeats: signal(4),
      selectedDrumStyle: signal('STYLE_NONE'),
      metronomeClickEnabled: signal(true),
      metronomeHasAccent: signal(true),
    };

    mockTranslationService = {
      t: vi.fn((key: string) => key),
    };

    await TestBed.configureTestingModule({
      imports: [MetronomeComponent],
      providers: [
        { provide: TheoryService, useValue: mockTheoryService },
        { provide: TranslationService, useValue: mockTranslationService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(MetronomeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should toggle play state and start Tone if context is not running', async () => {
    expect(mockTheoryService.metronomeIsPlaying()).toBe(false);

    await component.togglePlay();

    expect(Tone.start).toHaveBeenCalled();
    expect(mockTheoryService.metronomeIsPlaying()).toBe(true);
  });

  it('should update tempo correctly', () => {
    component.adjustTempo(5);
    expect(mockTheoryService.metronomeTempo()).toBe(125);

    component.adjustTempo(-10);
    expect(mockTheoryService.metronomeTempo()).toBe(115);

    // Bounds checking
    component.updateTempo(300);
    expect(mockTheoryService.metronomeTempo()).toBe(240); // max is 240

    component.updateTempo(5);
    expect(mockTheoryService.metronomeTempo()).toBe(10); // min is 10
  });

});
