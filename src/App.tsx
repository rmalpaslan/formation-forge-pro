import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { AppLayout } from "@/components/AppLayout";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Index from "./pages/Index";
import AnalysisList from "./pages/AnalysisList";
import AnalysisNew from "./pages/AnalysisNew";
import AnalysisEdit from "./pages/AnalysisEdit";
import PlayerList from "./pages/PlayerList";
import PlayerNew from "./pages/PlayerNew";
import SquadBuilder from "./pages/SquadBuilder";
import SettingsPage from "./pages/SettingsPage";
import AccountPage from "./pages/AccountPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <LanguageProvider>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
                <Route index element={<Index />} />
                <Route path="analyses" element={<AnalysisList />} />
                <Route path="analyses/new" element={<AnalysisNew />} />
                <Route path="analyses/:id/edit" element={<AnalysisEdit />} />
                <Route path="players" element={<PlayerList />} />
                <Route path="players/new" element={<PlayerNew />} />
                <Route path="players/:id/edit" element={<PlayerNew />} />
                <Route path="squad-builder" element={<SquadBuilder />} />
                <Route path="settings" element={<SettingsPage />} />
                <Route path="account" element={<AccountPage />} />
              </Route>
              <Route path="*" element={<NotFound />} />
            </Routes>
          </LanguageProvider>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
