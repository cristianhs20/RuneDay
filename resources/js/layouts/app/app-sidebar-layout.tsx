import { AppContent } from '@/components/app-content';
import { RewardFlash } from '@/components/reward-flash';
import { GameEventOverlay } from '@/components/game/game-event-overlay';
import { AppShell } from '@/components/app-shell';
import { AppSidebar } from '@/components/app-sidebar';
import { AppSidebarHeader } from '@/components/app-sidebar-header';
import type { AppLayoutProps } from '@/types';

export default function AppSidebarLayout({
    children,
    breadcrumbs = [],
}: AppLayoutProps) {
    return (
        <AppShell variant="sidebar">
            <AppSidebar />
            <AppContent variant="sidebar" className="min-w-0 overflow-x-clip">
                <AppSidebarHeader breadcrumbs={breadcrumbs} />
                {children}
                <RewardFlash />
                <GameEventOverlay />
            </AppContent>
        </AppShell>
    );
}
