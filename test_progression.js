const NOTES = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'];
const SCALES = { 'Major': [0, 2, 4, 5, 7, 9, 11], 'Minor': [0, 2, 3, 5, 7, 8, 10] };
const ROMAN_MAP = {
  'I':    { offset: 0,  quality: '' },
  'IV':   { offset: 5,  quality: '' },
  'V':    { offset: 7,  quality: '' },
};

function resolveProgressionChords(rootNote, formula, scaleName = 'Major') {
    if (!formula) return [];
    const rootIdx = NOTES.indexOf(rootNote);
    const degrees = formula.split(/\s*[–\-]\s*/).map(d => d.trim()).filter(Boolean);

    const qualityToName = {
      '':    'Major',
      'm':   'Minor',
      'dim': 'Diminished',
      'aug': 'Augmented',
    };

    const degreeMap = {
       'i': 0, 'ii': 1, 'iii': 2, 'iv': 3, 'v': 4, 'vi': 5, 'vii': 6
    };

    const scaleIntervals = SCALES[scaleName] || SCALES['Major'];
    const isScaleMode = scaleName !== 'Major' && scaleIntervals.length === 7;

    return degrees.map(roman => {
      let entry = ROMAN_MAP[roman];
      let displayRoman = roman;

      if (isScaleMode) {
         const baseRoman = roman.replace(/^[b#]/, '').toLowerCase();
         const scaleDegree = degreeMap[baseRoman];
         if (scaleDegree !== undefined) {
             const rootOffset = scaleIntervals[scaleDegree];
             const thirdOffset = scaleIntervals[(scaleDegree + 2) % 7];
             const fifthOffset = scaleIntervals[(scaleDegree + 4) % 7];
             
             let t = thirdOffset - rootOffset;
             if (t < 0) t += 12;
             let f = fifthOffset - rootOffset;
             if (f < 0) f += 12;
             
             let quality = '';
             if (t === 4 && f === 7) quality = ''; // Major
             else if (t === 3 && f === 7) quality = 'm'; // Minor
             else if (t === 3 && f === 6) quality = 'dim'; // Diminished
             else if (t === 4 && f === 8) quality = 'aug'; // Augmented
             
             entry = { offset: rootOffset, quality };
             
             // Update roman case for better visual feedback based on quality
             if (quality === 'm' || quality === 'dim') {
                displayRoman = roman.toLowerCase();
             } else {
                displayRoman = roman.toUpperCase();
             }
         }
      }

      if (!entry) return { roman: displayRoman, note: displayRoman, quality: '', chordName: 'Major' };
      const noteIdx = (rootIdx + entry.offset) % 12;
      return { 
        roman: displayRoman, 
        note: NOTES[noteIdx], 
        quality: entry.quality,
        chordName: qualityToName[entry.quality] ?? 'Major'
      };
    });
}

console.log(resolveProgressionChords('E', 'I - IV - V', 'Minor'));
