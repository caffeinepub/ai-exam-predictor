import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  AlignLeft,
  BookOpen,
  CheckCircle2,
  FileText,
  MessageSquare,
  Plus,
  RotateCcw,
  TrendingUp,
} from "lucide-react";
import { motion } from "motion/react";
import type { Session } from "../backend.d";

interface SummaryViewProps {
  session: Session;
  answers: Record<string, string>;
  onReset: () => void;
}

const QUESTION_TYPE_ICONS: Record<string, React.ReactNode> = {
  "Multiple Choice": <BookOpen className="w-3.5 h-3.5" />,
  "Short Answer": <FileText className="w-3.5 h-3.5" />,
  Essay: <AlignLeft className="w-3.5 h-3.5" />,
};

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

export function SummaryView({ session, answers, onReset }: SummaryViewProps) {
  const totalQuestions = session.questions.length;
  const answeredCount = session.questions.filter(
    (q) => (answers[q.id.toString()] || "").trim().length > 0,
  ).length;
  const unansweredCount = totalQuestions - answeredCount;

  const easyCount = session.questions.filter(
    (q) => q.difficulty === "Easy",
  ).length;
  const mediumCount = session.questions.filter(
    (q) => q.difficulty === "Medium",
  ).length;
  const hardCount = session.questions.filter(
    (q) => q.difficulty === "Hard",
  ).length;

  const completionPct =
    totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  return (
    <div className="container max-w-3xl mx-auto px-4 py-10">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45 }}
      >
        {/* Header */}
        <div className="mb-8">
          <motion.div
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-gold text-sm font-medium mb-4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            Answer Summary
          </motion.div>
          <motion.h2
            className="font-display text-3xl md:text-4xl font-semibold text-foreground leading-tight mb-2"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
          >
            Your Answers for{" "}
            <span className="text-gold italic">{session.subject}</span>
          </motion.h2>
          <motion.p
            className="text-muted-foreground text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Review your responses below. Use this to gauge your preparation.
          </motion.p>
        </div>

        {/* Stats bar */}
        <motion.div
          className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          data-ocid="summary.panel"
        >
          {/* Answered */}
          <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium uppercase tracking-wider">
              <CheckCircle2 className="w-3.5 h-3.5 text-gold" />
              Answered
            </div>
            <p className="text-2xl font-semibold font-display text-foreground">
              {answeredCount}
              <span className="text-sm text-muted-foreground font-sans font-normal ml-1">
                / {totalQuestions}
              </span>
            </p>
            <div className="w-full bg-secondary rounded-full h-1 mt-1">
              <div
                className="bg-primary h-1 rounded-full transition-all duration-700"
                style={{ width: `${completionPct}%` }}
              />
            </div>
          </div>

          {/* Skipped */}
          <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-1">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium uppercase tracking-wider">
              <MessageSquare className="w-3.5 h-3.5 text-muted-foreground" />
              Skipped
            </div>
            <p className="text-2xl font-semibold font-display text-foreground">
              {unansweredCount}
            </p>
          </div>

          {/* Difficulty breakdown */}
          <div className="bg-card border border-border rounded-xl p-4 flex flex-col gap-1 col-span-2">
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium uppercase tracking-wider mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Difficulty
            </div>
            <div className="flex gap-3 flex-wrap">
              {easyCount > 0 && (
                <span className="text-sm font-semibold difficulty-easy px-2 py-0.5 rounded-full border">
                  {easyCount} Easy
                </span>
              )}
              {mediumCount > 0 && (
                <span className="text-sm font-semibold difficulty-medium px-2 py-0.5 rounded-full border">
                  {mediumCount} Medium
                </span>
              )}
              {hardCount > 0 && (
                <span className="text-sm font-semibold difficulty-hard px-2 py-0.5 rounded-full border">
                  {hardCount} Hard
                </span>
              )}
              {easyCount === 0 && mediumCount === 0 && hardCount === 0 && (
                <span className="text-sm text-muted-foreground">—</span>
              )}
            </div>
          </div>
        </motion.div>

        <Separator className="mb-8 bg-border" />

        {/* Question + Answer list */}
        <motion.div
          className="space-y-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.35 }}
        >
          <h3 className="font-semibold text-foreground text-sm uppercase tracking-wider mb-4 flex items-center gap-2">
            <FileText className="w-4 h-4 text-gold" />
            All Responses
          </h3>

          {session.questions.map((question, idx) => {
            const userAnswer = (answers[question.id.toString()] || "").trim();
            const hasAnswer = userAnswer.length > 0;

            return (
              <motion.div
                key={question.id.toString()}
                data-ocid={`summary.item.${idx + 1}`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.35 + idx * 0.05 }}
                className={`
                  bg-card border border-border rounded-lg p-5 pl-5
                  border-l-[3px] ${getDifficultyClass(question.difficulty)}
                `}
              >
                {/* Question header */}
                <div className="flex items-start gap-3 mb-3">
                  <span className="flex-shrink-0 text-xs font-semibold text-muted-foreground mt-0.5 min-w-[1.5rem]">
                    Q{idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="text-foreground text-sm leading-relaxed mb-2">
                      {question.text}
                    </p>
                    <div className="flex flex-wrap items-center gap-2">
                      <span
                        className={`
                          text-xs font-semibold px-2 py-0.5 rounded-full border
                          ${getDifficultyBadgeClass(question.difficulty)}
                        `}
                      >
                        {question.difficulty}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-xs border-border text-muted-foreground gap-1"
                      >
                        {QUESTION_TYPE_ICONS[question.questionType] ?? (
                          <FileText className="w-3 h-3" />
                        )}
                        {question.questionType}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Answer */}
                <div className="ml-9 mt-3 pt-3 border-t border-border/60">
                  <div className="flex items-start gap-2">
                    <MessageSquare
                      className={`w-3.5 h-3.5 mt-0.5 flex-shrink-0 ${hasAnswer ? "text-gold" : "text-muted-foreground/50"}`}
                    />
                    {hasAnswer ? (
                      <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
                        {userAnswer}
                      </p>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No answer provided
                      </p>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>

        {/* Footer actions */}
        <motion.div
          className="mt-10 flex flex-col sm:flex-row items-center gap-3 justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <Button
            data-ocid="summary.new_prediction_button"
            onClick={onReset}
            className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow w-full sm:w-auto"
          >
            <Plus className="mr-2 w-4 h-4" />
            Start New Prediction
          </Button>
          <Button
            data-ocid="summary.secondary_button"
            onClick={onReset}
            variant="outline"
            className="border-border text-foreground hover:bg-accent w-full sm:w-auto"
          >
            <RotateCcw className="mr-2 w-4 h-4" />
            Try Again
          </Button>
        </motion.div>
      </motion.div>
    </div>
  );
}
