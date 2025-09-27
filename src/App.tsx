
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { NavigationProvider } from "@/context/NavigationContext";
import { AuthProvider } from "@/context/AuthContext";
import { AudioPlayerProvider } from "@/context/AudioPlayerContext";
import { AudioProgressProvider } from "@/context/AudioProgressContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ResetPasswordScreen } from "@/components/auth/ResetPasswordScreen";
import { AudioPlayerBar } from "@/components/AudioPlayerBar";

import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <BrowserRouter>
      <AuthProvider>
        <AudioPlayerProvider>
          <AudioProgressProvider>
            <NavigationProvider>
              <Toaster />
              <Sonner />
              <Routes>
                <Route path="/" element={<Index />} />
                <Route path="/reset-password" element={<ResetPasswordScreen />} />
                {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                <Route path="*" element={<NotFound />} />
              </Routes>
              <AudioPlayerBar />
            </NavigationProvider>
          </AudioProgressProvider>
        </AudioPlayerProvider>
      </AuthProvider>
    </BrowserRouter>
  </QueryClientProvider>
);

export default App;
