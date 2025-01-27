import RoleManagement from '@/components/pages/roles/page';
import { getSession } from '@/lib/lib';
import { redirect } from 'next/navigation';

export default async function RolesPage() {
  const session = await getSession();
  if (!session) {
    redirect("/login")
  }
  return (
    <div>
      <RoleManagement session={session} />
    </div>
  );
}
