import RoleGate from "@/components/layout/RoleGate";
import Sidebar from "@/components/layout/Sidebar";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGate allow={["ADMIN", "FUNCIONARIO"]}>
      <div style={{ display: "flex", minHeight: "calc(100vh - 55px)" }}>
        <Sidebar />
        <div style={{ flex: 1, padding: 16 }}>{children}</div>
      </div>
    </RoleGate>
  );
}