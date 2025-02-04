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
    Network,
    CalendarClock,
    CalendarCheck,
    NotepadText,
    Archive,
    CalendarX
} from "lucide-react"

export const navigationGroups = [
    {
        group: {
            name: "Main",
            role: ["ADMIN", "USER", "MANAGER"],
        },
        items: [
            {
                title: "Home",
                href: "/home",
                roles: ["ADMIN", "USER", "MANAGER"],
                icon: Home
            },
            {
                title: "Leave",
                href: "/leave",
                roles: ["ADMIN", "MANAGER", "USER"],
                icon: CalendarX
            },
            {
                title: "Leave Approval",
                href: "/leave-approval",
                roles: ["ADMIN"],
                icon: CalendarCheck
            },
            {
                title: "Shift Assign",
                href: "/shift-assign",
                roles: ["ADMIN","MANAGER"],
                icon: CalendarClock
            },
            {
                title: "Reports",
                href: "/reports",
                roles: ["ADMIN", "MANAGER"],
                icon: Archive
            },
        ]
    },
    {
        group: {
            name: "Management",
            role: ["ADMIN", "MANAGER"],
        },
        items: [
            {
                title: "Employees",
                href: "/employees",
                roles: ["ADMIN", "MANAGER"],
                icon: Users
            },
            {
                title: "Events",
                href: "/events",
                roles: ["ADMIN"],
                icon: NotepadText
            },
            {
                title: "Leave Type",
                href: "/leave_type",
                roles: ["ADMIN"],
                icon: Calendar
            },
            {
                title: "Shifts",
                href: "/shifts",
                roles: ["ADMIN"],
                icon: Calendar
            },
            // {
            //   title: "Day of Work",
            //   href: "/day-of-work",
            //   roles: ["ADMIN"],
            //   icon: Calendar
            // },
            // {
            //   title: "Location",
            //   href: "/location",
            //   roles: ["ADMIN"],
            //   icon: MapPin
            // },
            // {
            //   title: "Attendance Policy",
            //   href: "/attendance-policy",
            //   roles: ["ADMIN"],
            //   icon: Settings
            // },
            // {
            //     title: "Roles",
            //     href: "/roles",
            //     roles: ["ADMIN"],
            //     icon: Users
            // },

        ]
    }
]