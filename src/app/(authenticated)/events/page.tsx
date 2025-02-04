import { getSession } from "@/lib/lib";
import { redirect } from "next/navigation";
import EventManagement from "@/components/pages/events/page";

export default async function Page() {
    const session = await getSession()
    if (!session) {
        redirect("/login")
    }
    return (
        <div>
            <EventManagement session={session} />
        </div>
    );
}