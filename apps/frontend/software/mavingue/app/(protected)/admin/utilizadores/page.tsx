"use client";

import PermissionGate from "@/components/layout/PermissionGate";
import { UserManagementPage } from "@/features/users/UserManagementPage";

export default function AdminUsersPage() {
  return (
    <PermissionGate permissions={["users.view"]}>
      <UserManagementPage scope="admin" />
    </PermissionGate>
  );
}
