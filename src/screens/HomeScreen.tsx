import { CONSONANTS, VOWELS } from '../data/alphabet';
import './HomeScreen.css';

interface Props {
  onOverview: () => void;
  onFlashcard: () => void;
  onQuiz: () => void;
}

export function HomeScreen({ onOverview, onFlashcard, onQuiz }: Props) {
  return (
    <div className="home">
      <div className="home-hero">
        <h1 className="home-title">
          <span className="tibetan-big">བོད་ཡིག</span>
          <span className="subtitle">Learn Tibetan Script</span>
        </h1>
        <p className="home-desc">
          Master the Tibetan alphabet through flashcards and quizzes.
        </p>
      </div>

      <div className="mode-cards">
        <button className="mode-card overview-card" onClick={onOverview}>
          <span className="mode-icon">📖</span>
          <h2>Overview</h2>
          <p>Browse every letter at your own pace as a reference sheet.</p>
        </button>
        <button className="mode-card flashcard-card" onClick={onFlashcard}>
          <span className="mode-icon">🃏</span>
          <h2>Flashcards</h2>
          <p>Study at your own pace. Flip each card to reveal the romanization.</p>
        </button>
        <button className="mode-card quiz-card" onClick={onQuiz}>
          <span className="mode-icon">⚡</span>
          <h2>Quiz</h2>
          <p>Test your knowledge. Pick the correct romanization and earn points!</p>
        </button>
      </div>

      <div className="stats-hint">
        <span>Made by Espen Bjørnsen, procrastinating instead of actually studying Tibetan script.</span>
      </div>
    </div>
  );
}
