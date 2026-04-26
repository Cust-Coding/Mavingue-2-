"use client";

import PermissionGate from "@/components/layout/PermissionGate";
import { WaterRequestsPage } from "@/features/water/BackofficeWaterPages";

export default function AdminWaterRequestsRoute() {
  return (
    <PermissionGate permissions={["water.requests.review"]}>
      <WaterRequestsPage scope="admin" />
    </PermissionGate>
  );
}
