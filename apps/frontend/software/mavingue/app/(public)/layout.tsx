import Topbar from "@/components/layout/Topbar";

export default function PublicLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Topbar />
      <div>{children}</div>
    </>
  );
}