import { useState } from 'react';
import { LetterCard } from '../components/LetterCard';
import { ProgressBar } from '../components/ProgressBar';
import type { TibetanLetter } from '../data/alphabet';
import type { Direction } from '../hooks/useGameState';
import './FlashcardScreen.css';

interface Props {
  letters: TibetanLetter[];
  direction: Direction;
  currentIndex: number;
  onNext: () => void;
  onBack: () => void;
}

export function FlashcardScreen({ letters, direction, currentIndex, onNext, onBack }: Props) {
  const [revealed, setRevealed] = useState(false);
  const letter = letters[currentIndex];

  const handleNext = () => {
    setRevealed(false);
    setTimeout(onNext, 50);
  };

  return (
    <div className="flashcard-screen">
      <div className="screen-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <ProgressBar current={currentIndex + 1} total={letters.length} />
      </div>

      <div className="card-area">
        <LetterCard
          letter={letter}
          direction={direction}
          showAnswer={revealed}
          onFlip={() => setRevealed(r => !r)}
        />
      </div>

      <div className="flashcard-actions">
        {!revealed ? (
          <button className="action-btn reveal-btn" onClick={() => setRevealed(true)}>
            Reveal
          </button>
        ) : (
          <button className="action-btn next-btn" onClick={handleNext}>
            {currentIndex + 1 < letters.length ? 'Next →' : 'Finish'}
          </button>
        )}
      </div>
    </div>
  );
}
