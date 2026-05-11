import PermissionGate from "@/components/layout/PermissionGate";
import { AuditLogPage } from "@/features/reports/AuditLogPage";

export default function StaffAuditPage() {
  return (
    <PermissionGate permissions={["audit.view"]}>
      <AuditLogPage />
    </PermissionGate>
  );
}
