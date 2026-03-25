import { SidebarProvider, SidebarTrigger, SidebarInset } from "@/components/ui/sidebar"
import { AppSidebar } from "./app-sidebar"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center justify-between border-b px-6">
          <div className="flex items-center gap-4">
            <SidebarTrigger />
            <Separator orientation="vertical" className="h-6" />
            <div className="flex items-center gap-2 text-sm font-semibold tracking-tight">
              <span className="text-primary hover:underline cursor-pointer">SIEM Ops</span>
              <span className="text-muted-foreground/50 font-light">/</span>
              <span className="text-foreground">Overview</span>
            </div>
          </div>
          <div className="flex items-center gap-4">
             <div className="hidden md:flex flex-col items-end leading-none">
                <span className="text-sm font-bold text-foreground">Administrator</span>
                <span className="text-[10px] uppercase font-bold text-muted-foreground/60 tracking-wider">admin@siem.local</span>
             </div>
             <Avatar>
               <AvatarImage src="" />
               <AvatarFallback className="bg-primary text-primary-foreground">AD</AvatarFallback>
             </Avatar>
          </div>
        </header>
        <main className="flex-1 overflow-auto p-6">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  )
}
