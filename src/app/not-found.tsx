import { PublicShell } from "@/components/public-shell";
import { ButtonLink } from "@/components/brand";
export default function NotFound() {
  return (
    <PublicShell>
      <div className="wrap setup-page">
        <p className="eyebrow">PAGE NOT FOUND</p>
        <h1>Let’s find your next step.</h1>
        <ButtonLink href="/">Back to IntentField</ButtonLink>
      </div>
    </PublicShell>
  );
}
