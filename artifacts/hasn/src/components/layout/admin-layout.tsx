import { ReactNode, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/components/auth-provider";
import {
  LayoutDashboard,
  Users,
  Package,
  Layers,
  Image as ImageIcon,
  Server,
  Wallet,
  Settings,
  History,
  LogOut,
  Menu,
  X,
  ShieldAlert,
  Tag,
} from "lucide-react";

const ADMIN_LINKS = [
  { href: "/admin", label: "لوحة القيادة", icon: LayoutDashboard },
  { href: "/admin/orders", label: "الطلبات", icon: Package },
  { href: "/admin/recharges", label: "طلبات الشحن", icon: Wallet },
  { href: "/admin/services", label: "الخدمات", icon: Layers },
  { href: "/admin/categories", label: "الأقسام", icon: Tag },
  { href: "/admin/banners", label: "البنرات", icon: ImageIcon },
  { href: "/admin/users", label: "المستخدمين", icon: Users },
  { href: "/admin/providers", label: "المزودين", icon: Server },
  { href: "/admin/audit-logs", label: "سجل العمليات", icon: History },
  { href: "/admin/settings", label: "الإعدادات", icon: Settings },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [location] = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  if (!user || (user.role !== "admin" && user.role !== "super_admin")) {
    return (
      <div className="min-h-screen flex items-center justify-center flex-col gap-4 text-center px-4">
        <ShieldAlert className="w-16 h-16 text-destructive" />
        <h1 className="text-2xl font-bold">غير مصرح لك بالدخول</h1>
        <Link href="/" className="text-primary hover:underline">العودة للرئيسية</Link>
      </div>
    );
  }

  const currentLabel = ADMIN_LINKS.find(l => l.href === location)?.label || "لوحة القيادة";

  return (
    <div className="min-h-[100dvh] flex bg-background text-foreground" dir="rtl">

      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 right-0 z-40 w-64 border-l border-border bg-card flex flex-col
        transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "translate-x-full"}
        md:translate-x-0
      `}>
        <div className="h-16 flex items-center justify-between px-5 border-b border-border flex-shrink-0">
          <Link href="/" className="flex items-center gap-3" onClick={() => setSidebarOpen(false)}>
            <div className="h-8 w-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <span className="text-sm font-bold text-white leading-none">H</span>
            </div>
            <span className="font-bold text-foreground">لوحة الإدارة</span>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className="md:hidden text-foreground/50 hover:text-foreground">
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-0.5">
          {ADMIN_LINKS.map((link) => {
            const isActive = location === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                    : "text-muted-foreground hover:bg-black/5 hover:text-foreground"
                }`}
              >
                <link.icon className="w-4 h-4 flex-shrink-0" />
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 border-t border-border flex-shrink-0">
          <Link
            href="/"
            onClick={() => setSidebarOpen(false)}
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-muted-foreground hover:bg-black/5 hover:text-foreground transition-all"
          >
            <LogOut className="w-4 h-4 flex-shrink-0 rotate-180" />
            العودة للمنصة
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 md:pr-64 min-w-0">
        {/* Top bar */}
        <div className="h-14 md:h-16 flex items-center justify-between px-4 md:px-8 border-b border-border bg-background/80 backdrop-blur-sm sticky top-0 z-20 gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden flex-shrink-0 p-2 rounded-xl text-foreground/60 hover:text-foreground hover:bg-black/5 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="font-semibold text-sm md:text-base truncate">{currentLabel}</h2>
          </div>
          <div className="flex items-center gap-2 text-xs md:text-sm flex-shrink-0">
            <span className="text-muted-foreground hidden sm:block truncate max-w-[100px]">{user.name}</span>
            <div className="px-2 py-1 rounded-lg bg-primary/20 text-primary text-xs font-medium whitespace-nowrap">
              {user.role === "super_admin" ? "مدير عام" : "مشرف"}
            </div>
          </div>
        </div>

        {/* Page content */}
        <div className="p-4 md:p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
