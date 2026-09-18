import { Link } from '@inertiajs/react';
import {
    BarChart3,
    Bell,
    CalendarDays,
    CheckSquare2,
    Flame,
    Inbox,
    LayoutGrid,
    Repeat2,
    TimerReset,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    { title: 'Today', href: '/today', icon: LayoutGrid },
    { title: 'Inbox', href: '/inbox', icon: Inbox },
    { title: 'Quests', href: '/quests', icon: CheckSquare2 },
    { title: 'Dailies', href: '/dailies', icon: Repeat2 },
    { title: 'Habits', href: '/habits', icon: Flame },
    { title: 'Focus', href: '/focus', icon: TimerReset },
    { title: 'Calendar', href: '/calendar', icon: CalendarDays },
    { title: 'Progress', href: '/insights', icon: BarChart3 },
    { title: 'Notifications', href: '/notifications', icon: Bell },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/today" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>
            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
