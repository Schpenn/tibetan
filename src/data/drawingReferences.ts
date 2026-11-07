import fontUrl from '../assets/references/NotoSerifTibetan.ttf?url';
import licenseUrl from '../assets/references/OFL.txt?url';
import provenance from '../assets/references/provenance.json';

export { licenseUrl as REFERENCE_LICENSE_URL, provenance as REFERENCE_PROVENANCE };

export const REFERENCE_VARIANTS = {
  regular: 400,
  semibold: 600,
} as const;

// IDs are alphabet IDs, not filenames (in particular, "'a" is distinct from "a").
export const REFERENCE_GLYPHS: Readonly<Record<string, string>> = {
  ka: 'ཀ',
  kha: 'ཁ',
  ga: 'ག',
  nga: 'ང',
  ca: 'ཅ',
  cha: 'ཆ',
  ja: 'ཇ',
  nya: 'ཉ',
  ta: 'ཏ',
  tha: 'ཐ',
  da: 'ད',
  na: 'ན',
  pa: 'པ',
  pha: 'ཕ',
  ba: 'བ',
  ma: 'མ',
  tsa: 'ཙ',
  tsha: 'ཚ',
  dza: 'ཛ',
  wa: 'ཝ',
  zha: 'ཞ',
  za: 'ཟ',
  "'a": 'འ',
  ya: 'ཡ',
  ra: 'ར',
  la: 'ལ',
  sha: 'ཤ',
  sa: 'ས',
  ha: 'ཧ',
  a: 'ཨ',
};

export function getDrawingReference(
  letterId: string,
  variant: keyof typeof REFERENCE_VARIANTS = 'regular',
) {
  if (!Object.hasOwn(REFERENCE_GLYPHS, letterId)) return undefined;
  return {
    id: `${provenance.version}:${letterId}:${variant}`,
    letterId,
    glyph: REFERENCE_GLYPHS[letterId],
    fontUrl,
    fontFamily: 'Tibetan Reference',
    fontWeight: REFERENCE_VARIANTS[variant],
    provenance,
  };
}
