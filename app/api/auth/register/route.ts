import { NextResponse } from "next/server";
import { setSession } from "@/lib/session";
import { createUser, publicUser, UserProfile } from "@/lib/user-store";

function asText(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function parseProfile(body: Record<string, unknown>): UserProfile {
  const age = Number(body.age);
  const gender = asText(body.gender);

  return {
    gender: gender === "男" || gender === "女" || gender === "其他" ? gender : "其他",
    age: Number.isFinite(age) ? Math.max(0, Math.min(120, Math.floor(age))) : 0,
    province: asText(body.province),
    city: asText(body.city),
    district: asText(body.district),
    industry: asText(body.industry),
  };
}

export async function POST(request: Request) {
  const body = await request.json() as Record<string, unknown>;
  const name = asText(body.name);
  const email = asText(body.email);
  const password = asText(body.password);

  if (!name || !email || !password) {
    return NextResponse.json({ error: "请填写姓名、邮箱和密码。" }, { status: 400 });
  }

  if (!/^\S+@\S+\.\S+$/.test(email)) {
    return NextResponse.json({ error: "邮箱格式不正确。" }, { status: 400 });
  }

  if (password.length < 8) {
    return NextResponse.json({ error: "密码至少需要 8 位。" }, { status: 400 });
  }

  try {
    const user = await createUser({
      name,
      email,
      password,
      profile: parseProfile(body),
    });
    await setSession(user.id);
    return NextResponse.json({ user: publicUser(user) }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message === "EMAIL_EXISTS") {
      return NextResponse.json({ error: "这个邮箱已经注册。" }, { status: 409 });
    }
    return NextResponse.json({ error: "注册失败，请稍后重试。" }, { status: 500 });
  }
}
