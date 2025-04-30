import User from "./User";

type AuthContextType = {
    user: User | null;
    login: (username: string, password: string) => void;
    logout: () => void;
    requireAuth: (allowedRoles?: string[]) => void;
  };

export default AuthContextType;