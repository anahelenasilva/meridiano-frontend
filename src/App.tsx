import LayoutWrapper from "@/components/LayoutWrapper";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import { ThemeProvider, useTheme } from "@/contexts/ThemeContext";
import LoginPage from "@/pages/LoginPage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { lazy, Suspense } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// LoginPage stays eager so logged-out visitors get the form with no extra request.
const AdminYoutubeChannelAddPage = lazy(() => import("@/pages/AdminYoutubeChannelAddPage"));
const AdminYoutubeChannelsPage = lazy(() => import("@/pages/AdminYoutubeChannelsPage"));
const ArticleDetailPage = lazy(() => import("@/pages/ArticleDetailPage"));
const ArticlesPage = lazy(() => import("@/pages/ArticlesPage"));
const AudioLibraryPage = lazy(() => import("@/pages/AudioLibraryPage"));
const BookmarksPage = lazy(() => import("@/pages/BookmarksPage"));
const BriefingDetailPage = lazy(() => import("@/pages/BriefingDetailPage"));
const BriefingsPage = lazy(() => import("@/pages/BriefingsPage"));
const CustomBriefingPage = lazy(() => import("@/pages/CustomBriefingPage"));
const YoutubeTranscriptionDetailPage = lazy(() => import("@/pages/YoutubeTranscriptionDetailPage"));
const YoutubeTranscriptionsPage = lazy(() => import("@/pages/YoutubeTranscriptionsPage"));

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

// The only auth gate. Logged-out visitors see the login form at whatever URL
// they requested, so a successful login renders that page with no redirect
// plumbing.
function AppContent() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  return (
    <LayoutWrapper>
      <Suspense
        fallback={
          <div className="flex justify-center py-20">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        }
      >
        <Routes>
          <Route path="/login" element={<Navigate to="/" replace />} />
          <Route path="/" element={<Navigate to="/articles" replace />} />
          <Route path="/articles" element={<ArticlesPage />} />
          <Route path="/articles/:id" element={<ArticleDetailPage />} />
          <Route path="/archive" element={<ArticlesPage archiveScope="archived" />} />
          <Route path="/audio" element={<AudioLibraryPage />} />
          <Route path="/bookmarks" element={<BookmarksPage />} />
          <Route path="/briefings" element={<BriefingsPage />} />
          <Route path="/briefings/:id" element={<BriefingDetailPage />} />
          <Route path="/custom-briefing" element={<CustomBriefingPage />} />
          <Route path="/youtube-transcriptions" element={<YoutubeTranscriptionsPage />} />
          <Route path="/youtube-transcriptions/:id" element={<YoutubeTranscriptionDetailPage />} />
          <Route path="/admin/youtube-channels" element={<AdminYoutubeChannelsPage />} />
          <Route path="/admin/youtube-channels/add" element={<AdminYoutubeChannelAddPage />} />
        </Routes>
      </Suspense>
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
