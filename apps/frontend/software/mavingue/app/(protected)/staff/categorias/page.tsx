import PermissionGate from "@/components/layout/PermissionGate";
import AdminCategoriesRoute from "@/app/(protected)/admin/categorias/page";

export default function StaffCategoriesRoute() {
  return (
    <PermissionGate permissions={["categories.manage"]}>
      <AdminCategoriesRoute />
    </PermissionGate>
  );
}
