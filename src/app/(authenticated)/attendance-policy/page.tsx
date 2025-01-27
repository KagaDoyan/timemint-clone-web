import { getSession } from "@/lib/lib";
import AttendancePolicy from "@/components/pages/attendance_policy/page";
import { redirect } from "next/navigation";

export default async function Page() {
  const session = await getSession();
  if (!session) {
    redirect("/login")
  }

  return (
    <div>
      <AttendancePolicy session={session} />
    </div>
  );
}
