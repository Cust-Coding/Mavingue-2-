import PermissionGate from "@/components/layout/PermissionGate";
import { UserDetailPage } from "@/features/users/UserDetailPage";

type PageProps = {
  params: {
    id: string;
  };
};

export default function AdminUserEditPage({ params }: PageProps) {
  return (
    <PermissionGate permissions={["users.view"]}>
      <UserDetailPage scope="admin" userId={Number(params.id)} />
    </PermissionGate>
  );
}
