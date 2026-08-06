const SIGNIN_URL = "https://learn.reboot01.com/api/auth/signin";
const TOKEN_KEY = "graphql-profile-token";

function encodeCredentials(value) {
  const bytes = new TextEncoder().encode(value);
  return btoa(String.fromCharCode(...bytes));
}

export async function signIn(identifier, password) {
  const credentials = encodeCredentials(`${identifier}:${password}`);
  const response = await fetch(SIGNIN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
    },
  });

  const rawBody = await response.text();
  let body;

  try {
    body = JSON.parse(rawBody);
  } catch {
    body = rawBody;
  }

  if (!response.ok) {
    const message = body?.error || body?.message || "Invalid username/email or password.";
    throw new Error(message);
  }

  const token = typeof body === "string" ? body : body?.token;

  if (!token) {
    throw new Error("The server did not return a login token.");
  }

  sessionStorage.setItem(TOKEN_KEY, token);
  return token;
}

export function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

export function logOut() {
  sessionStorage.removeItem(TOKEN_KEY);
}

export function isLoggedIn() {
  return Boolean(getToken());
}
