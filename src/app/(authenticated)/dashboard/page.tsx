import { getSession } from "@/lib/lib";
import { redirect } from "next/navigation";

export default async function Page() {
    const session = await getSession();
    if (!session) {
        redirect("/login")
    }
    return (
        <div>
            <h1>Dashboard</h1>
        </div>
    );
}