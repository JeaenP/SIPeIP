import { cookies } from 'next/headers'
import { MainSidebar } from "@/components/main-sidebar"
import { SidebarInset, SidebarTrigger } from "@/components/ui/sidebar"
import { Toaster } from "sonner"
import { EntityInfo } from "@/components/entity-info"
import { PageLayout } from "@/components/page-layout"

export default function Home() {
  const userSession = cookies().get('user_session')
  const userData = userSession ? JSON.parse(userSession.value) : null

  return (
    <PageLayout>
      <div className="flex min-h-screen min-w-full">
        <MainSidebar />
        <SidebarInset className="w-full">
          <header className="flex h-16 items-center justify-between border-b bg-background px-6">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <div>
                <h1 className="text-lg font-semibold">Inicio</h1>
                <p className="text-sm text-muted-foreground">Bienvenido al Sistema de Planificación</p>
              </div>
            </div>
            {userData && (
              <div className="text-right">
                <p className="text-sm font-medium">Usuario: {userData.cedula}</p>
                <EntityInfo rucEntidad={userData.rucEntidad} />
              </div>
            )}
          </header>
          <main className="flex-1 p-6 w-full">
            {/* Empty home page */}
          </main>
        </SidebarInset>
        <Toaster />
      </div>
    </PageLayout>
  )
}

