import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ControlPanelComponent } from './control-panel.component';
import { TheoryService } from '../../services/theory.service';
import { TranslationService } from '../../services/translation.service';

describe('ControlPanelComponent', () => {
  let component: ControlPanelComponent;
  let fixture: ComponentFixture<ControlPanelComponent>;
  let theoryService: TheoryService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ControlPanelComponent],
      providers: [TheoryService, TranslationService]
    }).compileComponents();

    fixture = TestBed.createComponent(ControlPanelComponent);
    component = fixture.componentInstance;
    theoryService = TestBed.inject(TheoryService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Songwriting Progressions', () => {
    it('should resolve chords for Rock/Blues progression in C', () => {
      theoryService.selectedRoot.set('C');
      theoryService.selectedProgressionStyle.set('Rock/Blues');

      const chords = component.resolvedChords();

      expect(chords.length).toBe(3);
      expect(chords[0]).toEqual({ roman: 'I', note: 'C', quality: '' });
      expect(chords[1]).toEqual({ roman: 'IV', note: 'F', quality: '' });
      expect(chords[2]).toEqual({ roman: 'V', note: 'G', quality: '' });
    });

    it('should resolve chords for Jazz Turnaround progression in G', () => {
      theoryService.selectedRoot.set('G');
      theoryService.selectedProgressionStyle.set('Jazz Turnaround');

      const chords = component.resolvedChords();

      expect(chords.length).toBe(3);
      // Jazz Turnaround is ii - V - I
      expect(chords[0]).toEqual({ roman: 'ii', note: 'A', quality: 'm' });
      expect(chords[1]).toEqual({ roman: 'V', note: 'D', quality: '' });
      expect(chords[2]).toEqual({ roman: 'I', note: 'G', quality: '' });
    });

    it('should handle missing formula safely', () => {
      // Temporarily mock an invalid style
      theoryService.selectedProgressionStyle.set('Invalid Style' as any);
      const chords = component.resolvedChords();
      expect(chords).toEqual([]);
    });
  });

  describe('Chord Selection', () => {
    it('should update preview signals when selectChord is called with Minor quality', () => {
      const degree = { roman: 'ii', note: 'D', quality: 'm' };
      component.selectChord(degree);

      expect(theoryService.previewRoot()).toBe('D');
      expect(theoryService.previewChordName()).toBe('Minor');
      expect(theoryService.selectedType()).toBe('Chord');
      expect(theoryService.selectedVoicingIndex()).toBe(0);
    });

    it('should update preview signals when selectChord is called with Diminished quality', () => {
      const degree = { roman: 'vii', note: 'B', quality: 'dim' };
      component.selectChord(degree);

      expect(theoryService.previewRoot()).toBe('B');
      expect(theoryService.previewChordName()).toBe('Diminished');
      expect(theoryService.selectedType()).toBe('Chord');
      expect(theoryService.selectedVoicingIndex()).toBe(0);
    });

    it('should fallback to Major if quality is unknown', () => {
      const degree = { roman: 'X', note: 'E', quality: 'unknown' };
      component.selectChord(degree);

      expect(theoryService.previewRoot()).toBe('E');
      expect(theoryService.previewChordName()).toBe('Major');
      expect(theoryService.selectedType()).toBe('Chord');
      expect(theoryService.selectedVoicingIndex()).toBe(0);
    });
  });

  describe('Panel Toggling', () => {
    it('should toggle CAGED panel when button is clicked', () => {
      const initialValue = theoryService.showCagedPanel();

      // Find all buttons
      const buttons = fixture.nativeElement.querySelectorAll('button');
      // The first button in the template is for CAGED System
      const cagedButton = buttons[0];

      cagedButton.click();
      fixture.detectChanges();

      expect(theoryService.showCagedPanel()).toBe(!initialValue);
    });

    it('should toggle Songwriting panel when button is clicked', () => {
      const initialValue = theoryService.showProgressionsPanel();

      // Select translation service
      const translationService = TestBed.inject(TranslationService);
      const translatedText = translationService.t('SONGWRITING');

      const buttons = Array.from(fixture.nativeElement.querySelectorAll('button'));
      const songwritingButton = buttons.find((b: any) => b.textContent?.includes(translatedText)) as HTMLButtonElement;

      if (songwritingButton) {
        songwritingButton.click();
        fixture.detectChanges();
      }

      expect(theoryService.showProgressionsPanel()).toBe(!initialValue);
    });
  });

  describe('currentOptions', () => {
    it('should return SCALES keys when selectedType is Scale', () => {
      theoryService.selectedType.set('Scale');
      const options = component.currentOptions();
      expect(options).toContain('Major');
      expect(options).toContain('Minor');
    });

    it('should return CHORDS keys when selectedType is Chord', () => {
      theoryService.selectedType.set('Chord');
      const options = component.currentOptions();
      expect(options).toContain('Major');
      expect(options).toContain('Minor 7th');
    });
  });
});
