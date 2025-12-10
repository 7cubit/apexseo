import { RevenueWidget } from "@/components/dashboard/RevenueWidget";
import { SystemStatusWidget } from "@/components/dashboard/SystemStatus";
import { JobMonitorWidget } from "@/components/dashboard/JobMonitor";
import { ActiveVisitorsWidget } from "@/components/dashboard/ActiveVisitorsWidget";
import { MaintenanceToggle } from "@/components/system/MaintenanceToggle";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { WhatsNewModal } from '@/components/dashboard/WhatsNewModal';

export const dynamic = 'force-dynamic';

export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="flex flex-col gap-6 p-6">
        <WhatsNewModal />
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <h1 className="text-3xl font-bold">Executive Dashboard</h1>
          <div className="flex gap-4">
            {/* Maintenance Toggle placed here or in settings? Plan said settings but handy here for MVP or top bar. Let's put in 'System' section below */}
          </div>
        </div>

        {/* Top Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ActiveVisitorsWidget />
          {/* Can add simplified MRR or User count widgets here too if strict executive view needed, but RevenueWidget is big chart */}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Main Column: Business & Growth */}
          <div className="lg:col-span-2 space-y-4">
            <RevenueWidget />
            {/* Future: User Growth Chart */}
          </div>

          {/* Side Column: System Health */}
          <div className="space-y-4">
            <SystemStatusWidget />
            <JobMonitorWidget />
            {/* Maintenance Toggle Panel */}
            <div className="p-4 border rounded-lg bg-card text-card-foreground shadow-sm">
              <h3 className="font-semibold mb-4">System Controls</h3>
              <MaintenanceToggle />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
