import { NextResponse } from "next/server";
import { setSession } from "@/lib/session";
import { findUserByEmail, publicUser, verifyPassword } from "@/lib/user-store";

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

export async function POST(request: Request) {
  const body = await request.json() as Record<string, unknown>;
  const email = asText(body.email);
  const password = asText(body.password);

  if (!email || !password) {
    return NextResponse.json({ error: "请填写邮箱和密码。" }, { status: 400 });
  }

  const user = await findUserByEmail(email);
  if (!user || !verifyPassword(password, user)) {
    return NextResponse.json({ error: "邮箱或密码不正确。" }, { status: 401 });
  }

  await setSession(user.id);
  return NextResponse.json({ user: publicUser(user) });
}
