import './App.css';
import { ALL_LETTERS, CONSONANTS } from './data/alphabet';
import { useGameState } from './hooks/useGameState';
import { HomeScreen } from './screens/HomeScreen';
import { OverviewScreen } from './screens/OverviewScreen';
import { SetupScreen } from './screens/SetupScreen';
import { FlashcardScreen } from './screens/FlashcardScreen';
import { QuizScreen } from './screens/QuizScreen';
import { ResultsScreen } from './screens/ResultsScreen';

function App() {
  const {
    state,
    setupFlashcard,
    startFlashcard,
    startOverview,
    setupQuiz,
    startQuiz,
    goHome,
    nextCard,
    answerQuiz,
  } = useGameState(CONSONANTS);

  return (
    <div className="app">
      {state.mode === 'home' && (
        <HomeScreen onOverview={() => startOverview(ALL_LETTERS)} onFlashcard={setupFlashcard} onQuiz={setupQuiz} />
      )}
      {state.mode === 'overview' && (
        <OverviewScreen onBack={goHome} />
      )}
      {state.mode === 'flashcard-setup' && (
        <SetupScreen
          title="Flashcards"
          icon="🃏"
          description="Study at your own pace. Flip each card to reveal the romanization."
          onStart={(letters, count, direction) => startFlashcard(letters, count, direction)}
          onBack={goHome}
        />
      )}
      {state.mode === 'quiz-setup' && (
        <SetupScreen
          title="Quiz"
          icon="⚡"
          description="Test your knowledge. Pick the correct romanization and earn points!"
          onStart={(letters, count, direction) => startQuiz(letters, count, direction)}
          onBack={goHome}
        />
      )}
      {state.mode === 'flashcard' && (
        <FlashcardScreen
          letters={state.letters}
          direction={state.direction}
          currentIndex={state.currentIndex}
          onNext={nextCard}
          onBack={goHome}
        />
      )}
      {state.mode === 'quiz' && (
        <QuizScreen
          letters={state.letters}
          direction={state.direction}
          currentIndex={state.currentIndex}
          score={state.score}
          streak={state.streak}
          onAnswer={answerQuiz}
          onBack={goHome}
        />
      )}
      {state.mode === 'results' && (
        <ResultsScreen
          state={state}
          onHome={goHome}
          onRetry={(letters, direction) => startQuiz(letters, letters.length, direction)}
        />
      )}
    </div>
  );
}

export default App;
