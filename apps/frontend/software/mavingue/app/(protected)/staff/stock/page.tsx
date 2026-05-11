import PermissionGate from "@/components/layout/PermissionGate";
import AdminStockPage from "@/app/(protected)/admin/stock/page";

export default function StaffStockPage() {
  return (
    <PermissionGate permissions={["stock.view", "stock.adjust"]}>
      <AdminStockPage />
    </PermissionGate>
  );
}
