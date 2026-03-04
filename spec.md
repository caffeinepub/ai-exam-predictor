# AI Exam Predictor

## Current State
The app generates predicted exam questions from a subject/topic and optional study notes. Questions are grouped by type (Multiple Choice, Short Answer, Essay) and shown with difficulty badges. Users can save sessions to history. The results screen shows questions only -- there is no answer input or summary feature.

## Requested Changes (Diff)

### Add
- An answer input area on the results screen: each predicted question gets a text input/textarea where the user can type their answer.
- A "Submit Answers" button that, when clicked, transitions to a Summary screen.
- A Summary screen showing:
  - Overall completion stats (how many questions answered vs total)
  - A list of each question with the user's typed answer alongside it
  - A brief AI-generated review/feedback note per answer (generated client-side using simple heuristics or shown as "Answer recorded")
  - A breakdown by difficulty (Easy / Medium / Hard count)
  - A "Try New Prediction" button to reset

### Modify
- PredictorView: add answer state management (map of questionId -> answer string), and a mode toggle between "questions" view and "summary" view.
- The results section action buttons: replace or supplement with a "Submit Answers" primary CTA once at least one answer has been typed.

### Remove
- Nothing removed.

## Implementation Plan
1. In `PredictorView.tsx`:
   - Add `answers` state: `Record<string, string>` keyed by question id.
   - Add `showSummary` boolean state.
   - Render an answer `Textarea` below each question card.
   - Add a "Submit Answers" button in the actions area (enabled when at least one answer is filled).
   - On submit, set `showSummary = true`.
2. Create `SummaryView.tsx` component:
   - Accepts `session`, `answers`, and `onReset` props.
   - Shows overall stats: total questions, answered count, breakdown by difficulty.
   - Lists each question with the user's answer (or "No answer provided" if blank).
   - "Start New Prediction" button calls `onReset`.
3. Wire `SummaryView` into `PredictorView` via `showSummary` state.
