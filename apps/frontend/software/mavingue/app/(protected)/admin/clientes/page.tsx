"use client";

import PermissionGate from "@/components/layout/PermissionGate";
import { CustomerRegistryPage } from "@/features/customers/CustomerRegistryPage";

export default function AdminCustomersPage() {
  return (
    <PermissionGate permissions={["customers.view"]}>
      <CustomerRegistryPage scope="admin" />
    </PermissionGate>
  );
}
