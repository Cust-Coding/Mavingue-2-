import Topbar from "@/components/layout/Topbar";
export default function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Topbar />
      {children}
    </>
  );
}