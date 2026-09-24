import { MemberProvider } from "@/components/member-provider";
import { websiteAuthConfigured } from "@/lib/auth-config";
export default function MemberLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!websiteAuthConfigured() || !process.env.NEXT_PUBLIC_CONVEX_URL)
    return children;
  return <MemberProvider>{children}</MemberProvider>;
}
