import { TheoryService, NOTES, SCALES, CHORDS, ROMAN_MAP } from './src/app/services/theory.service';

const ts = new TheoryService();
console.log(ts.resolveProgressionChords('E', 'I – IV – V', 'Minor'));
