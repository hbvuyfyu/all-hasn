import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/components/auth-provider";
import { useLogout } from "@workspace/api-client-react";
import { Wallet, LogOut, Package, ShieldCheck } from "lucide-react";
import { SiInstagram, SiWhatsapp, SiFacebook, SiTelegram } from "react-icons/si";

const WHATSAPP_NUMBER = "0997821765";
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER.replace(/^0/, "963")}`;

export function RootLayout({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const logout = useLogout();
  const [, setLocation] = useLocation();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        window.location.href = "/login";
      }
    });
  };

  return (
    <div className="min-h-[100dvh] flex flex-col bg-background text-foreground selection:bg-primary selection:text-primary-foreground" dir="rtl">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border bg-background/60 backdrop-blur-xl supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="h-10 w-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center shadow-lg shadow-primary/20 group-hover:shadow-primary/40 transition-all duration-300">
              <span className="text-base font-black text-white leading-none tracking-tighter">H</span>
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">HASN</span>
          </Link>

          <nav className="hidden md:flex items-center gap-8">
            <Link href="/" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">الرئيسية</Link>
            <Link href="/services" className="text-sm font-medium text-muted-foreground hover:text-primary transition-colors">الخدمات</Link>
          </nav>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/wallet" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black/5 border border-border hover:bg-black/10 transition-colors">
                  <Wallet className="w-4 h-4 text-primary" />
                  <span className="text-sm font-medium">{user.walletBalance || 0} ر.س</span>
                </Link>
                
                <div className="flex items-center gap-2 border-r border-border pr-4 mr-2">
                  {(user.role === "admin" || user.role === "super_admin") && (
                    <Link href="/admin" className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-black/5 transition-colors">
                      <ShieldCheck className="w-5 h-5" />
                    </Link>
                  )}
                  <Link href="/orders" className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-black/5 transition-colors">
                    <Package className="w-5 h-5" />
                  </Link>
                  <button onClick={handleLogout} className="p-2 rounded-full text-red-500 hover:text-red-600 hover:bg-red-50 transition-colors">
                    <LogOut className="w-5 h-5" />
                  </button>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <Link href="/login" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">دخول</Link>
                <Link href="/register" className="px-4 py-2 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-medium rounded-lg shadow-lg shadow-primary/20 transition-all hover:-translate-y-0.5">
                  حساب جديد
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-background pt-16 pb-8">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-3 mb-6">
                <div className="h-8 w-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                  <span className="text-sm font-black text-white leading-none">H</span>
                </div>
                <span className="text-xl font-bold tracking-tight">HASN</span>
              </div>
              <p className="text-muted-foreground leading-relaxed max-w-sm">
                المنصة الأولى لتقديم الخدمات الرقمية وشحن الألعاب بأسعار منافسة وسرعة في التنفيذ.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6 text-foreground">روابط سريعة</h3>
              <ul className="space-y-4 text-muted-foreground">
                <li><Link href="/" className="hover:text-primary transition-colors">الرئيسية</Link></li>
                <li><Link href="/services" className="hover:text-primary transition-colors">الخدمات</Link></li>
                <li><Link href="/register" className="hover:text-primary transition-colors">تسجيل حساب</Link></li>
              </ul>
            </div>
            
            <div>
              <h3 className="text-lg font-semibold mb-6 text-foreground">تواصل معنا</h3>
              <div className="flex items-center gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-foreground/70 hover:bg-primary hover:text-white transition-all">
                  <SiInstagram className="w-5 h-5" />
                </a>
                <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-foreground/70 hover:bg-[#25D366] hover:text-white transition-all">
                  <SiWhatsapp className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-foreground/70 hover:bg-[#1877F2] hover:text-white transition-all">
                  <SiFacebook className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-black/5 flex items-center justify-center text-foreground/70 hover:bg-[#229ED9] hover:text-white transition-all">
                  <SiTelegram className="w-5 h-5" />
                </a>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-border text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} HASN — جميع الحقوق محفوظة.
          </div>
        </div>
      </footer>

      {/* WhatsApp Floating Button */}
      <a
        href={WHATSAPP_URL}
        target="_blank"
        rel="noreferrer"
        className="fixed bottom-6 left-6 z-50 w-14 h-14 bg-[#25D366] hover:bg-[#20bc5a] text-white rounded-full shadow-xl shadow-[#25D366]/30 flex items-center justify-center transition-all hover:scale-110 hover:shadow-[#25D366]/50"
        title="تواصل معنا عبر واتساب"
      >
        <SiWhatsapp className="w-7 h-7" />
      </a>
    </div>
  );
}
