import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Layers2, ListTodo, Users } from "lucide-react";
import { NavLink, useLocation } from "react-router-dom";

const links = [
  { to: "/", title: "Tareas", icon: ListTodo },
  { to: "/users", title: "Usuarios", icon: Users },
];

export function AppSidebar() {
  const location = useLocation();
  const { setOpenMobile } = useSidebar();
  const tasksPath = location.pathname === "/tasks" ? "/tasks" : "/";
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <div className="brand">
          <span className="brand-mark">
            <Layers2 size={19} />
          </span>
          <span className="brand-name">
            Task Manager<span>Espacio de trabajo</span>
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Organización</SidebarGroupLabel>
          <SidebarMenu>
            {links.map((link) => (
              <SidebarMenuItem key={link.to}>
                <SidebarMenuButton
                  asChild
                  isActive={
                    location.pathname ===
                    (link.to === "/" ? tasksPath : link.to)
                  }
                  tooltip={link.title}
                >
                  <NavLink
                    to={
                      link.to === "/"
                        ? tasksPath +
                          (location.pathname === "/" ||
                          location.pathname === "/tasks"
                            ? location.search
                            : "")
                        : link.to
                    }
                    end
                    onClick={() => setOpenMobile(false)}
                  >
                    <link.icon />
                    <span>{link.title}</span>
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
