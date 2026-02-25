import Topbar from "@/components/layout/Topbar";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Topbar />
      <div style={{ maxWidth: 1100, margin: "0 auto", padding: 16 }}>{children}</div>
    </>
  );
}