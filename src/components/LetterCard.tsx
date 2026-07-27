import { useState } from 'react';
import type { TibetanLetter } from '../data/alphabet';
import type { Direction } from '../hooks/useGameState';
import './LetterCard.css';

interface Props {
  letter: TibetanLetter;
  direction?: Direction;
  showAnswer?: boolean;
  onFlip?: () => void;
}

export function LetterCard({ letter, direction = 'tibetan-to-wylie', showAnswer, onFlip }: Props) {
  const [flipped, setFlipped] = useState(false);

  const handleClick = () => {
    if (onFlip) {
      setFlipped(f => !f);
      onFlip();
    }
  };

  const revealed = showAnswer !== undefined ? showAnswer : flipped;
  const isReverse = direction === 'wylie-to-tibetan';

  return (
    <div className={`letter-card ${revealed ? 'revealed' : ''}`} onClick={handleClick}>
      <div className="letter-card-inner">
        <div className="letter-card-front">
          {isReverse ? (
            <h2 className="wylie prompt-wylie">{letter.wylie}</h2>
          ) : (
            <span className="tibetan-glyph">{letter.tibetan}</span>
          )}
          {onFlip && <p className="tap-hint">Tap to reveal</p>}
        </div>
        <div className="letter-card-back">
          {isReverse ? (
            <>
              <span className="tibetan-glyph">{letter.tibetan}</span>
              <h2 className="wylie small">{letter.wylie}</h2>
            </>
          ) : (
            <span className="tibetan-glyph small">{letter.tibetan}</span>
          )}
          {!isReverse && <h2 className="wylie">{letter.wylie}</h2>}
          <p className="pronunciation">{letter.pronunciation}</p>
        </div>
      </div>
    </div>
  );
}
