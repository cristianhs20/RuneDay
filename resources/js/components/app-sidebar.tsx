import { Link } from '@inertiajs/react';
import {
    Backpack,
    BarChart3,
    Bell,
    CalendarDays,
    CheckSquare2,
    Flame,
    Inbox,
    LayoutGrid,
    Repeat2,
    Store,
    TimerReset,
    Trophy,
    UserRound,
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

const productivityItems: NavItem[] = [
    { title: 'Today', href: '/today', icon: LayoutGrid },
    { title: 'Inbox', href: '/inbox', icon: Inbox },
    { title: 'Quests', href: '/quests', icon: CheckSquare2 },
    { title: 'Dailies', href: '/dailies', icon: Repeat2 },
    { title: 'Habits', href: '/habits', icon: Flame },
    { title: 'Focus', href: '/focus', icon: TimerReset },
    { title: 'Calendar', href: '/calendar', icon: CalendarDays },
    { title: 'Progress', href: '/insights', icon: BarChart3 },
];

const adventureItems: NavItem[] = [
    { title: 'Hero', href: '/character', icon: UserRound },
    { title: 'Inventory', href: '/inventory', icon: Backpack },
    { title: 'Shop', href: '/shop', icon: Store },
    { title: 'Achievements', href: '/achievements', icon: Trophy },
];

const systemItems: NavItem[] = [
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
                <NavMain items={productivityItems} label="Productivity" />
                <NavMain items={adventureItems} label="Adventure" />
                <NavMain items={systemItems} label="System" />
            </SidebarContent>
            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
