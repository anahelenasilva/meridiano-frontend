import LayoutWrapper from "@/components/LayoutWrapper";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import AdminYoutubeChannelAddPage from "@/pages/AdminYoutubeChannelAddPage";
import AdminYoutubeChannelsPage from "@/pages/AdminYoutubeChannelsPage";
import ArticleDetailPage from "@/pages/ArticleDetailPage";
import ArticlesPage from "@/pages/ArticlesPage";
import BookmarksPage from "@/pages/BookmarksPage";
import BriefingDetailPage from "@/pages/BriefingDetailPage";
import BriefingsPage from "@/pages/BriefingsPage";
import LoginPage from "@/pages/LoginPage";
import YoutubeTranscriptionDetailPage from "@/pages/YoutubeTranscriptionDetailPage";
import YoutubeTranscriptionsPage from "@/pages/YoutubeTranscriptionsPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { BrowserRouter, Route, Routes, useLocation } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function ToastContainerWrapper() {
  const { resolvedTheme } = useTheme();
  return (
    <ToastContainer
      pauseOnFocusLoss
      theme={resolvedTheme}
      limit={5}
    />
  );
}

function AppContent() {
  const { isAuthenticated } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);
  const location = useLocation();

  useEffect(() => {
    if (!isAuthenticated) {
      setAuthChecked(true);
    }
  }, [isAuthenticated]);

  if (!isAuthenticated && authChecked) {
    const redirect = new URLSearchParams(location.search).get("redirect");
    const redirectTo = redirect && redirect !== "/login" ? redirect : "/";
    return <LoginPage onLogin={() => setAuthChecked(true)} redirectTo={redirectTo} />;
  }

  return (
    <LayoutWrapper>
      <Routes>
        <Route path="/" element={<BookmarksPage />} />
        <Route path="/articles" element={<ArticlesPage />} />
        <Route path="/articles/:id" element={<ArticleDetailPage />} />
        <Route path="/bookmarks" element={<BookmarksPage />} />
        <Route path="/briefings" element={<BriefingsPage />} />
        <Route path="/briefings/:id" element={<BriefingDetailPage />} />
        <Route path="/youtube-transcriptions" element={<YoutubeTranscriptionsPage />} />
        <Route path="/youtube-transcriptions/:id" element={<YoutubeTranscriptionDetailPage />} />
        <Route path="/admin/youtube-channels" element={<AdminYoutubeChannelsPage />} />
        <Route path="/admin/youtube-channels/add" element={<AdminYoutubeChannelAddPage />} />
      </Routes>
    </LayoutWrapper>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <ToastContainerWrapper />
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
