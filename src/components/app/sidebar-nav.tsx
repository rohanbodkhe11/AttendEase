
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  sidebarMenuButtonVariants,
} from "@/components/ui/sidebar";
import { UserNav } from "./user-nav";
import { Separator } from "../ui/separator";
import { useAuth } from "@/hooks/use-auth";
import type { User } from "@/lib/types";
import { LayoutDashboard, BookCheck, BookUser, LogOut, BookCopy, FileText } from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "@/lib/utils";
import { Logo } from "./logo";

const facultyNavItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/attendance", icon: BookCheck, label: "Mark Attendance" },
  { href: "/reports", icon: FileText, label: "Reports" },
  { href: "/courses", icon: BookUser, label: "Courses" },
];

const studentNavItems = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/reports", icon: FileText, label: "Reports" },
  { href: "/courses", icon: BookUser, label: "Courses" },
];

export function SidebarNav({ user }: { user: User }) {
  const pathname = usePathname();
  const { logout } = useAuth();
  const router = useRouter();

  const navItems = user.role === 'faculty' ? facultyNavItems : studentNavItems;

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <>
      <SidebarHeader className="flex items-center justify-center p-4">
         <Logo />
      </SidebarHeader>
      <Separator />
      <SidebarContent className="p-4">
        <SidebarMenu>
          {navItems.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} className={cn(sidebarMenuButtonVariants({ isActive: pathname.startsWith(item.href) }))}>
                  <item.icon className="h-5 w-5" />
                  <span>{item.label}</span>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
      <Separator />
      <SidebarFooter className="p-4">
        <UserNav user={user} />
        <Button variant="ghost" className="w-full justify-start gap-2" onClick={handleLogout}>
          <LogOut className="h-5 w-5" />
          <span>Logout</span>
        </Button>
      </SidebarFooter>
    </>
  );
}
