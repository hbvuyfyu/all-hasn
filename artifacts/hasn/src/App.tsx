import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/components/auth-provider";
import NotFound from "@/pages/not-found";
import Home from "@/pages/home";
import Login from "@/pages/login";
import Register from "@/pages/register";
import Services from "@/pages/services";
import ServiceDetail from "@/pages/service-detail";
import WalletPage from "@/pages/wallet";
import WalletRecharge from "@/pages/wallet-recharge";
import Orders from "@/pages/orders";
import AdminDashboard from "@/pages/admin/index";
import AdminUsers from "@/pages/admin/users";
import AdminServices from "@/pages/admin/services";
import AdminCategories from "@/pages/admin/categories";
import AdminBanners from "@/pages/admin/banners";
import AdminProviders from "@/pages/admin/providers";
import AdminOrders from "@/pages/admin/orders";
import AdminRecharges from "@/pages/admin/recharges";
import AdminSettings from "@/pages/admin/settings";
import AdminAuditLogs from "@/pages/admin/audit-logs";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/services" component={Services} />
      <Route path="/services/:id" component={ServiceDetail} />
      <Route path="/wallet" component={WalletPage} />
      <Route path="/wallet/recharge" component={WalletRecharge} />
      <Route path="/orders" component={Orders} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/admin/users" component={AdminUsers} />
      <Route path="/admin/services" component={AdminServices} />
      <Route path="/admin/categories" component={AdminCategories} />
      <Route path="/admin/banners" component={AdminBanners} />
      <Route path="/admin/providers" component={AdminProviders} />
      <Route path="/admin/orders" component={AdminOrders} />
      <Route path="/admin/recharges" component={AdminRecharges} />
      <Route path="/admin/settings" component={AdminSettings} />
      <Route path="/admin/audit-logs" component={AdminAuditLogs} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
