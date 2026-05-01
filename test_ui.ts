import { TheoryService, CHORD_PROGRESSIONS } from './src/app/services/theory.service';

const ts = new TheoryService();
const formula = CHORD_PROGRESSIONS['Rock/Blues'].formula;
const resolved = ts.resolveProgressionChords('E', formula, 'Minor');
console.log("Formula:", formula);
console.log("Resolved:", resolved.map(c => c.roman + ' ' + c.note + c.quality).join(' - '));
