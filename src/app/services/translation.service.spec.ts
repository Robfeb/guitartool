import { TestBed } from '@angular/core/testing';
import { TranslationService } from './translation.service';
import { TheoryService } from './theory.service';
import { signal } from '@angular/core';

describe('TranslationService', () => {
  let service: TranslationService;
  let mockTheoryService: any;

  beforeEach(() => {
    mockTheoryService = {
      currentLang: signal('en')
    };

    TestBed.configureTestingModule({
      providers: [
        TranslationService,
        { provide: TheoryService, useValue: mockTheoryService }
      ]
    });
    service = TestBed.inject(TranslationService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should have default language as "en"', () => {
    expect(service.currentLang()).toBe('en');
  });

  it('should translate APP_TITLE in English', () => {
    expect(service.t('APP_TITLE')).toBe("Rob's Guitar Tool");
  });

  it('should translate KEY in English', () => {
    expect(service.t('KEY')).toBe("Key");
  });

  it('should change language to "es"', () => {
    service.setLanguage('es');
    expect(mockTheoryService.currentLang()).toBe('es');
    expect(service.currentLang()).toBe('es');
  });

  it('should translate APP_TITLE in Spanish', () => {
    service.setLanguage('es');
    expect(service.t('APP_TITLE')).toBe("Guitar Tool de Rob");
  });

  it('should translate KEY in Spanish', () => {
    service.setLanguage('es');
    expect(service.t('KEY')).toBe("Tono");
  });

  it('should return the key if translation is not found', () => {
    expect(service.t('NON_EXISTENT_KEY')).toBe('NON_EXISTENT_KEY');
  });
});
