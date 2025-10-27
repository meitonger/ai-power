// apps/web/lib/auth.ts
export function getUserRole(): string | null {
    return localStorage.getItem('role');
  }
  