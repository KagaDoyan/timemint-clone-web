import EmployeePage from "@/components/pages/day_of_work/page"
import { getSession } from "@/lib/lib"
import { redirect } from "next/navigation"

export default async function Page() {
    const session = await getSession()
    if (!session) {
        redirect("/login")
    }

    return (
        <div>
            <EmployeePage session={session} />
        </div>
    )
}