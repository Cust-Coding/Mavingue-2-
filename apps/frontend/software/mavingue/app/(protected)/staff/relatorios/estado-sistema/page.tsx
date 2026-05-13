import PermissionGate from "@/components/layout/PermissionGate";
import { SystemStatusPage } from "@/features/reports/SystemStatusPage";

export default function StaffSystemStatusPage() {
  return (
    <PermissionGate permissions={["reports.system-status.view"]}>
      <SystemStatusPage />
    </PermissionGate>
  );
}
