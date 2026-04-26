"use client";

import PermissionGate from "@/components/layout/PermissionGate";
import { UserManagementPage } from "@/features/users/UserManagementPage";

export default function StaffUsersPage() {
  return (
    <PermissionGate permissions={["users.view"]}>
      <UserManagementPage scope="staff" />
    </PermissionGate>
  );
}
