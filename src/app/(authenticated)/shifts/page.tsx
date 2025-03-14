import ShiftManagement from "@/components/pages/shifts/page";
import { getSession } from "@/lib/lib";
import { redirect } from "next/navigation";

export default async function Page() {
    const session = await getSession()
    if (!session) {
        redirect("/login")
    }
    return (
        <div>
            <ShiftManagement session={session} />
        </div>
    );
}