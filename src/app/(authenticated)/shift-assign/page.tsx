import ShiftAssignManagement from "@/components/pages/shift_assign/page";
import { getSession } from "@/lib/lib";
import { redirect } from "next/navigation";

export default async function Page() {
    const session = await getSession()
    if (!session) {
        redirect("/login")
    }
    return (
        <div>
            <ShiftAssignManagement session={session} />
        </div>
    );
}