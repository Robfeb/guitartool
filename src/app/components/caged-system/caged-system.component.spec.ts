import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CagedSystemComponent } from './caged-system.component';
import { TheoryService } from '../../services/theory.service';
import { TranslationService } from '../../services/translation.service';

describe('CagedSystemComponent', () => {
  let component: CagedSystemComponent;
  let fixture: ComponentFixture<CagedSystemComponent>;
  let theoryService: TheoryService;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CagedSystemComponent],
      providers: [TheoryService, TranslationService]
    }).compileComponents();

    fixture = TestBed.createComponent(CagedSystemComponent);
    component = fixture.componentInstance;
    theoryService = TestBed.inject(TheoryService);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should get correct info for known and unknown shapes', () => {
    expect(component.getInfo('C').color).toBe('bg-red-500');
    expect(component.getInfo('X').color).toBe('bg-green-500'); // Fallback is E
  });

  it('should update selectedVoicingIndex on selectShape', () => {
    component.selectShape(2);
    expect(theoryService.selectedVoicingIndex()).toBe(2);
  });

  it('should toggle showSequence and showTheory signals', () => {
    expect(component.showSequence()).toBe(false);
    component.showSequence.set(true);
    expect(component.showSequence()).toBe(true);

    expect(component.showTheory()).toBe(false);
    component.showTheory.set(true);
    expect(component.showTheory()).toBe(true);
  });

  it('should compute shapesForCurrent based on theory effectiveChordName', () => {
    // Mock 'Major' shapes setup in theory service for effective chord name
    theoryService.previewChordName.set('Major');
    expect(component.shapesForCurrent().length).toBeGreaterThan(0);
    expect(component.shapesForCurrent()[0]).toHaveProperty('letter');
    expect(component.shapesForCurrent()[0]).toHaveProperty('minFret');
  });
});
