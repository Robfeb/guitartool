import { TestBed } from '@angular/core/testing';
import { TheoryService } from './theory.service';

describe('TheoryService', () => {
  let service: TheoryService;

  beforeEach(() => {
    // Mock localStorage to ensure a clean slate and prevent errors during initialization
    vi.spyOn(Storage.prototype, 'getItem').mockReturnValue(null);
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {});

    TestBed.configureTestingModule({
      providers: [TheoryService],
    });
    service = TestBed.inject(TheoryService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be created with correct default state', () => {
    expect(service).toBeTruthy();
    expect(service.selectedRoot()).toBe('C');
    expect(service.selectedType()).toBe('Chord');
    expect(service.selectedName()).toBe('Major');
  });

  it('should correctly compute activeIntervals for the default Major Chord', () => {
    // When selectedType is 'Chord' and selectedName is 'Major' (default)
    expect(service.selectedType()).toBe('Chord');
    expect(service.selectedName()).toBe('Major');

    // activeIntervals should return [0, 4, 7] based on CHORDS['Major']
    expect(service.activeIntervals()).toEqual([0, 4, 7]);
  });

  it('should correctly compute activeIntervals for a Minor Scale', () => {
    // Set type to 'Scale' and name to 'Minor'
    service.selectedType.set('Scale');
    service.selectedName.set('Minor');

    // activeIntervals should return [0, 2, 3, 5, 7, 8, 10] based on SCALES['Minor']
    expect(service.activeIntervals()).toEqual([0, 2, 3, 5, 7, 8, 10]);
  });
});
