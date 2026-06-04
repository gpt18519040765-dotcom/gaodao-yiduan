import { getSessionUserId } from "@/lib/session";
import { findUserById, publicUser } from "@/lib/user-store";

export async function getCurrentUser() {
  const userId = await getSessionUserId();
  if (!userId) return null;
  const user = await findUserById(userId);
  return user ? publicUser(user) : null;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  return user?.role === "admin" ? user : null;
}
