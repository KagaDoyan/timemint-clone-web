import DepartmentManagement from "@/components/pages/department/page";
import { getSession } from "@/lib/lib";
import { redirect } from "next/navigation";

export default async function Page() {
    const session = await getSession()
    if (!session) {
        redirect("/login")
    }
    return (
        <div>
            <DepartmentManagement session={session} />
        </div>
    );
}