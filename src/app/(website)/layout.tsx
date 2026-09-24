import { ClerkProvider } from "@clerk/nextjs";
import { websiteAuthConfigured } from "@/lib/auth-config";
export default function WebsiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!websiteAuthConfigured()) return children;
  return (
    <ClerkProvider
      signInUrl="/sign-in"
      signUpUrl="/sign-up"
      signInFallbackRedirectUrl="/app/today"
      signUpFallbackRedirectUrl="/app/today"
      afterSignOutUrl="/"
      appearance={{
        elements: {
          socialButtonsBlockButton: {
            color: "var(--paper)",
            backgroundColor: "var(--panel)",
            border: "1px solid var(--rule)",
          },
        },
        variables: {
          colorPrimary: "var(--electric)",
          colorPrimaryForeground: "var(--graphite)",
          colorBackground: "var(--panel)",
          colorForeground: "var(--paper)",
          colorInput: "var(--input-surface, #222a23)",
          colorInputForeground: "var(--paper)",
          colorMuted: "var(--surface-soft, #263027)",
          colorMutedForeground: "var(--muted)",
          colorNeutral: "var(--paper)",
          colorBorder: "var(--rule)",
          colorDanger: "var(--danger)",
          fontFamily: "Arial, Helvetica, sans-serif",
          borderRadius: "0.5rem",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
