"use client";

import PermissionGate from "@/components/layout/PermissionGate";
import { CustomerRegistryPage } from "@/features/customers/CustomerRegistryPage";

export default function StaffCustomersPage() {
  return (
    <PermissionGate permissions={["customers.view"]}>
      <CustomerRegistryPage scope="staff" />
    </PermissionGate>
  );
}
