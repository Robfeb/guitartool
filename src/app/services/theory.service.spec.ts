import { TestBed } from '@angular/core/testing';
import { TheoryService } from './theory.service';
import { vi, describe, beforeEach, afterEach, it, expect } from 'vitest';

describe('TheoryService', () => {
  let service: TheoryService;
  let consoleSpy: any;
  let getItemSpy: any;
  let setItemSpy: any;

  beforeEach(() => {
    consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('should handle invalid JSON in localStorage gracefully', () => {
    getItemSpy = vi.spyOn(Storage.prototype, 'getItem').mockReturnValue('{ invalid json');

    TestBed.configureTestingModule({
      providers: [TheoryService]
    });
    service = TestBed.inject(TheoryService);

    expect(getItemSpy).toHaveBeenCalledWith('guitarToolState');
    expect(consoleSpy).toHaveBeenCalledWith('Failed to load state', expect.any(SyntaxError));
    expect(service.selectedRoot()).toBe('C'); // Fallback default
  });
});
