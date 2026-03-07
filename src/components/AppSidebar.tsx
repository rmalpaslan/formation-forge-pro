import {
  LayoutDashboard, Library, Users, Grid3X3, Settings, UserCircle, LogOut,
} from 'lucide-react';
import { NavLink } from '@/components/NavLink';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  Sidebar, SidebarContent, SidebarGroup, SidebarGroupContent, SidebarGroupLabel,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarFooter, useSidebar,
} from '@/components/ui/sidebar';

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const { signOut } = useAuth();
  const { t } = useLanguage();

  const mainItems = [
    { title: t('dashboard'), url: '/', icon: LayoutDashboard },
    { title: t('analysisLibrary'), url: '/analyses', icon: Library },
    { title: t('playerLibrary'), url: '/players', icon: Users },
    { title: t('squadBuilder'), url: '/squad-builder', icon: Grid3X3 },
  ];

  const bottomItems = [
    { title: t('settings'), url: '/settings', icon: Settings },
    { title: t('account'), url: '/account', icon: UserCircle },
  ];

  return (
    <Sidebar collapsible="icon" className="border-r border-border">
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary font-bold text-base tracking-wider">
            {!collapsed && 'CE'}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {mainItems.map((item) => (
                <SidebarMenuItem key={item.url}>
                  <SidebarMenuButton asChild>
                    <NavLink
                      to={item.url}
                      end={item.url === '/'}
                      className="hover:bg-secondary"
                      activeClassName="bg-primary/20 text-primary font-medium"
                    >
                      <item.icon className="mr-2 h-4 w-4" />
                      {!collapsed && <span>{item.title}</span>}
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          {bottomItems.map((item) => (
            <SidebarMenuItem key={item.url}>
              <SidebarMenuButton asChild>
                <NavLink
                  to={item.url}
                  className="hover:bg-secondary"
                  activeClassName="bg-primary/20 text-primary font-medium"
                >
                  <item.icon className="mr-2 h-4 w-4" />
                  {!collapsed && <span>{item.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
          <SidebarMenuItem>
            <SidebarMenuButton onClick={signOut} className="hover:bg-secondary cursor-pointer">
              <LogOut className="mr-2 h-4 w-4" />
              {!collapsed && <span>{t('logout')}</span>}
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
