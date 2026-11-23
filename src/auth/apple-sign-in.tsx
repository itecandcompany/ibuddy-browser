import type { ReactNode } from "react";

export function AppleSignInButton(): ReactNode {
  return null;
}

export async function getAppleIdentityToken(): Promise<string> {
  throw new Error("Apple Sign-In is only available in the native iOS app.");
}
