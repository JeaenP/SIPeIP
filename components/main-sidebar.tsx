"use client"

import { AlignLeft, BarChart3, FileText, FolderOpen, LayoutDashboard, LogOut, RefreshCw, Settings, Target, Users } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"

const navigationItems = [
  {
    title: "Administración",
    items: [
      { title: "Gestión de entidades", icon: Users, url: "/" },
    ],
  },
  {
    title: "Proformas",
    items: [
      { title: "Programas", icon: FileText, url: "/programas" },
      { title: "Actualización EO y Alineación", icon: RefreshCw, url: "/actualizacion-eo" },
    ],
  },
  {
    title: "PAP Ejecución",
    items: [
      { title: "Registrar Metas Semestrales", icon: Target, url: "/metas-semestrales" },
    ],
  },
  {
    title: "Reportes",
    items: [
      { title: "Consultar alineaciones", icon: AlignLeft, url: "/consultar-alineaciones" },
    ],
  },
]

export function MainSidebar() {
  const router = useRouter()

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      })

      if (response.ok) {
        toast.success('Sesión cerrada exitosamente')
        router.push('/login')
        router.refresh()
      } else {
        throw new Error('Error al cerrar sesión')
      }
    } catch (error) {
      console.error('Error durante el logout:', error)
      toast.error('Error al cerrar sesión')
    }
  }

  return (
    <Sidebar className="flex flex-col h-screen bg-sidebar-background">
      {/* Header */}
      <SidebarHeader className="border-b p-4">
        <img
          src="/images/LOGO2.png" /* Ruta de tu imagen */
          alt="Background"
        />
        <div className="flex items-center space-x-1">
          <h1 className="text-lg font-semibold">SIPeIP</h1>
          <p className="text-sm text-muted-foreground">Sistema de Planificación</p>
        </div>
      </SidebarHeader>

      {/* Main Content */}
      <SidebarContent className="flex-grow overflow-y-auto">
        {navigationItems.map((section) => (
          <SidebarGroup key={section.title}>
            <SidebarGroupLabel className="bg-primary text-white">{section.title}</SidebarGroupLabel>
            <SidebarGroupContent >
              <SidebarMenu >
                {section.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <a href={item.url} className=" flex items-center gap-2">
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Logout Button */}
      <div className="border-t p-4">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={handleLogout} className="w-full">
              <LogOut className="h-4 w-4 mr-2" />
              <span>Cerrar Sesión</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </div>
    </Sidebar>
  )
}

