import {
  LayoutDashboard,
  Users,
  FolderKanban,
  Clock,
  Calendar,
  BarChart3,
  UserCheck,
  ListChecks,
  User,
  ClipboardList,
  Target,
  DollarSign,
  Timer,
  BadgeDollarSign,
  AlertTriangle,
  FileText,
  UsersRound,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/dashboard", icon: LayoutDashboard },
  { title: "Employee Dashboard", url: "/employee-dashboard", icon: User },
  { title: "Employees", url: "/employees", icon: Users },
  { title: "Employee Rates", url: "/employee-rates", icon: BadgeDollarSign },
  { title: "Projects", url: "/projects", icon: FolderKanban },
  { title: "Project Templates", url: "/project-templates", icon: FileText },
  { title: "Sprints", url: "/sprints", icon: Target },
  { title: "Tasks", url: "/tasks", icon: ClipboardList },
  { title: "Resource Allocation", url: "/resource-allocation", icon: UsersRound },
  { title: "Spent Hours", url: "/spent-hours", icon: Clock },
  { title: "Billing Summary", url: "/reports?tab=billing", icon: DollarSign },
  { title: "Task Time Report", url: "/task-time-report", icon: Timer },
  { title: "Project Summary", url: "/project-summary", icon: ListChecks },
  { title: "Attendance", url: "/attendance", icon: UserCheck },
  { title: "Employee Check-in", url: "/employee-checkin", icon: ClipboardList },
];

export function AppSidebar() {
  const { open } = useSidebar();

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/70">
            Menu
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      className="hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors"
                      activeClassName="bg-sidebar-accent text-sidebar-primary font-medium"
                    >
                      <item.icon className="h-4 w-4" />
                      {open && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
