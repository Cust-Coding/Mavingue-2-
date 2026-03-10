import RoleGate from "@/components/layout/RoleGate";
import Sidebar from "@/components/layout/Sidebar";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGate allow={["ADMIN", "FUNCIONARIO"]}>
      <div style={{ minHeight: "calc(100vh - 55px)" }}>
        <Sidebar />

        <div
          style={{
            marginLeft: "var(--sidebar-offset, 80px)",
            transition: "margin-left 300ms",
            padding: 16,
          }}
        >
          {children}
        </div>
      </div>
    </RoleGate>
  );
}