import { BookOpen, History, Sparkles } from "lucide-react";
import { motion } from "motion/react";
import type { AppView } from "../App";

interface HeaderProps {
  activeView: AppView;
  onViewChange: (view: AppView) => void;
}

export function Header({ activeView, onViewChange }: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="container max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <motion.div
          className="flex items-center gap-2"
          initial={{ opacity: 0, x: -16 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.4 }}
        >
          <div className="w-8 h-8 rounded-md bg-primary/20 border border-primary/40 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-gold" />
          </div>
          <span className="font-display text-lg font-semibold tracking-tight text-foreground">
            ExamOracle
          </span>
        </motion.div>

        {/* Nav */}
        <nav className="flex items-center gap-1" aria-label="Main navigation">
          <NavButton
            active={activeView === "predictor"}
            onClick={() => onViewChange("predictor")}
            icon={<BookOpen className="w-3.5 h-3.5" />}
            label="Predict"
            data-ocid="nav.new_prediction_link"
          />
          <NavButton
            active={activeView === "history"}
            onClick={() => onViewChange("history")}
            icon={<History className="w-3.5 h-3.5" />}
            label="History"
            data-ocid="history.tab"
          />
        </nav>
      </div>
    </header>
  );
}

interface NavButtonProps {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  "data-ocid"?: string;
}

function NavButton({
  active,
  onClick,
  icon,
  label,
  "data-ocid": ocid,
}: NavButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-ocid={ocid}
      className={`
        relative flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium
        transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring
        ${
          active
            ? "text-primary-foreground bg-primary"
            : "text-muted-foreground hover:text-foreground hover:bg-accent"
        }
      `}
    >
      {icon}
      {label}
      {active && (
        <motion.span
          layoutId="nav-indicator"
          className="absolute inset-0 rounded-md bg-primary -z-10"
          transition={{ type: "spring", stiffness: 350, damping: 30 }}
        />
      )}
    </button>
  );
}
