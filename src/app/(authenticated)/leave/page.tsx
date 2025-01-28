import LeavePage from "@/components/pages/leave/page";
import { getSession } from "@/lib/lib";
import { redirect } from "next/navigation";

export default async function Page() {
    const session = await getSession();
    if (!session) {
        redirect("/login")
    }
    return (
        <div>
            <LeavePage session={session} />
        </div>
    );
}