import { createContext, useContext, useState, ReactNode } from "react";
import { User, UserRole } from "@/types/project";

interface AuthContextType {
  user: User | null;
  setUserRole: (role: UserRole) => void;
  hasPermission: (requiredRoles: UserRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demo
const mockUsers: Record<UserRole, User> = {
  admin: {
    id: "1",
    name: "Admin User",
    email: "admin@universal.com",
    role: "admin",
  },
  finance: {
    id: "2",
    name: "Finance User",
    email: "finance@universal.com",
    role: "finance",
  },
  user: {
    id: "3",
    name: "Regular User",
    email: "user@universal.com",
    role: "user",
  },
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  // Default to admin for demo purposes
  const [user, setUser] = useState<User | null>(mockUsers.admin);

  const setUserRole = (role: UserRole) => {
    setUser(mockUsers[role]);
  };

  const hasPermission = (requiredRoles: UserRole[]): boolean => {
    if (!user) return false;
    return requiredRoles.includes(user.role);
  };

  return (
    <AuthContext.Provider value={{ user, setUserRole, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
