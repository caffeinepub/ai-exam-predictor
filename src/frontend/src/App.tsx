import { Toaster } from "@/components/ui/sonner";
import { useState } from "react";
import type { Session } from "./backend.d";
import { Header } from "./components/Header";
import { HistoryView } from "./components/HistoryView";
import { PredictorView } from "./components/PredictorView";

export type AppView = "predictor" | "history";

export default function App() {
  const [view, setView] = useState<AppView>("predictor");
  const [savedSession, setSavedSession] = useState<Session | null>(null);

  const handleSessionSaved = (session: Session) => {
    setSavedSession(session);
  };

  const handleNewPrediction = () => {
    setSavedSession(null);
    setView("predictor");
  };

  return (
    <div className="min-h-screen bg-background bg-noise flex flex-col">
      <Header
        activeView={view}
        onViewChange={(v) => {
          setView(v);
          if (v === "predictor") setSavedSession(null);
        }}
      />
      <main className="flex-1">
        {view === "predictor" ? (
          <PredictorView
            savedSession={savedSession}
            onSessionSaved={handleSessionSaved}
            onNewPrediction={handleNewPrediction}
          />
        ) : (
          <HistoryView onNewPrediction={handleNewPrediction} />
        )}
      </main>
      <footer className="py-6 text-center">
        <p className="text-muted-foreground text-sm">
          © {new Date().getFullYear()}. Built with{" "}
          <span className="text-gold">♥</span> using{" "}
          <a
            href={`https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(window.location.hostname)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:underline transition-colors"
          >
            caffeine.ai
          </a>
        </p>
      </footer>
      <Toaster
        theme="dark"
        toastOptions={{
          classNames: {
            toast: "bg-card border-border text-foreground",
          },
        }}
      />
    </div>
  );
}
