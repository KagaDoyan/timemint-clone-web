import { getSession } from "@/lib/lib";
import DashboardPage from "@/components/pages/dashboard/page";

export default async function Page() {
  const session = await getSession();

  return (
    <div>
      <DashboardPage session={session} />
    </div>
  );
}
