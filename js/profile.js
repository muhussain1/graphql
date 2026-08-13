import { graphqlQuery } from "./api.js";
import { AUDITS_QUERY, PROGRESS_QUERY, USER_QUERY, XP_QUERY } from "./queries.js?v=20260813-1";
import { drawAuditRatio } from "./graphs/auditRatio.js";
import { drawXpOverTime } from "./graphs/xpOverTime.js";

function formatXP(value) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(2)} MB`;
  if (value >= 1_000) return `${Math.round(value / 1_000)} kB`;
  return `${Math.round(value)} B`;
}

function calculateAuditTotals(transactions) {
  return transactions.reduce(
    (totals, transaction) => {
      const amount = Number(transaction.amount) || 0;
      if (transaction.type === "up") totals.up += amount;
      if (transaction.type === "down") totals.down += amount;
      return totals;
    },
    { up: 0, down: 0 }
  );
}

function countPassedProjects(progressRecords) {
  const passedPaths = progressRecords
    .filter((record) => record.object?.type === "project" && Number(record.grade) >= 1)
    .map((record) => record.path);

  return new Set(passedPaths).size;
}

export async function loadProfile() {
  const [userData, xpData, progressData, auditsData] = await Promise.all([
    graphqlQuery(USER_QUERY),
    graphqlQuery(XP_QUERY),
    graphqlQuery(PROGRESS_QUERY),
    graphqlQuery(AUDITS_QUERY),
  ]);

  const user = userData.user?.[0];
  if (!user) throw new Error("No user profile was returned.");

  return {
    user,
    xpTransactions: xpData.transaction ?? [],
    progress: progressData.progress ?? [],
    audits: auditsData.transaction ?? [],
  };
}

export function renderProfile(profile) {
  const totalXP = profile.xpTransactions.reduce(
    (total, transaction) => total + (Number(transaction.amount) || 0),
    0
  );
  const auditTotals = calculateAuditTotals(profile.audits);
  const auditRatio = auditTotals.down > 0 ? auditTotals.up / auditTotals.down : 0;

  document.querySelector("#welcome-message").textContent = `Welcome, ${profile.user.login}`;
  document.querySelector("#user-id").textContent = `Student ID: ${profile.user.id}`;
  document.querySelector("#total-xp").textContent = formatXP(totalXP);
  document.querySelector("#audit-ratio").textContent = auditTotals.up + auditTotals.down > 0
    ? auditRatio.toFixed(1)
    : "—";
  document.querySelector("#passed-projects").textContent = countPassedProjects(profile.progress);

  drawXpOverTime(document.querySelector("#xp-chart"), profile.xpTransactions);
  drawAuditRatio(document.querySelector("#audit-chart"), auditTotals.up, auditTotals.down);
}
