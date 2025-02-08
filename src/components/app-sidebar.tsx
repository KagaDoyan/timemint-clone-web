"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton
} from "@/components/ui/sidebar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { handleLogout } from "@/app/(authenticated)/actions"
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  ChevronRight,
  User2,
  MoreHorizontal,
  Moon,
  Sun,
  Calendar,
  MapPin,
  TreePine,
  Home,
  Network
} from "lucide-react"
import { useTheme } from "next-themes"
import { navigationGroups } from './nav-item'

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userRoles?: string[]
  userName?: string
  userRole?: string
}

// Function to generate a consistent color based on the first letter
const getAvatarColor = (letter: string) => {
  const colors = [
    'bg-red-100 text-red-600',
    'bg-blue-100 text-blue-600',
    'bg-green-100 text-green-600',
    'bg-purple-100 text-purple-600',
    'bg-yellow-100 text-yellow-600',
    'bg-pink-100 text-pink-600',
    'bg-indigo-100 text-indigo-600',
    'bg-teal-100 text-teal-600',
    'bg-orange-100 text-orange-600',
  ]

  // Use the character code to generate a consistent index
  const index = letter.toUpperCase().charCodeAt(0) % colors.length
  return colors[index]
}

export function AppSidebar({
  userRoles = [],
  userName = 'User',
  userRole = 'Guest',
  ...props
}: AppSidebarProps) {
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()
  const firstLetter = userName.charAt(0).toUpperCase()
  const avatarColor = getAvatarColor(firstLetter)

  // Filter navigation items based on user roles
  const filteredNavigation = navigationGroups
    ?.map(group => ({
      ...group,
      items: group.items.filter(item =>
        item.roles.some(role => userRoles.includes(role))
      )
    }))
    .filter(group => {
      // If group has a role property, check if user has any of those roles
      if (group.group.role) {
        return group.group.role.some(role => userRoles.includes(role)) && group.items.length > 0;
      }
      // If no role specified for group, keep the group
      return group.items.length > 0;
    });

  return (
    <Sidebar {...props} className="bg-background text-foreground">
      <SidebarHeader>
        <div className="p-4 flex items-center">
          <div className="flex-grow">
            <div className="font-semibold text-lg">Attendance App</div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        {filteredNavigation?.map((group) => (
          <SidebarGroup key={group.group.name}>
            <div className="text-xs text-muted-foreground uppercase px-4 py-2">
              {group.group.name}
            </div>
            <SidebarMenu>
              {group.items?.map((item) => (
                <SidebarMenuButton
                  key={item.href}
                  asChild
                  isActive={pathname === item.href}
                  tooltip={item.title}
                  className={`group relative transition-all duration-300 ease-in-out ${pathname === item.href ? 'before:absolute before:inset-y-0 before:left-0 before:w-1 before:rounded-full before:bg-primary before:transition-all before:duration-300 before:ease-in-out' : 'hover:bg-accent/10'} rounded-lg`}
                >
                  <Link href={item.href}>
                    <div className={`flex items-center justify-between w-full px-4 py-2 transition-all duration-300 ease-in-out ${pathname === item.href ? 'bg-primary/10 scale-[1.02] rounded-lg' : 'rounded-lg'}`}>
                      <div className="flex items-center">
                        <item.icon
                          className={`mr-3 transition-all duration-300 ease-in-out ${pathname === item.href ? 'text-primary scale-110' : ''}`}
                          size={20}
                        />
                        <span className={`text-sm transition-all duration-300 ease-in-out ${pathname === item.href ? 'font-semibold text-primary' : ''}`}>
                          {item.title}
                        </span>
                      </div>
                      <ChevronRight
                        size={16}
                        className={`text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-300 ease-in-out ${pathname === item.href ? 'opacity-100 text-primary scale-110' : ''}`}
                      />
                    </div>
                  </Link>
                </SidebarMenuButton>
              ))}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <div className="px-4 py-3 border-t">
            <div className="flex items-center justify-between">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center space-x-3 w-full hover:bg-accent/10 rounded-md p-2 transition-colors">
                    <div className={`w-10 h-10 flex items-center justify-center ${avatarColor} rounded-full`}>
                      <span className="font-semibold text-lg">
                        {firstLetter}
                      </span>
                    </div>
                    <div className="flex-grow text-left ml-2">
                      <div className="font-semibold text-sm">{userName}</div>
                      <div className="text-xs text-muted-foreground">
                        {userRole}
                      </div>
                    </div>
                    <MoreHorizontal size={16} className="text-muted-foreground" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" side="top" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex items-center space-x-2">
                      <div className={`w-8 h-8 flex items-center justify-center ${avatarColor} rounded-full`}>
                        <span className="font-semibold">
                          {firstLetter}
                        </span>
                      </div>
                      <span>{userName}</span>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => setTheme(theme === "dark" ? "light" : "dark")}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center">
                      {theme === "dark" ? (
                        <Sun size={16} className="mr-2" />
                      ) : (
                        <Moon size={16} className="mr-2" />
                      )}
                      {theme === "dark" ? "Light" : "Dark"} Mode
                    </div>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={(e) => {
                      e.preventDefault()
                      handleLogout()
                    }}
                    className="text-destructive focus:text-destructive-foreground cursor-pointer"
                  >
                    <LogOut size={16} className="mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
