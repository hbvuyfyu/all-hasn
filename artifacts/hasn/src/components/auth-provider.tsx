import { createContext, useContext, useEffect } from "react";
import { useGetMe } from "@workspace/api-client-react";

type User = {
  id: number;
  phone: string;
  name: string;
  role: "user" | "admin" | "super_admin";
  isBlocked: boolean;
  walletBalance: number;
  createdAt: string;
};

type AuthContextType = {
  user: User | null;
  isLoading: boolean;
};

const AuthContext = createContext<AuthContextType>({ user: null, isLoading: true });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { data: user, isLoading } = useGetMe();

  useEffect(() => {
    document.documentElement.classList.add("dark");
    document.documentElement.dir = "rtl";
  }, []);

  return (
    <AuthContext.Provider value={{ user: (user as User) || null, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
