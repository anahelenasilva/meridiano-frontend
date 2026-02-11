import { useLocation } from "react-router-dom";
import AuthGuard from "./AuthGuard";
import Layout from "./Layout";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  const location = useLocation();
  const isLoginPage = location.pathname === "/login";

  return (
    <AuthGuard>
      {isLoginPage ? (
        <div className="min-h-screen bg-background">{children}</div>
      ) : (
        <Layout>
          <main className="max-w-6xl mx-auto px-4 py-6">{children}</main>
        </Layout>
      )}
    </AuthGuard>
  );
}
