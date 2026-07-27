import { useState } from 'react';
import { CONSONANTS, VOWELS, ALL_LETTERS } from '../data/alphabet';
import type { TibetanLetter } from '../data/alphabet';
import './OverviewScreen.css';

interface Props {
  onBack: () => void;
}

type Subset = 'all' | 'consonants' | 'vowels';

function LetterTile({ letter }: { letter: TibetanLetter }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <button
      className={`tile ${revealed ? 'revealed' : ''}`}
      onClick={() => setRevealed(r => !r)}
    >
      <span className="tile-glyph">{letter.tibetan}</span>
      <span className="tile-wylie">{letter.wylie}</span>
      {revealed && <span className="tile-pronunciation">{letter.pronunciation}</span>}
    </button>
  );
}

export function OverviewScreen({ onBack }: Props) {
  const [subset, setSubset] = useState<Subset>('consonants');

  const letters =
    subset === 'all' ? ALL_LETTERS :
    subset === 'consonants' ? CONSONANTS : VOWELS;

  return (
    <div className="overview-screen">
      <div className="screen-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <h1 className="overview-title">Letter Overview</h1>
      </div>

      <p className="overview-hint">Tap a letter to see its pronunciation.</p>

      <div className="subset-picker">
        {(['consonants', 'vowels', 'all'] as Subset[]).map(s => (
          <button
            key={s}
            className={`subset-btn ${subset === s ? 'active' : ''}`}
            onClick={() => setSubset(s)}
          >
            {s === 'all' ? `All (${ALL_LETTERS.length})` :
             s === 'consonants' ? `Consonants (${CONSONANTS.length})` :
             `Vowels (${VOWELS.length})`}
          </button>
        ))}
      </div>

      <div className="tile-grid">
        {letters.map(letter => (
          <LetterTile key={letter.id} letter={letter} />
        ))}
      </div>
    </div>
  );
}
