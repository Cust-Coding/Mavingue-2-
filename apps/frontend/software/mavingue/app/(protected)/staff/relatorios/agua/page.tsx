import PermissionGate from "@/components/layout/PermissionGate";
import { WaterReportPage } from "@/features/reports/WaterReportPage";

export default function StaffWaterReportPage() {
  return (
    <PermissionGate permissions={["reports.water.view"]}>
      <WaterReportPage />
    </PermissionGate>
  );
}
