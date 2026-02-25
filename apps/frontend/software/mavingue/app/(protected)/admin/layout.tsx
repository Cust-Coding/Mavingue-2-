import RoleGate from "@/components/layout/RoleGate";
import Sidebar from "@/components/layout/Sidebar";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGate allow={["ADMIN"]}>
      <div style={{ display: "flex", minHeight: "calc(100vh - 55px)" }}>
        <Sidebar />
        <div style={{ flex: 1, padding: 16 }}>{children}</div>
      </div>
    </RoleGate>
  );
}