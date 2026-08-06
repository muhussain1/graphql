import { getToken } from "./auth.js";

const GRAPHQL_URL = "https://learn.reboot01.com/api/graphql-engine/v1/graphql";

export async function graphqlQuery(query, variables = {}) {
  const token = getToken();

  if (!token) {
    throw new Error("Please sign in first.");
  }

  const response = await fetch(GRAPHQL_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ query, variables }),
  });

  const body = await response.json();

  if (!response.ok || body.errors) {
    const message = body.errors?.[0]?.message || "Could not load your profile data.";
    throw new Error(message);
  }

  return body.data;
}
