import Layout from "./Layout";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Layout>
      <main className="max-w-8xl mx-auto px-4 py-6">{children}</main>
    </Layout>
  );
}
