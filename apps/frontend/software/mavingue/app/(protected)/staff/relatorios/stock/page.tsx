import PermissionGate from "@/components/layout/PermissionGate";
import { StockReportPage } from "@/features/reports/StockReportPage";

export default function StaffStockReportPage() {
  return (
    <PermissionGate permissions={["reports.stock.view"]}>
      <StockReportPage />
    </PermissionGate>
  );
}
