import { redirect } from "@tanstack/react-router";
import { getCurrentUser } from "../contexts/AuthContext"; 

export async function authGuard(roles: string[] = []) {
  const user = getCurrentUser();

  if (!user) {
    return redirect({ to: "/auth/login" });
  }

  if (roles.length > 0 && !roles.includes(user.role)) {
    return redirect({ to: "/" }); 
  }
}
