"use client";

import PermissionGate from "@/components/layout/PermissionGate";
import { WaterBillingRulesPage } from "@/features/water/BackofficeWaterPages";

export default function StaffWaterBillingRulesRoute() {
  return (
    <PermissionGate permissions={["water.billing-rules.manage"]}>
      <WaterBillingRulesPage scope="staff" />
    </PermissionGate>
  );
}
