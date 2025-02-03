import LeaveApprovalPage from "@/components/pages/leave_approval/page";
import { getSession } from "@/lib/lib";
import { redirect } from "next/navigation";


export default async function Page() {
    const session = await getSession();
    if (!session) {
        redirect("/login");
    }
    return (
        <div>
            <LeaveApprovalPage session={session}/>
        </div>
    )
}