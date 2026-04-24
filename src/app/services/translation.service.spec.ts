import { TestBed } from '@angular/core/testing';
import { TranslationService } from './translation.service';
import { TheoryService } from './theory.service';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('TranslationService', () => {
  let service: TranslationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [TranslationService, TheoryService]
    });
    service = TestBed.inject(TranslationService);
  });

  afterEach(() => {
    TestBed.resetTestingModule();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return the key if the translation key does not exist', () => {
    const missingKey = 'NON_EXISTENT_KEY';
    expect(service.t(missingKey)).toBe(missingKey);
  });
});
