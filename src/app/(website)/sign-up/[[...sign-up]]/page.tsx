import { AuthPage } from "@/components/auth-page";
export const metadata = {
  title: "Create your account — IntentField",
  robots: { index: false, follow: false },
};
export default function SignUpPage() {
  return <AuthPage signUp />;
}
