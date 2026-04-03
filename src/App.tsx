import { useState, useCallback } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import SplashScreen from "@/components/SplashScreen";
import OnboardingQuestionnaire, {
  useOnboarding,
} from "@/components/OnboardingQuestionnaire";
import Index from "./pages/Index.tsx";
import BibleReader from "./pages/BibleReader.tsx";
import BibleStories from "./pages/BibleStories.tsx";
import BibleSearch from "./pages/BibleSearch.tsx";
import DailyDevotional from "./pages/DailyDevotional.tsx";
import Bookmarks from "./pages/Bookmarks.tsx";
import BibleChat from "./pages/BibleChat.tsx";
import Progress from "./pages/Progress.tsx";
import GospelMusic from "./pages/GospelMusic.tsx";
import LyricsSync from "./pages/LyricsSync.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

function AppContent() {
  const [splashDone, setSplashDone] = useState(false);
  const { needsOnboarding, completeOnboarding } = useOnboarding();

  const handleSplashComplete = useCallback(() => {
    setSplashDone(true);
  }, []);

  return (
    <>
      {/* Splash Screen */}
      {!splashDone && <SplashScreen onComplete={handleSplashComplete} />}

      {/* Onboarding Questionnaire — shows after splash, only first time */}
      {splashDone && needsOnboarding && (
        <OnboardingQuestionnaire onComplete={completeOnboarding} />
      )}

      {/* Main App */}
      <div
        style={{
          opacity: splashDone && !needsOnboarding ? 1 : 0,
          transition: "opacity 0.5s ease",
        }}
      >
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/read" element={<BibleReader />} />
            <Route path="/stories" element={<BibleStories />} />
            <Route path="/search" element={<BibleSearch />} />
            <Route path="/devotional" element={<DailyDevotional />} />
            <Route path="/bookmarks" element={<Bookmarks />} />
            <Route path="/chat" element={<BibleChat />} />
            <Route path="/progress" element={<Progress />} />
            <Route path="/music" element={<GospelMusic />} />
            <Route path="/lyrics" element={<LyricsSync />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </div>
    </>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppContent />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
