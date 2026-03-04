import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  AlignLeft,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  FileText,
  Loader2,
  Plus,
  Sparkles,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Question, Session } from "../backend.d";
import { useCreateSession } from "../hooks/useQueries";
import { SummaryView } from "./SummaryView";

interface PredictorViewProps {
  savedSession: Session | null;
  onSessionSaved: (session: Session) => void;
  onNewPrediction: () => void;
}

const QUESTION_TYPE_ICONS: Record<string, React.ReactNode> = {
  "Multiple Choice": <BookOpen className="w-3.5 h-3.5" />,
  "Short Answer": <FileText className="w-3.5 h-3.5" />,
  Essay: <AlignLeft className="w-3.5 h-3.5" />,
};

const QUESTION_TYPE_ORDER = ["Multiple Choice", "Short Answer", "Essay"];

function getDifficultyClass(difficulty: string) {
  if (difficulty === "Easy") return "difficulty-easy question-border-easy";
  if (difficulty === "Medium")
    return "difficulty-medium question-border-medium";
  return "difficulty-hard question-border-hard";
}

function getDifficultyBadgeClass(difficulty: string) {
  if (difficulty === "Easy") return "difficulty-easy";
  if (difficulty === "Medium") return "difficulty-medium";
  return "difficulty-hard";
}

export function PredictorView({
  savedSession,
  onSessionSaved,
  onNewPrediction,
}: PredictorViewProps) {
  const [subject, setSubject] = useState("");
  const [notes, setNotes] = useState("");
  const [pendingSession, setPendingSession] = useState<Session | null>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showSummary, setShowSummary] = useState(false);

  const createSession = useCreateSession();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim()) return;

    try {
      const session = await createSession.mutateAsync({
        subject: subject.trim(),
        notes,
      });
      setPendingSession(session);
      onSessionSaved(session);
    } catch {
      toast.error("Failed to generate questions. Please try again.");
    }
  };

  const handleSave = () => {
    setIsSaved(true);
    toast.success("Session saved to history!");
  };

  const handleNewPrediction = () => {
    setSubject("");
    setNotes("");
    setPendingSession(null);
    setIsSaved(false);
    setAnswers({});
    setShowSummary(false);
    onNewPrediction();
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: value }));
  };

  const hasAnyAnswer = Object.values(answers).some((a) => a.trim().length > 0);

  const activeSession = savedSession || pendingSession;
  const groupedQuestions = activeSession
    ? QUESTION_TYPE_ORDER.reduce<Record<string, Question[]>>((acc, type) => {
        const qs = activeSession.questions.filter(
          (q) => q.questionType === type,
        );
        if (qs.length > 0) acc[type] = qs;
        return acc;
      }, {})
    : {};

  // Show summary if answers submitted
  if (activeSession && showSummary) {
    return (
      <SummaryView
        session={activeSession}
        answers={answers}
        onReset={handleNewPrediction}
      />
    );
  }

  // Flatten all questions in display order for textarea indexing
  const allQuestionsOrdered = QUESTION_TYPE_ORDER.flatMap(
    (type) => groupedQuestions[type] ?? [],
  );

  return (
    <div className="container max-w-3xl mx-auto px-4 py-10">
      <AnimatePresence mode="wait">
        {!activeSession ? (
          <motion.div
            key="form"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4 }}
          >
            {/* Hero */}
            <div className="text-center mb-10">
              <motion.div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-gold text-sm font-medium mb-4"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
              >
                <Sparkles className="w-3.5 h-3.5" />
                AI-Powered Exam Intelligence
              </motion.div>
              <motion.h1
                className="font-display text-4xl md:text-5xl font-semibold text-foreground mb-3 leading-tight"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.15 }}
              >
                Predict Your{" "}
                <span className="text-gold italic">Exam Questions</span>
              </motion.h1>
              <motion.p
                className="text-muted-foreground text-base md:text-lg max-w-md mx-auto leading-relaxed"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                Enter your subject and study notes. Our AI analyzes patterns to
                predict the most likely exam questions.
              </motion.p>
            </div>

            {/* Form */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <form
                onSubmit={handleSubmit}
                className="bg-card border border-border rounded-xl p-6 md:p-8 shadow-card space-y-5"
              >
                <div className="space-y-1.5">
                  <Label
                    htmlFor="subject"
                    className="text-sm font-semibold text-foreground"
                  >
                    Subject or Topic
                  </Label>
                  <Input
                    id="subject"
                    data-ocid="predictor.subject_input"
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="e.g. Photosynthesis, The French Revolution..."
                    className="bg-secondary border-border text-foreground placeholder:text-muted-foreground focus-visible:ring-ring h-11"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label
                    htmlFor="notes"
                    className="text-sm font-semibold text-foreground"
                  >
                    Study Notes / Syllabus{" "}
                    <span className="text-muted-foreground font-normal">
                      (optional)
                    </span>
                  </Label>
                  <Textarea
                    id="notes"
                    data-ocid="predictor.notes_textarea"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Paste your notes, syllabus, or key topics here..."
                    className="bg-secondary border-border text-foreground placeholder:text-muted-foreground min-h-[140px] resize-y focus-visible:ring-ring"
                  />
                  <p className="text-xs text-muted-foreground">
                    More context = more accurate predictions
                  </p>
                </div>

                <Button
                  type="submit"
                  data-ocid="predictor.submit_button"
                  disabled={createSession.isPending || !subject.trim()}
                  className="w-full h-11 font-semibold text-sm bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow transition-all duration-200"
                >
                  {createSession.isPending ? (
                    <>
                      <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                      Generating questions...
                    </>
                  ) : (
                    <>
                      <Sparkles className="mr-2 w-4 h-4" />
                      Predict Exam Questions
                    </>
                  )}
                </Button>

                {createSession.isPending && (
                  <div
                    data-ocid="predictor.loading_state"
                    className="flex flex-col items-center gap-2 pt-2"
                  >
                    <div className="flex gap-1">
                      {[0, 1, 2, 3].map((i) => (
                        <motion.div
                          key={i}
                          className="w-1.5 h-1.5 rounded-full bg-primary"
                          animate={{ opacity: [0.3, 1, 0.3] }}
                          transition={{
                            duration: 1.2,
                            repeat: Number.POSITIVE_INFINITY,
                            delay: i * 0.2,
                          }}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Analyzing curriculum patterns...
                    </p>
                  </div>
                )}
              </form>
            </motion.div>

            {/* Example subjects */}
            <motion.div
              className="mt-6 flex flex-wrap gap-2 justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
            >
              <span className="text-xs text-muted-foreground mr-1">Try:</span>
              {[
                "Cell Biology",
                "World War II",
                "Calculus",
                "Shakespeare's Hamlet",
                "Climate Science",
              ].map((ex) => (
                <button
                  key={ex}
                  type="button"
                  onClick={() => setSubject(ex)}
                  className="text-xs px-2.5 py-1 rounded-full border border-border text-muted-foreground hover:text-foreground hover:border-primary/50 transition-all"
                >
                  {ex}
                </button>
              ))}
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="results"
            data-ocid="predictor.results_section"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
          >
            {/* Results header */}
            <div className="mb-8">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-widest text-gold mb-1">
                    Predicted Questions
                  </p>
                  <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground leading-tight">
                    {activeSession.subject}
                  </h2>
                  <p className="text-muted-foreground text-sm mt-1">
                    {activeSession.questions.length} question
                    {activeSession.questions.length !== 1 ? "s" : ""} predicted
                    across {Object.keys(groupedQuestions).length} types
                  </p>
                </div>

                {isSaved ? (
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary/10 border border-primary/30">
                    <CheckCircle2 className="w-4 h-4 text-gold" />
                    <span className="text-sm font-medium text-gold">Saved</span>
                  </div>
                ) : (
                  <Button
                    data-ocid="predictor.save_button"
                    onClick={handleSave}
                    variant="outline"
                    className="border-primary/40 text-gold hover:bg-primary/10 hover:border-primary"
                  >
                    <CheckCircle2 className="mr-2 w-4 h-4" />
                    Save Session
                  </Button>
                )}
              </div>
            </div>

            {/* Instruction banner */}
            <motion.div
              className="mb-6 flex items-center gap-3 px-4 py-3 rounded-lg bg-primary/8 border border-primary/20"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <ClipboardList className="w-4 h-4 text-gold flex-shrink-0" />
              <p className="text-sm text-muted-foreground">
                Practice your answers below each question, then click{" "}
                <span className="text-gold font-medium">Submit Answers</span> to
                see your summary.
              </p>
            </motion.div>

            {/* Question groups */}
            <div className="space-y-8">
              {Object.entries(groupedQuestions).map(
                ([type, questions], groupIdx) => (
                  <motion.section
                    key={type}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: groupIdx * 0.1 }}
                  >
                    {/* Section header */}
                    <div className="flex items-center gap-2 mb-4">
                      <div className="w-7 h-7 rounded-md bg-primary/15 border border-primary/30 flex items-center justify-center text-gold">
                        {QUESTION_TYPE_ICONS[type] ?? (
                          <FileText className="w-3.5 h-3.5" />
                        )}
                      </div>
                      <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider">
                        {type}
                      </h3>
                      <span className="text-xs text-muted-foreground">
                        ({questions.length})
                      </span>
                      <div className="flex-1 h-px bg-border ml-2" />
                    </div>

                    {/* Questions */}
                    <div className="space-y-4">
                      {questions.map((question, qIdx) => {
                        const globalIdx = allQuestionsOrdered.findIndex(
                          (q) => q.id === question.id,
                        );
                        const ocidIndex = globalIdx + 1;

                        return (
                          <motion.div
                            key={question.id.toString()}
                            initial={{ opacity: 0, x: -8 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{
                              delay: groupIdx * 0.1 + qIdx * 0.06,
                            }}
                            className={`
                              bg-card border border-border rounded-lg p-4 pl-5
                              border-l-[3px] ${getDifficultyClass(question.difficulty)}
                              hover:border-opacity-60 transition-all duration-200
                            `}
                          >
                            <div className="flex items-start justify-between gap-3 mb-3">
                              <p className="text-foreground text-sm leading-relaxed flex-1">
                                {question.text}
                              </p>
                              <span
                                className={`
                                  flex-shrink-0 text-xs font-semibold px-2 py-0.5 rounded-full
                                  border ${getDifficultyBadgeClass(question.difficulty)}
                                `}
                              >
                                {question.difficulty}
                              </span>
                            </div>

                            {/* Answer textarea */}
                            <Textarea
                              data-ocid={`predictor.answer_textarea.${ocidIndex}`}
                              rows={3}
                              value={answers[question.id.toString()] ?? ""}
                              onChange={(e) =>
                                handleAnswerChange(
                                  question.id.toString(),
                                  e.target.value,
                                )
                              }
                              placeholder="Type your answer here..."
                              className="mt-1 bg-secondary/60 border-border/60 text-foreground placeholder:text-muted-foreground/60 text-sm resize-none focus-visible:ring-ring focus-visible:ring-1 focus-visible:border-primary/50 transition-colors"
                            />
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.section>
                ),
              )}
            </div>

            {/* Actions */}
            <motion.div
              className="mt-10 flex flex-col sm:flex-row items-center gap-3 justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <Button
                data-ocid="predictor.submit_answers_button"
                onClick={() => setShowSummary(true)}
                disabled={!hasAnyAnswer}
                className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow w-full sm:w-auto disabled:opacity-40 disabled:cursor-not-allowed"
              >
                <ClipboardList className="mr-2 w-4 h-4" />
                Submit Answers
              </Button>
              {!isSaved && (
                <Button
                  data-ocid="predictor.save_button"
                  onClick={handleSave}
                  variant="outline"
                  className="border-primary/40 text-gold hover:bg-primary/10 hover:border-primary w-full sm:w-auto"
                >
                  <CheckCircle2 className="mr-2 w-4 h-4" />
                  Save to History
                </Button>
              )}
              <Button
                data-ocid="predictor.new_prediction_button"
                onClick={handleNewPrediction}
                variant="outline"
                className="border-border text-foreground hover:bg-accent w-full sm:w-auto"
              >
                <Plus className="mr-2 w-4 h-4" />
                Start New Prediction
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
