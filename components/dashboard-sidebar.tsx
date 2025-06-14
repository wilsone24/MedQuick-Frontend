"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, usePathname } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Home, Calendar, UserCheck, MessageSquare, BarChart3, User, LogOut, ChevronUp } from "lucide-react"
import Link from "next/link"

const allMenuItems = [
  {
    title: "Inicio",
    url: "/dashboard",
    icon: Home,
  },
  {
    title: "Citas",
    url: "/dashboard/citas",
    icon: Calendar,
  },
  {
    title: "Doctores",
    url: "/dashboard/doctores",
    icon: UserCheck,
  },
  {
    title: "Chatbot",
    url: "/dashboard/chatbot",
    icon: MessageSquare,
  },
  {
    title: "Dashboard",
    url: "/dashboard/analytics",
    icon: BarChart3,
  },
  {
    title: "Administrar Doctores",
    url: "/dashboard/admin-doctores",
    icon: UserCheck,
  },
]

// MedQuick Logo Component
const MedQuickLogo = ({ size = "w-8 h-8" }) => (
  <img 
    src="https://i.ibb.co/5xTG1VJ7/logomedquick.png" // Replace with your actual logo image path
    alt="MedQuick Logo" 
    className={`${size} object-contain`}
  />
)

interface DashboardSidebarProps {
  children: React.ReactNode
}

export function DashboardSidebar({ children }: DashboardSidebarProps) {
  const [userName, setUserName] = useState("Usuario")
  const router = useRouter()
  const pathname = usePathname()
  const [filteredMenuItems, setFilteredMenuItems] = useState<typeof allMenuItems>([])

  useEffect(() => {
    // Note: In production, use proper state management instead of localStorage
    // localStorage is not available in Claude artifacts
    setUserName("Usuario")
    
    // For demo purposes, show regular user menu
    setFilteredMenuItems(
      allMenuItems.filter((item) => item.title !== "Dashboard" && item.title !== "Administrar Doctores"),
    )
  }, [])

  const handleLogout = () => {
    // Note: localStorage operations removed for Claude artifact compatibility
    router.push("/")
  }

  return (
    <SidebarProvider>
      <Sidebar>
        <SidebarHeader>
          <div className="flex items-center space-x-2 px-2 py-4">
            <MedQuickLogo />
            <div>
              <h2 className="text-lg font-bold text-blue-600">MedQuick</h2>
              <p className="text-xs text-gray-500">Panel de Control</p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navegación</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {filteredMenuItems.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter>
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton>
                    <User />
                    <span>{userName}</span>
                    <ChevronUp className="ml-auto" />
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Perfil</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesión</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarFooter>
      </Sidebar>

      <main className="flex-1">
        <header className="border-b bg-white p-4">
          <div className="flex items-center space-x-4">
            <SidebarTrigger />
            <h1 className="text-xl font-semibold">
              {filteredMenuItems.find((item) => item.url === pathname)?.title || "Panel de Control"}
            </h1>
          </div>
        </header>
        <div className="p-6">{children}</div>
      </main>
    </SidebarProvider>
  )
}