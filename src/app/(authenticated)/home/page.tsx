import { getSession } from "@/lib/lib";
import HomePage from "@/components/pages/home/page";

export default async function Page() {
  const session = await getSession();

  return (
    <div>
      <HomePage session={session} />
    </div>
  );
}
