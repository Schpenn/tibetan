import { useMemo } from 'react';
import { ProgressBar } from '../components/ProgressBar';
import type { TibetanLetter } from '../data/alphabet';
import { ALL_LETTERS } from '../data/alphabet';
import type { Direction } from '../hooks/useGameState';
import './QuizScreen.css';

interface Props {
  letters: TibetanLetter[];
  direction: Direction;
  currentIndex: number;
  score: number;
  streak: number;
  onAnswer: (correct: boolean) => void;
  onBack: () => void;
}

function getOptions(correct: TibetanLetter, pool: TibetanLetter[]): TibetanLetter[] {
  const others = pool.filter(l => l.id !== correct.id);
  const shuffled = [...others].sort(() => Math.random() - 0.5).slice(0, 3);
  return [...shuffled, correct].sort(() => Math.random() - 0.5);
}

export function QuizScreen({ letters, direction, currentIndex, score, streak, onAnswer, onBack }: Props) {
  const letter = letters[currentIndex];
  const isReverse = direction === 'wylie-to-tibetan';
  const options = useMemo(
    () => getOptions(letter, ALL_LETTERS),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [letter.id]
  );

  return (
    <div className="quiz-screen">
      <div className="screen-header">
        <button className="back-btn" onClick={onBack}>← Back</button>
        <ProgressBar current={currentIndex + 1} total={letters.length} />
      </div>

      <div className="quiz-hud">
        <div className="hud-item">
          <span className="hud-label">Score</span>
          <span className="hud-value">{score}</span>
        </div>
        {streak >= 2 && (
          <div className="hud-item streak">
            <span className="hud-label">Streak</span>
            <span className="hud-value">🔥 {streak}</span>
          </div>
        )}
      </div>

      <div className="quiz-prompt">
        {isReverse ? (
          <span className="wylie-quiz-prompt">{letter.wylie}</span>
        ) : (
          <span className="tibetan-quiz-glyph">{letter.tibetan}</span>
        )}
        <p className="prompt-text">
          {isReverse ? 'Which letter is this?' : 'What is this letter?'}
        </p>
      </div>

      <div className="options-grid">
        {options.map(opt => (
          <button
            key={opt.id}
            className="option-btn"
            onClick={() => onAnswer(opt.id === letter.id)}
          >
            {isReverse ? (
              <span className="opt-tibetan">{opt.tibetan}</span>
            ) : (
              <>
                <span className="opt-wylie">{opt.wylie}</span>
                <span className="opt-pronunciation">{opt.pronunciation.split('(')[1]?.replace(')', '') ?? ''}</span>
              </>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}
