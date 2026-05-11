"use client";

import PermissionGate from "@/components/layout/PermissionGate";
import { CategoryManagementPage } from "@/features/categories/CategoryManagementPage";

export default function AdminCategoriesRoute() {
  return (
    <PermissionGate permissions={["categories.manage"]}>
      <CategoryManagementPage />
    </PermissionGate>
  );
}
