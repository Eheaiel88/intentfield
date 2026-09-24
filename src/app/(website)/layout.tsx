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
            color: "#F1F0E8",
            backgroundColor: "#263027",
            border: "1px solid #42533e",
          },
        },
        variables: {
          colorPrimary: "#D5FF52",
          colorPrimaryForeground: "#101312",
          colorBackground: "#171c18",
          colorForeground: "#F1F0E8",
          colorInput: "#222a23",
          colorInputForeground: "#F1F0E8",
          colorMuted: "#263027",
          colorMutedForeground: "#b9c2b5",
          fontFamily: "Arial, Helvetica, sans-serif",
          borderRadius: "0.5rem",
        },
      }}
    >
      {children}
    </ClerkProvider>
  );
}
