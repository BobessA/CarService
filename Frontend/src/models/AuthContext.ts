import User from "./User";

type AuthContextType = {
    user: User | null;
    login: (username: string, password: string) => void;
    register: (name: string, email: string, password: string, phone: string) => void;
    logout: () => void;
    requireAuth: (allowedRoles?: number[]) => void;
    loginError: boolean;
  };

export default AuthContextType;