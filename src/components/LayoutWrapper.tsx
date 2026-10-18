import Layout from "./Layout";

export default function LayoutWrapper({ children }: { children: React.ReactNode }) {
  return (
    <Layout>
      <main className="mx-auto max-w-6xl px-4 py-6">{children}</main>
    </Layout>
  );
}
