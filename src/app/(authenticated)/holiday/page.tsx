import { getSession } from "@/lib/lib";
import { redirect } from "next/navigation";
import HolidayManagement from "@/components/pages/holiday/page";

export default async function Page() {
    const session = await getSession()
    if (!session) {
        redirect("/login")
    }
    return (
        <div>
            <HolidayManagement session={session} />
        </div>
    );
}