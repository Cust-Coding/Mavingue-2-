import RoleGate from "@/components/layout/RoleGate";
import Sidebar from "@/components/layout/Sidebar";

export default function StaffLayout({ children }: { children: React.ReactNode }) {
  return (
    <RoleGate allow={["ADMIN", "FUNCIONARIO"]}>
      <div className="min-h-[calc(100vh-var(--app-topbar-offset))]">
        <Sidebar />

        <div
          style={{
            marginLeft: "var(--sidebar-offset, 0px)",
            transition: "margin-left 300ms",
            padding: 16,
          }}
          className="pb-10 lg:px-6"
        >
          {children}
        </div>
      </div>
    </RoleGate>
  );
}
