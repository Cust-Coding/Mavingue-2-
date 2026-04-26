"use client";

import PermissionGate from "@/components/layout/PermissionGate";
import { WaterRequestsPage } from "@/features/water/BackofficeWaterPages";

export default function StaffWaterRequestsRoute() {
  return (
    <PermissionGate permissions={["water.requests.review"]}>
      <WaterRequestsPage scope="staff" />
    </PermissionGate>
  );
}
