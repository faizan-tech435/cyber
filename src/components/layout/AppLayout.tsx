import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { TopNav } from './TopNav'
import { DemoBanner } from '@/components/shared/DemoBanner'
import { TooltipProvider } from '@/components/ui/tooltip'

export function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <TooltipProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar mobileOpen={mobileOpen} onMobileClose={() => setMobileOpen(false)} />

        {/* Main content */}
        <div className="flex flex-col flex-1 min-w-0 lg:pl-64 transition-all duration-300">
          <DemoBanner />
          <TopNav onMenuClick={() => setMobileOpen(true)} />
          <main className="flex-1 overflow-y-auto">
            <div className="p-4 md:p-6 max-w-[1400px] mx-auto animate-fade-in">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
