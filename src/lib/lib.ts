import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { NextRequest, NextResponse } from "next/server";

const secretKey = "secret";
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload;
}
export async function setPassword({ email, password }: { email: string, password: string }) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/employees/set-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Failed to set password');
    }

    const loginData = await response.json();

    if (!loginData.status) {
      throw new Error('Login unsuccessful');
    }

    const { user, tokens } = loginData.data;

    // Create the session
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const session = await encrypt({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: [user.role.name],
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token
      },
      expires
    });

    // Save the session in a cookie
    const sessionStore = await cookies();
    sessionStore.set("session", session, { expires, httpOnly: true });

    // Optionally, store tokens in separate cookies if needed
    sessionStore.set("access_token", tokens.access_token, { expires, httpOnly: true });
    sessionStore.set("refresh_token", tokens.refresh_token, { expires, httpOnly: true });
  } catch (error) {
    // Handle password setting errors
    console.error('Password setting error:', error);
    throw error;
  }
}
export async function login(formData: FormData) {
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;

  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/employees/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      if (errorData.error == "set password") {
        throw new Error('set password');
      }
      throw new Error('Login failed');
    }

    const loginData = await response.json();

    if (!loginData.status) {
      throw new Error('Login unsuccessful');
    }

    const { user, tokens } = loginData.data;

    // Create the session
    const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const session = await encrypt({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        roles: [user.role.name],
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token
      },
      expires
    });

    // Save the session in a cookie
    const sessionStore = await cookies();
    sessionStore.set("session", session, { expires, httpOnly: true });

    // Optionally, store tokens in separate cookies if needed
    sessionStore.set("access_token", tokens.access_token, { expires, httpOnly: true });
    sessionStore.set("refresh_token", tokens.refresh_token, { expires, httpOnly: true });
  } catch (error) {
    // Handle login errors
    console.error('Login error:', error);
    throw error;
  }
}

export async function logout() {
  // Delete the cookie
  const sessionStore = await cookies();
  sessionStore.set("session", "", { expires: new Date(0) });
}

export async function getSession() {
  const sessionStore = await cookies();
  const session = sessionStore.get("session")?.value;
  if (!session) return null;
  return await decrypt(session);
}

export async function updateSession(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  if (!session) return;

  // Refresh the session so it doesn't expire
  const parsed = await decrypt(session);
  parsed.expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const res = NextResponse.next();
  res.cookies.set({
    name: "session",
    value: await encrypt(parsed),
    httpOnly: true,
    expires: parsed.expires,
  });
  return res;
}

export async function isAuthenticated() {
  const session = await getSession();
  return session !== null;
}

export async function redirectToLogin() {
  return NextResponse.redirect("/login");
}