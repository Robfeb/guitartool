import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FretboardComponent } from './fretboard.component';
import { TheoryService } from '../../services/theory.service';
import { TranslationService } from '../../services/translation.service';
import * as Tone from 'tone';
import { vi } from 'vitest';

// ESM mock that returns a class properly
vi.mock('tone', () => {
  return {
    start: vi.fn().mockResolvedValue(undefined),
    now: vi.fn().mockReturnValue(0),
    PolySynth: class {
      toDestination() {
        return this;
      }
      triggerAttackRelease = vi.fn();
    },
    Synth: {},
    context: { state: 'suspended' }
  };
});

describe('FretboardComponent', () => {
  let component: FretboardComponent;
  let fixture: ComponentFixture<FretboardComponent>;
  let theoryService: TheoryService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FretboardComponent],
      providers: [TheoryService, TranslationService]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FretboardComponent);
    component = fixture.componentInstance;
    theoryService = TestBed.inject(TheoryService);
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('onTypeChange', () => {
    it('should change type and reset name if not in new options', () => {
      theoryService.selectedType.set('Chord');
      theoryService.selectedName.set('Minor 7th');

      component.onTypeChange('Scale');

      expect(theoryService.selectedType()).toBe('Scale');
      // Minor 7th is not a scale, should default to first option
      const newOptions = component.currentOptions();
      expect(theoryService.selectedName()).toBe(newOptions[0]);
      expect(theoryService.selectedVoicingIndex()).toBe(0);
    });

    it('should change type and keep name if it exists in new options', () => {
      theoryService.selectedType.set('Chord');
      theoryService.selectedName.set('Major');

      component.onTypeChange('Scale');

      expect(theoryService.selectedType()).toBe('Scale');
      // Major is also a scale, should remain Major
      expect(theoryService.selectedName()).toBe('Major');
      expect(theoryService.selectedVoicingIndex()).toBe(0);
    });
  });

  describe('selectName', () => {
    it('should update name and reset voicing index', () => {
      theoryService.selectedVoicingIndex.set(2);
      component.selectName('Minor');

      expect(theoryService.selectedName()).toBe('Minor');
      expect(theoryService.selectedVoicingIndex()).toBe(0);
    });
  });

  describe('handleKeyboardEvent', () => {
    it('should ignore input, select, textarea elements', async () => {
      const input = document.createElement('input');
      const event = new KeyboardEvent('keydown', { key: 'c' });
      Object.defineProperty(event, 'target', { value: input, enumerable: true });

      const spy = vi.spyOn(component, 'playRootFrequency');
      await component.handleKeyboardEvent(event);

      expect(spy).not.toHaveBeenCalled();
    });

    it('should change root note and trigger sound on valid key press', async () => {
      theoryService.selectedType.set('Scale');
      const event = new KeyboardEvent('keydown', { key: 'd' });
      Object.defineProperty(event, 'target', { value: document.body, enumerable: true });

      const playSpy = vi.spyOn(component, 'playRootFrequency').mockResolvedValue();

      await component.handleKeyboardEvent(event);

      expect(theoryService.selectedRoot()).toBe('D');
      expect(theoryService.previewRoot()).toBeNull();
      expect(theoryService.previewChordName()).toBeNull();
      expect(playSpy).toHaveBeenCalledWith('D');
    });

    it('should strum chord if type is Chord', async () => {
      theoryService.selectedType.set('Chord');
      const event = new KeyboardEvent('keydown', { key: 'g' });
      Object.defineProperty(event, 'target', { value: document.body, enumerable: true });

      const strumSpy = vi.spyOn(component, 'strumChord').mockResolvedValue();

      await component.handleKeyboardEvent(event);

      expect(theoryService.selectedRoot()).toBe('G');
      expect(strumSpy).toHaveBeenCalled();
    });
  });

  describe('playNote', () => {
    it('should play the specified note', async () => {
      const note = { note: 'C', octave: 4, interval: 0, fret: 0, stringIdx: 0 };
      await component.playNote(note);

      expect(Tone.start).toHaveBeenCalled();
      expect(component.synth).toBeTruthy();
      expect(component.synth?.triggerAttackRelease).toHaveBeenCalledWith('C4', '8n');
    });
  });

  describe('rotateVoicing', () => {
    it('should increment voicing index', () => {
      theoryService.selectedType.set('Chord');
      theoryService.selectedName.set('Major'); // Generates multiple voicings
      theoryService.selectedVoicingIndex.set(0);

      component.rotateVoicing(1);

      expect(theoryService.selectedVoicingIndex()).toBe(1);
    });

    it('should wrap around when incrementing past max', () => {
      theoryService.selectedType.set('Chord');
      theoryService.selectedName.set('Major');

      const maxLen = theoryService.generatedVoicings().length;
      theoryService.selectedVoicingIndex.set(maxLen - 1);

      component.rotateVoicing(1);

      expect(theoryService.selectedVoicingIndex()).toBe(0);
    });

    it('should wrap around when decrementing past min', () => {
      theoryService.selectedType.set('Chord');
      theoryService.selectedName.set('Major');

      const maxLen = theoryService.generatedVoicings().length;
      theoryService.selectedVoicingIndex.set(0);

      component.rotateVoicing(-1);

      expect(theoryService.selectedVoicingIndex()).toBe(maxLen - 1);
    });
  });

  describe('getIntervalName', () => {
    it('should map intervals to names correctly', () => {
      expect(component.getIntervalName(0)).toBe('R');
      expect(component.getIntervalName(3)).toBe('b3');
      expect(component.getIntervalName(4)).toBe('3');
      expect(component.getIntervalName(7)).toBe('5');
      expect(component.getIntervalName(null)).toBe('');
    });
  });

  describe('strumChord', () => {
    it('should trigger notes for a chord', async () => {
      theoryService.selectedType.set('Chord');
      theoryService.selectedRoot.set('C');
      theoryService.selectedName.set('Major');

      await component.strumChord();

      expect(Tone.start).toHaveBeenCalled();
      expect(component.synth).toBeTruthy();

      // Since it's a mock, triggerAttackRelease will be called
      expect(component.synth?.triggerAttackRelease).toHaveBeenCalled();
    });
  });
});
