import { useEffect, useState } from 'react';
import { CONSONANTS, VOWELS, ALL_LETTERS } from '../data/alphabet';
import type { TibetanLetter } from '../data/alphabet';
import type { Direction } from '../hooks/useGameState';
import './SetupScreen.css';

interface Props {
  title: string;
  icon: string;
  description: string;
  onStart: (letters: TibetanLetter[], count: number, direction: Direction) => void;
  onBack: () => void;
}

type Subset = 'all' | 'consonants' | 'vowels';

const STEP = 5;

export function SetupScreen({ title, icon, description, onStart, onBack }: Props) {
  const [subset, setSubset] = useState<Subset>('consonants');
  const [direction, setDirection] = useState<Direction>('tibetan-to-wylie');

  const letters =
    subset === 'all' ? ALL_LETTERS :
    subset === 'consonants' ? CONSONANTS : VOWELS;

  const maxCount = letters.length;
  const minCount = Math.min(STEP, maxCount);

  const [count, setCount] = useState(() => Math.min(10, maxCount));

  useEffect(() => {
    setCount(c => Math.max(minCount, Math.min(c, maxCount)));
  }, [maxCount, minCount]);

  const decrementCount = () => setCount(c => Math.max(minCount, c - STEP));
  const incrementCount = () => setCount(c => Math.min(maxCount, c + STEP));

  return (
    <div className="setup-screen">
      <div className="screen-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
      </div>

      <div className="setup-hero">
        <span className="setup-icon">{icon}</span>
        <h1 className="setup-title">{title}</h1>
        <p className="setup-desc">{description}</p>
      </div>

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

      <div className="direction-picker">
        <span className="count-label">Direction</span>
        <div className="direction-toggle">
          <button
            className={`direction-btn ${direction === 'tibetan-to-wylie' ? 'active' : ''}`}
            onClick={() => setDirection('tibetan-to-wylie')}
          >
            ཀ → ka
          </button>
          <button
            className={`direction-btn ${direction === 'wylie-to-tibetan' ? 'active' : ''}`}
            onClick={() => setDirection('wylie-to-tibetan')}
          >
            ka → ཀ
          </button>
        </div>
      </div>

      <div className="count-picker">
        <span className="count-label">Number of cards</span>
        <div className="count-stepper">
          <button
            className="count-btn"
            onClick={decrementCount}
            disabled={count <= minCount}
            aria-label="Decrease card count"
          >
            −
          </button>
          <span className="count-value">{count}</span>
          <button
            className="count-btn"
            onClick={incrementCount}
            disabled={count >= maxCount}
            aria-label="Increase card count"
          >
            +
          </button>
        </div>
      </div>

      <button className="start-btn" onClick={() => onStart(letters, count, direction)}>
        Start
      </button>
    </div>
  );
}
