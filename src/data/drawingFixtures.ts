import type { REFERENCE_VARIANTS } from './drawingReferences';

export type FixtureSplit = 'calibration' | 'held-out';
export type FixtureLabel =
  | 'acceptable'
  | 'wrong-consonant'
  | 'missing-strokes'
  | 'extra-strokes'
  | 'scribble'
  | 'tiny-mark'
  | 'blank';
export type Stroke = readonly (readonly [number, number])[];

export interface HumanDrawingFixture {
  id: string;
  targetLetterId: string;
  drawnLetterId: string | null;
  label: FixtureLabel;
  split: FixtureSplit;
  writerId: string;
  inputMethod: 'mouse' | 'touch' | 'stylus';
  canvas: { width: number; height: number; brushWidth: number };
  strokes: readonly Stroke[];
  provenance: {
    source: string;
    license: 'CC0-1.0' | 'CC-BY-4.0';
    attribution: string;
    consentRecord: string;
    licenseRecord: string;
  };
  review: {
    reviewerId: string;
    reviewedAt: string;
    notes: string;
  };
}

// Intentionally empty: synthetic recipes must never masquerade as consented handwriting.
export const HUMAN_DRAWING_FIXTURES: readonly HumanDrawingFixture[] = [];

interface SyntheticFixture {
  id: string;
  targetLetterId: string;
  split: FixtureSplit;
  label: FixtureLabel;
  inputMethod: 'synthetic';
  review: null;
  ink: {
    reference?: { letterId: string; variant: keyof typeof REFERENCE_VARIANTS };
    erase?: { x: number; y: number; width: number; height: number };
    strokes?: readonly Stroke[];
  };
}

export const SYNTHETIC_FIXTURE_PROVENANCE = {
  version: 'synthetic-bootstrap-v1',
  source: 'Original programmatic fixture recipes authored for this repository; no human drawings.',
  license: 'CC0-1.0',
  licenseUrl: 'https://creativecommons.org/publicdomain/zero/1.0/',
  dedication: 'To the extent possible under law, the authors waive all copyright and related rights in these original fixture recipes under CC0 1.0.',
  fontLicense: 'Linked Noto font remains OFL-1.1; see assets/references/OFL.txt.',
  consent: 'not-applicable-no-human-participants',
  purpose: 'Prototype smoke checks only; labels are construction intent, not expert judgments.',
  splitWarning: 'Both partitions use one font source. They are not independent writers and cannot establish handwriting accuracy.',
  rendering: {
    width: 256,
    height: 256,
    background: 'white',
    ink: 'black',
    brushWidth: 8,
    lineCap: 'round',
    lineJoin: 'round',
    fontSize: 160,
    textAlign: 'left',
    textBaseline: 'alphabetic',
    origin: [48, 176],
    order: 'Render reference, erase rectangle to white, then draw stroke polylines. Blank has no ink.',
  },
} as const;

export const SYNTHETIC_DRAWING_FIXTURES: readonly SyntheticFixture[] = [
  { id: 'cal-ka', targetLetterId: 'ka', split: 'calibration', label: 'acceptable', inputMethod: 'synthetic', review: null, ink: { reference: { letterId: 'ka', variant: 'regular' } } },
  { id: 'cal-kha', targetLetterId: 'kha', split: 'calibration', label: 'acceptable', inputMethod: 'synthetic', review: null, ink: { reference: { letterId: 'kha', variant: 'regular' } } },
  { id: 'cal-ka-for-kha', targetLetterId: 'kha', split: 'calibration', label: 'wrong-consonant', inputMethod: 'synthetic', review: null, ink: { reference: { letterId: 'ka', variant: 'regular' } } },
  { id: 'cal-pa-for-pha', targetLetterId: 'pha', split: 'calibration', label: 'wrong-consonant', inputMethod: 'synthetic', review: null, ink: { reference: { letterId: 'pa', variant: 'regular' } } },
  { id: 'cal-tsa-for-tsha', targetLetterId: 'tsha', split: 'calibration', label: 'wrong-consonant', inputMethod: 'synthetic', review: null, ink: { reference: { letterId: 'tsa', variant: 'regular' } } },
  { id: 'cal-ra', targetLetterId: 'ra', split: 'calibration', label: 'acceptable', inputMethod: 'synthetic', review: null, ink: { reference: { letterId: 'ra', variant: 'regular' } } },
  { id: 'cal-ka-missing', targetLetterId: 'ka', split: 'calibration', label: 'missing-strokes', inputMethod: 'synthetic', review: null, ink: { reference: { letterId: 'ka', variant: 'regular' }, erase: { x: 0, y: 0, width: 128, height: 256 } } },
  { id: 'cal-ka-extra', targetLetterId: 'ka', split: 'calibration', label: 'extra-strokes', inputMethod: 'synthetic', review: null, ink: { reference: { letterId: 'ka', variant: 'regular' }, strokes: [[[24, 24], [232, 232]]] } },
  { id: 'cal-scribble', targetLetterId: 'ka', split: 'calibration', label: 'scribble', inputMethod: 'synthetic', review: null, ink: { strokes: [[[20, 20], [230, 210], [25, 80], [200, 20], [60, 230], [220, 100], [20, 200]]] } },
  { id: 'cal-tiny', targetLetterId: 'ra', split: 'calibration', label: 'tiny-mark', inputMethod: 'synthetic', review: null, ink: { strokes: [[[128, 128], [129, 129]]] } },
  { id: 'cal-blank', targetLetterId: 'ka', split: 'calibration', label: 'blank', inputMethod: 'synthetic', review: null, ink: {} },
  { id: 'held-ga', targetLetterId: 'ga', split: 'held-out', label: 'acceptable', inputMethod: 'synthetic', review: null, ink: { reference: { letterId: 'ga', variant: 'semibold' } } },
  { id: 'held-nga', targetLetterId: 'nga', split: 'held-out', label: 'acceptable', inputMethod: 'synthetic', review: null, ink: { reference: { letterId: 'nga', variant: 'semibold' } } },
  { id: 'held-kha-for-ka', targetLetterId: 'ka', split: 'held-out', label: 'wrong-consonant', inputMethod: 'synthetic', review: null, ink: { reference: { letterId: 'kha', variant: 'semibold' } } },
  { id: 'held-pha-for-pa', targetLetterId: 'pa', split: 'held-out', label: 'wrong-consonant', inputMethod: 'synthetic', review: null, ink: { reference: { letterId: 'pha', variant: 'semibold' } } },
  { id: 'held-tsha-for-tsa', targetLetterId: 'tsa', split: 'held-out', label: 'wrong-consonant', inputMethod: 'synthetic', review: null, ink: { reference: { letterId: 'tsha', variant: 'semibold' } } },
  { id: 'held-a-chung-for-a', targetLetterId: 'a', split: 'held-out', label: 'wrong-consonant', inputMethod: 'synthetic', review: null, ink: { reference: { letterId: "'a", variant: 'semibold' } } },
  { id: 'held-ma-missing', targetLetterId: 'ma', split: 'held-out', label: 'missing-strokes', inputMethod: 'synthetic', review: null, ink: { reference: { letterId: 'ma', variant: 'semibold' }, erase: { x: 0, y: 0, width: 128, height: 256 } } },
  { id: 'held-ma-extra', targetLetterId: 'ma', split: 'held-out', label: 'extra-strokes', inputMethod: 'synthetic', review: null, ink: { reference: { letterId: 'ma', variant: 'semibold' }, strokes: [[[232, 24], [24, 232]]] } },
  { id: 'held-scribble', targetLetterId: 'ma', split: 'held-out', label: 'scribble', inputMethod: 'synthetic', review: null, ink: { strokes: [[[230, 20], [20, 220], [210, 140], [40, 40], [180, 240], [80, 20], [240, 200]]] } },
  { id: 'held-tiny', targetLetterId: 'ga', split: 'held-out', label: 'tiny-mark', inputMethod: 'synthetic', review: null, ink: { strokes: [[[32, 32], [33, 33]]] } },
  { id: 'held-blank', targetLetterId: 'ma', split: 'held-out', label: 'blank', inputMethod: 'synthetic', review: null, ink: {} },
];
