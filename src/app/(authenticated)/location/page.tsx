import LocationManagement from "@/components/pages/location/page";
import { getSession } from "@/lib/lib";
import { redirect } from "next/navigation";

export default async function Page() {
    const session = await getSession();
    if (!session) {
        redirect("/login")
    }
    return (
        <div>
            <LocationManagement session={session} />
        </div>
    );
}