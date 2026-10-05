import { createAuthClient } from "@neondatabase/auth";
import { BetterAuthReactAdapter } from "@neondatabase/auth/react/adapters";

export const authClient = createAuthClient(process.env.NEON_AUTH_URL!, {
  adapter: BetterAuthReactAdapter(),
});
