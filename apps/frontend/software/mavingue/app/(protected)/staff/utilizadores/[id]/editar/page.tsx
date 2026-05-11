import PermissionGate from "@/components/layout/PermissionGate";
import { UserDetailPage } from "@/features/users/UserDetailPage";

type PageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function StaffUserEditPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <PermissionGate permissions={["users.view"]}>
      <UserDetailPage scope="staff" userId={Number(id)} />
    </PermissionGate>
  );
}
