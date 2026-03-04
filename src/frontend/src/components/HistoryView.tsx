import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlignLeft,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  Plus,
  Sparkles,
  Trash2,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { toast } from "sonner";
import type { Question, Session } from "../backend.d";
import { useDeleteSession, useGetSessions } from "../hooks/useQueries";

interface HistoryViewProps {
  onNewPrediction: () => void;
}

const QUESTION_TYPE_ICONS: Record<string, React.ReactNode> = {
  "Multiple Choice": <BookOpen className="w-3 h-3" />,
  "Short Answer": <FileText className="w-3 h-3" />,
  Essay: <AlignLeft className="w-3 h-3" />,
};

function formatDate(nanoseconds: bigint): string {
  const ms = Number(nanoseconds / BigInt(1_000_000));
  const date = new Date(ms);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function getDifficultyBadgeClass(difficulty: string) {
  if (difficulty === "Easy") return "difficulty-easy";
  if (difficulty === "Medium") return "difficulty-medium";
  return "difficulty-hard";
}

function getDifficultyBorderClass(difficulty: string) {
  if (difficulty === "Easy") return "question-border-easy";
  if (difficulty === "Medium") return "question-border-medium";
  return "question-border-hard";
}

function getTypeCount(questions: Question[], type: string) {
  return questions.filter((q) => q.questionType === type).length;
}

export function HistoryView({ onNewPrediction }: HistoryViewProps) {
  const { data: sessions, isLoading, isError } = useGetSessions();
  const deleteSession = useDeleteSession();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const sortedSessions = sessions
    ? [...sessions].sort((a, b) => (b.createdAt > a.createdAt ? 1 : -1))
    : [];

  const handleDelete = async (session: Session) => {
    setDeletingId(session.id.toString());
    try {
      await deleteSession.mutateAsync(session.id);
      toast.success(`"${session.subject}" removed from history.`);
      if (expandedId === session.id.toString()) setExpandedId(null);
    } catch {
      toast.error("Failed to delete session. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="container max-w-3xl mx-auto px-4 py-10">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-gold mb-1">
            Session History
          </p>
          <h2 className="font-display text-3xl font-semibold text-foreground">
            Past Predictions
          </h2>
        </div>
        <div data-ocid="history.loading_state" className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-20 w-full rounded-xl bg-card" />
          ))}
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="container max-w-3xl mx-auto px-4 py-10">
        <div
          data-ocid="history.error_state"
          className="text-center py-20 text-destructive"
        >
          <p className="font-medium">Failed to load history.</p>
          <p className="text-sm text-muted-foreground mt-1">
            Please refresh and try again.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-3xl mx-auto px-4 py-10">
      {/* Header */}
      <motion.div
        className="flex items-start justify-between gap-4 mb-8 flex-wrap"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-gold mb-1">
            Session History
          </p>
          <h2 className="font-display text-3xl md:text-4xl font-semibold text-foreground">
            Past Predictions
          </h2>
          {sortedSessions.length > 0 && (
            <p className="text-muted-foreground text-sm mt-1">
              {sortedSessions.length} session
              {sortedSessions.length !== 1 ? "s" : ""} saved
            </p>
          )}
        </div>
        <Button
          data-ocid="predictor.new_prediction_button"
          onClick={onNewPrediction}
          className="bg-primary text-primary-foreground hover:bg-primary/90 shadow-glow"
        >
          <Plus className="mr-2 w-4 h-4" />
          New Prediction
        </Button>
      </motion.div>

      {/* Empty state */}
      {sortedSessions.length === 0 ? (
        <motion.div
          data-ocid="history.empty_state"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col items-center justify-center py-20 text-center"
        >
          <div className="w-16 h-16 rounded-full border-2 border-dashed border-border flex items-center justify-center mb-4">
            <Sparkles className="w-7 h-7 text-muted-foreground" />
          </div>
          <h3 className="font-display text-xl font-semibold text-foreground mb-2">
            No predictions yet
          </h3>
          <p className="text-muted-foreground text-sm max-w-xs">
            Run your first prediction to see your saved sessions here.
          </p>
          <Button
            onClick={onNewPrediction}
            className="mt-6 bg-primary text-primary-foreground hover:bg-primary/90"
          >
            <Sparkles className="mr-2 w-4 h-4" />
            Make a Prediction
          </Button>
        </motion.div>
      ) : (
        /* Session list */
        <div data-ocid="history.list" className="space-y-3">
          {sortedSessions.map((session, idx) => (
            <SessionRow
              key={session.id.toString()}
              session={session}
              index={idx + 1}
              isExpanded={expandedId === session.id.toString()}
              isDeleting={deletingId === session.id.toString()}
              onToggle={() =>
                setExpandedId(
                  expandedId === session.id.toString()
                    ? null
                    : session.id.toString(),
                )
              }
              onDelete={() => handleDelete(session)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface SessionRowProps {
  session: Session;
  index: number;
  isExpanded: boolean;
  isDeleting: boolean;
  onToggle: () => void;
  onDelete: () => void;
}

function SessionRow({
  session,
  index,
  isExpanded,
  isDeleting,
  onToggle,
  onDelete,
}: SessionRowProps) {
  const mcCount = getTypeCount(session.questions, "Multiple Choice");
  const saCount = getTypeCount(session.questions, "Short Answer");
  const essayCount = getTypeCount(session.questions, "Essay");

  const QUESTION_TYPE_ORDER = ["Multiple Choice", "Short Answer", "Essay"];

  const groupedQuestions = QUESTION_TYPE_ORDER.reduce<
    Record<string, Question[]>
  >((acc, type) => {
    const qs = session.questions.filter((q) => q.questionType === type);
    if (qs.length > 0) acc[type] = qs;
    return acc;
  }, {});

  return (
    <motion.div
      data-ocid={`history.item.${index}`}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-card border border-border rounded-xl overflow-hidden"
    >
      {/* Row header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center gap-4 p-4 text-left hover:bg-accent/40 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        aria-expanded={isExpanded}
      >
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-foreground truncate">
            {session.subject}
          </h3>
          <div className="flex items-center gap-3 mt-1 flex-wrap">
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="w-3 h-3" />
              {formatDate(session.createdAt)}
            </span>
            <span className="text-xs text-muted-foreground">
              {session.questions.length} question
              {session.questions.length !== 1 ? "s" : ""}
            </span>
            {/* Type breakdown */}
            <div className="flex items-center gap-2">
              {mcCount > 0 && (
                <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                  {QUESTION_TYPE_ICONS["Multiple Choice"]}
                  {mcCount} MC
                </span>
              )}
              {saCount > 0 && (
                <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                  {QUESTION_TYPE_ICONS["Short Answer"]}
                  {saCount} SA
                </span>
              )}
              {essayCount > 0 && (
                <span className="flex items-center gap-0.5 text-xs text-muted-foreground">
                  {QUESTION_TYPE_ICONS.Essay}
                  {essayCount} Essay
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                data-ocid={`history.delete_button.${index}`}
                onClick={(e) => e.stopPropagation()}
                disabled={isDeleting}
                className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
                aria-label={`Delete ${session.subject}`}
              >
                {isDeleting ? (
                  <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4" />
                )}
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-card border-border">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-foreground">
                  Delete session?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-muted-foreground">
                  This will permanently delete &ldquo;{session.subject}&rdquo;
                  and all {session.questions.length} predicted questions.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel
                  data-ocid="history.cancel_button"
                  className="border-border text-foreground hover:bg-accent"
                >
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  data-ocid="history.confirm_button"
                  onClick={onDelete}
                  className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>

          <span className="text-muted-foreground">
            {isExpanded ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </span>
        </div>
      </button>

      {/* Expanded questions */}
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            style={{ overflow: "hidden" }}
          >
            <div className="px-4 pb-4 border-t border-border pt-4 space-y-5">
              {Object.entries(groupedQuestions).map(([type, questions]) => (
                <div key={type}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-gold">
                      {QUESTION_TYPE_ICONS[type] ?? (
                        <FileText className="w-3 h-3" />
                      )}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {type}
                    </span>
                    <div className="flex-1 h-px bg-border" />
                  </div>
                  <div className="space-y-2">
                    {questions.map((q) => (
                      <div
                        key={q.id.toString()}
                        className={`
                          bg-secondary/50 border border-border rounded-md px-3 py-2.5 pl-4
                          border-l-2 ${getDifficultyBorderClass(q.difficulty)}
                          flex items-start justify-between gap-3
                        `}
                      >
                        <p className="text-sm text-foreground leading-relaxed flex-1">
                          {q.text}
                        </p>
                        <span
                          className={`
                            flex-shrink-0 text-xs font-semibold px-1.5 py-0.5 rounded
                            border ${getDifficultyBadgeClass(q.difficulty)}
                          `}
                        >
                          {q.difficulty}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
