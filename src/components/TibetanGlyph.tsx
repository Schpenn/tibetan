import type { TibetanLetter } from '../data/alphabet';
import { getDrawingReference } from '../data/drawingReferences';
import './TibetanGlyph.css';

export function TibetanGlyph({ letter, className }: { letter: TibetanLetter; className: string }) {
  const reference = getDrawingReference(letter.id);
  return (
    <span
      className={`reference-glyph ${className}`}
      lang="bo"
      data-reference-id={reference?.id}
      style={{ fontWeight: reference?.fontWeight ?? 400 }}
    >
      {reference?.glyph ?? letter.tibetan}
    </span>
  );
}
