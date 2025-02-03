import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import { getSession } from "@/lib/lib"
import { redirect } from "next/navigation"
import { DrawerMenu } from "@/components/app-drawer"

export default async function Layout({
  children
}: {
  children: React.ReactNode
}) {
  const session = await getSession()

  if (!session) {
    redirect("/login")
  }

  return (
    <SidebarProvider>
      <AppSidebar
        userRoles={session.user.roles}
        userName={session.user.name}
        userRole={session.user.roles[0] || 'Guest'}
      />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 border-b">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1 hidden sm:block" />
            <DrawerMenu
              userRoles={session.user.roles}
              userName={session.user.name}
              userRole={session.user.roles[0] || 'Guest'}
            />
          </div>
        </header>
        {children}
      </SidebarInset>
    </SidebarProvider>
  )
}
