import PermissionGate from "@/components/layout/PermissionGate";
import { ReportsOverviewPage } from "@/features/reports/ReportsOverviewPage";

export default function StaffReportsPage() {
  return (
    <PermissionGate permissions={["reports.view"]}>
      <ReportsOverviewPage scope="staff" />
    </PermissionGate>
  );
}
