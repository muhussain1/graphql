// Normal query: basic information about the authenticated user.
export const USER_QUERY = `
  query UserProfile {
    user {
      id
      login
    }
  }
`;

// Query with arguments: only XP transactions, ordered by date.
// It also nests object information inside each transaction.
export const XP_QUERY = `
  query XpTransactions {
    transaction(
      where: { type: { _eq: "xp" } }
      order_by: { createdAt: asc }
    ) {
      amount
      createdAt
      path
      object {
        name
        type
      }
    }
  }
`;

// Nested query: each progress record includes its related project/exercise.
export const PROGRESS_QUERY = `
  query Progress {
    progress(where: { grade: { _is_null: false } }) {
      grade
      path
      object {
        name
        type
      }
    }
  }
`;

// Query with arguments: audit XP given (up) and received (down).
export const AUDITS_QUERY = `
  query Audits {
    transaction(where: { type: { _in: ["up", "down"] } }) {
      type
      amount
    }
  }
`;
