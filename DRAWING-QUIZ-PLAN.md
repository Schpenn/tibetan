# Drawing Quiz Implementation Plan

## Goal and agreed scope

Given a romanized Tibetan consonant, such as `kha`, the user draws the
corresponding Tibetan letter. The app compares the drawing against approved
reference shapes locally in the browser and awards one point if accepted.

- Cover the 30 consonants in the first version.
- Evaluate similarity to the taught shape, not unrestricted handwriting.
- Allow one scored submission per letter.
- Award exactly one point for an accepted drawing and zero otherwise.
- Do not apply the existing quiz's streak bonus to drawing scores.
- Keep drawings on the device; no backend or external recognition API.
- Preserve existing overview, flashcard, and multiple-choice quiz behavior.

Out of scope: vowels, stroke-order grading, calligraphy grading, accounts,
saved drawing history, and a trained handwriting model.

## Step 1: Establish reference shapes and evaluation fixtures

- [ ] Select and document the Tibetan script style being taught.
- [ ] Obtain appropriately licensed reference shapes and record their source,
      license, and any required attribution alongside the assets.
- [ ] Use stable IDs from [alphabet.ts](src/data/alphabet.ts) to associate
      references with consonants. Use an explicit asset manifest rather than
      assuming every letter ID is a convenient filename.
- [ ] Obtain multiple approved examples per consonant, preferably reviewed by
      someone knowledgeable in Tibetan writing.
- [ ] Use these same reference shapes in answer feedback so the evaluator and
      teaching material agree.
- [ ] Font-rendered references may bootstrap the prototype, but do not treat
      them as validated handwriting references. Do not rely on system fonts.
- [ ] Collect labeled evaluation drawings from several people:
      - Acceptable examples, including imperfect beginner drawings.
      - Wrong consonants, particularly visually similar ones.
      - Missing strokes, extra strokes, scribbles, tiny marks, and blank input.
      - Examples drawn with a mouse, touch, and stylus.
- [ ] Keep calibration and held-out evaluation sets separate, preferably by
      writer, to avoid tuning and evaluating on the same handwriting.
- [ ] Keep any collected drawings limited to consented, appropriately licensed
      fixtures; do not introduce automatic collection of user drawings.

**Done when:** reference assets have documented provenance, and labeled fixtures
exist for a representative subset of distinct and easily confused consonants.
All 30 consonants must have reference coverage before scored release.

## Step 2: Prototype the evaluator before building scored gameplay

Create a pure evaluation module, for example
`src/utils/evaluateDrawing.ts`, separate from React.

- [ ] Define typed inputs and outputs. Distinguish:
      - Accepted drawing.
      - Rejected drawing.
      - Ambiguous drawing.
      - Invalid input, such as an empty canvas.
      - Evaluation failure, such as a missing reference asset.
- [ ] Normalize drawings and references identically:
      1. Extract foreground ink.
      2. Crop empty margins.
      3. Resize to a fixed working resolution while preserving aspect ratio.
      4. Center with consistent padding.
      5. Standardize line thickness to reduce device and brush-width effects.
- [ ] Prototype symmetric distance-transform matching:
      - Measure distances from drawn ink to reference ink.
      - Measure distances from reference ink to drawn ink.
      - Combine both directions so missing strokes and extra marks are penalized.
      - Compare against multiple approved references for each letter.
- [ ] Add calibrated safeguards against tiny marks, excessive ink coverage, and
      obvious scribbles. Avoid arbitrary checks that reject legitimate letters.
- [ ] Compare against competing consonants, not only the requested one.
- [ ] Require both sufficient similarity to the target and sufficient separation
      from competing letters. Treat close competition as ambiguous.
- [ ] Avoid aggressive rotation or distortion normalization that could transform
      a wrong letter into an accepted shape.
- [ ] Keep scores internal initially. Do not describe a similarity score as a
      probability of correctness.
- [ ] Surface missing assets and processing errors explicitly; never turn them
      into an incorrect answer or an apparently successful result.

**Done when:** a deterministic prototype distinguishes approved shapes from
representative wrong shapes and produces explicit outcomes for invalid input
and failures.

## Step 3: Calibrate and make a recognition go/no-go decision

- [ ] Expand reference coverage and fixtures to all 30 consonants.
- [ ] Tune thresholds using only the calibration set. Use per-letter thresholds
      and competitor margins where the evidence warrants them.
- [ ] Evaluate once against held-out samples and report per-letter and aggregate
      results, including ambiguous outcomes.
- [ ] Use these proposed release targets, confirming their suitability before
      enabling scored play:
      - Accept at least 90% of human-approved drawings.
      - Accept no more than 5% of incorrect drawings.
      - Finish evaluation within 300 ms on a representative mobile device.
- [ ] Define the measurement protocol and record sample counts and test-device
      details. Treat ambiguous outcomes as not accepted for these metrics.
- [ ] Inspect confusion pairs and weak letters; do not rely only on averages.
- [ ] Record the reference version, thresholds, and measured results so future
      changes can be compared reproducibly.
- [ ] If targets cannot be reached, do not ship unreliable scored recognition.
      Keep the prototype unscored and revisit references, matching, or a Tibetan
      handwriting model before proceeding with scored release.

**Done when:** all letters meet the agreed quality bar, or a documented decision
keeps the feature unscored pending further work.

## Step 4: Build the drawing canvas

Create a reusable component, for example `src/components/DrawingCanvas.tsx`,
with matching styles.

- [ ] Capture strokes as logical coordinates using Pointer Events for mouse,
      touch, and stylus input.
- [ ] Use pointer capture and handle pointer cancellation without leaving a
      drawing permanently in progress.
- [ ] Prevent page scrolling only inside the drawing area.
- [ ] Handle device pixel ratio and canvas resizing without losing or distorting
      existing strokes.
- [ ] Use a consistent brush width; pressure-sensitive grading is out of scope.
- [ ] Add Undo and Clear controls.
- [ ] Keep strokes separate from the displayed bitmap so undo and redraw are
      reliable.
- [ ] Export only the user's ink for evaluation, excluding guides, backgrounds,
      and feedback overlays.
- [ ] Disable drawing and editing while checking or after a valid submission.
- [ ] Provide an accessible canvas label, instructions, keyboard-operable
      controls, and a clear description of the drawing interaction's limitations.

**Done when:** drawing, undo, clear, resize, and cancellation work on desktop
and mobile without corrupting the captured answer.

## Step 5: Extend session state and scoring

Update [useGameState.ts](src/hooks/useGameState.ts).

- [ ] Add drawing setup and drawing play modes.
- [ ] Preserve the activity type through the results screen so replay and retry
      do not accidentally start a multiple-choice quiz.
- [ ] Start drawing sessions from consonants only, with randomized letters and
      the selected question count.
- [ ] Fix direction to romanization-to-Tibetan for drawing mode.
- [ ] Record each accepted result once:
      - Increment score by exactly one.
      - Increment total answered once.
      - Track rejected and ambiguous submissions as letters to review.
      - Keep streak tracking only if useful; never award drawing streak bonuses.
- [ ] Keep invalid input and evaluation failures outside scored results.
- [ ] Guard against repeated submission events and stale asynchronous results
      after navigation or a question change.
- [ ] Support explicit feedback followed by Next, rather than immediately
      advancing when a drawing is checked. Separate recording an answer from
      advancing the question where needed.
- [ ] Preserve existing quiz scoring and flashcard progression.

**Done when:** drawing sessions cannot exceed one point per letter or record a
question twice, and existing activities behave as before.

## Step 6: Build the drawing quiz screen

Create `src/screens/DrawingQuizScreen.tsx` and matching styles.

- [ ] Show the romanized prompt, for example: `Draw the Tibetan letter for "kha"`.
- [ ] Show progress and score.
- [ ] Include the drawing canvas, Undo, Clear, and Check drawing controls.
- [ ] Disable Check drawing when there is no ink or evaluation is in progress.
- [ ] Model the interaction explicitly:
      `drawing -> checking -> feedback -> next question/results`.
- [ ] For accepted input, show `+1 point`.
- [ ] For rejected input, show zero points and supportive feedback.
- [ ] For ambiguous input, explain that the drawing was not clearly matched;
      award zero points rather than claiming certainty about what was drawn.
- [ ] After scoring, show the approved target beside the submitted drawing.
      Optionally provide an overlay comparison using the same normalization.
- [ ] Do not reveal the target before the scored submission.
- [ ] For invalid input or evaluation failure, explain the issue and allow another
      submission without consuming the attempt. Retain the drawing on failure.
- [ ] Provide Next after feedback, including on the final question.
- [ ] Announce feedback accessibly and keep feedback understandable without color.
- [ ] Keep evaluation responsive. Move it to a worker only if profiling shows
      unacceptable main-thread blocking; do not add one speculatively.

**Done when:** a user can complete an entire drawing session, inspect feedback,
and reach results without duplicate scoring.

## Step 7: Wire navigation, setup, and results

- [ ] Add a Drawing Quiz entry in [HomeScreen.tsx](src/screens/HomeScreen.tsx).
- [ ] Wire setup, play, and results in [App.tsx](src/App.tsx).
- [ ] Reuse relevant controls from [SetupScreen.tsx](src/screens/SetupScreen.tsx):
      - Allow selecting the number of consonants.
      - Do not offer vowels or a direction toggle in drawing mode.
      - Preserve current controls and defaults for existing activities.
- [ ] Reuse [ResultsScreen.tsx](src/screens/ResultsScreen.tsx):
      - Display drawing score out of the question count.
      - Calculate accuracy from accepted answers, not quiz bonus points.
      - Show letters to review.
      - Route Play again and Retry mistakes back to drawing sessions.
      - Preserve existing quiz and flashcard results behavior.
- [ ] Match the app's visual patterns and make controls usable on narrow screens.
- [ ] Update [README.md](README.md) with the new mode, browser-local processing,
      taught-shape limitation, and any required asset attribution.

**Done when:** drawing mode is reachable from home, configurable, and replayable,
and does not change navigation or results for other modes.

## Step 8: Verify behavior and release readiness

The repository currently has build and lint scripts but no test script.
Introduce only the minimal testing setup needed for automated matcher and state
tests, following repository conventions at implementation time.

- [ ] Test normalization across drawing positions, scales, and input dimensions.
- [ ] Test the matcher with labeled acceptable, incorrect, confusing, malformed,
      tiny, scribbled, and blank samples.
- [ ] Test missing references and evaluation failures explicitly.
- [ ] Test exact scoring: one accepted answer adds one point; rejected or
      ambiguous answers add zero; invalid input and errors consume no attempt.
- [ ] Test duplicate submissions, stale evaluation results, navigation away
      during checking, final-question feedback, and results progression.
- [ ] Test that editing cannot change an already-scored answer.
- [ ] Test drawing replay and retry-mistakes routing.
- [ ] Regression-test existing quiz scoring, reverse direction, flashcards,
      overview, and results.
- [ ] Manually verify mouse, touch, and stylus where hardware is available,
      including pointer cancellation, resizing, and high-DPI rendering.
- [ ] Verify keyboard access to controls and accessible feedback announcements.
- [ ] Verify that drawing evaluation sends no drawings to external services.
- [ ] Rerun held-out quality and mobile latency measurements against the final
      integrated evaluator, not only the prototype.
- [ ] Run targeted automated tests, `npm run lint`, and `npm run build`.

**Release gate:** do not enable scored drawing mode until reference licensing,
all 30 consonants, recognition targets, exact scoring, error handling, and
existing-mode regressions have been verified.

## Suggested implementation order

1. Reference assets and representative labeled fixtures.
2. Pure matcher prototype and initial tests.
3. Full-alphabet calibration and go/no-go decision.
4. Drawing canvas.
5. Session state and scoring.
6. Drawing quiz screen and feedback.
7. Navigation, setup, results, and documentation.
8. Integrated validation and release.

Canvas work can proceed independently after the input format is agreed, but
scored release depends on the recognition quality gate.
