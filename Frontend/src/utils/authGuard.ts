import { redirect } from "@tanstack/react-router";
import { getCurrentUser } from "../contexts/AuthContext"; 

export async function authGuard(roles: number[] = []) {
  const user = getCurrentUser();
  if (!user) {
    return redirect({ to: "/auth/login" });
  }
  if (roles.length > 0 && !roles.includes(user.roleId)) {
    return redirect({ to: "/" }); 
  }
}

export const eventAuthGuard = (roles: number[] = []) => {
  const user = getCurrentUser();
  if (!user) {
    return false;
  }
  if (roles.length > 0 && !roles.includes(user.roleId)) {
    return false; 
  }
  return true;
}