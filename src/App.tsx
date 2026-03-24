import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Index from "./pages/Index.tsx";
import BibleReader from "./pages/BibleReader.tsx";
import BibleStories from "./pages/BibleStories.tsx";
import BibleSearch from "./pages/BibleSearch.tsx";
import DailyDevotional from "./pages/DailyDevotional.tsx";
import Bookmarks from "./pages/Bookmarks.tsx";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
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
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
