import LeavetypeManagement from "@/components/pages/leave_type/page";
import { getSession } from "@/lib/lib";
import { redirect } from "next/navigation";

export default async function Page() {
    const session = await getSession();
    if (!session) {
        redirect("/login")
    }
    return (
        <div>
            <LeavetypeManagement session={session} />
        </div>
    );
}