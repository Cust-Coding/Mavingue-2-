import PermissionGate from "@/components/layout/PermissionGate";
import { SalesReportPage } from "@/features/reports/SalesReportPage";

export default function StaffSalesReportPage() {
  return (
    <PermissionGate permissions={["reports.sales.view"]}>
      <SalesReportPage />
    </PermissionGate>
  );
}