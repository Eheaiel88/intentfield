import { PublicShell } from "@/components/public-shell";

export const metadata = { title: "Privacy policy — IntentField" };

export default function Privacy() {
  return (
    <PublicShell>
      <div className="wrap reading-wrap policy-page">
        <article className="reader">
          <p className="eyebrow">INTENTFIELD / PRIVACY POLICY</p>
          <h1>Privacy policy</h1>
          <p className="micro">Effective September 30, 2026</p>
          <h2>Who we are</h2>
          <p>
            IntentField operates this website and the IntentField member
            application, including the version available inside Whop. Contact
            us at support@myintentfield.com.
          </p>
          <h2>What we collect and why</h2>
          <p>
            <b>Account information.</b> Sign-in on this website is handled by
            Clerk, our authentication provider, which processes your email
            address and sign-in credentials so you can access your account.
            Inside Whop, your identity comes from your Whop account instead;
            we receive a verified Whop user ID and never your Whop password.
          </p>
          <p>
            <b>Your practice content.</b> Lesson answers, workbook entries,
            tool notes and ledger reflections are stored privately against
            your account so the application can work. They are yours: we do
            not read them in the ordinary course of business, use them for
            advertising, or sell them. You can export them or delete them from
            Settings at any time.
          </p>
          <p>
            <b>Purchases.</b> Payments are processed by Whop; we never see or
            store your card details. We keep a record of each verified
            purchase (payment ID, product, amount, status) to grant and manage
            your access, including if Whop is temporarily unavailable.
          </p>
          <p>
            <b>Analytics on public pages.</b> Our public marketing and
            checkout pages use the Whop pixel so we can measure how visitors
            find us and whether our pages work. It runs only on public pages —
            never inside your private member workspace — and we do not attach
            your practice content to any analytics event.
          </p>
          <h2>Two separate accounts</h2>
          <p>
            The website account and the Whop account are deliberately
            separate, even if both use the same email address. Purchases
            unlock the product on both, but notes and progress stay where you
            wrote them, and we never merge the two.
          </p>
          <h2>Where your data lives</h2>
          <p>
            Application data is stored with Convex (our database provider);
            authentication data with Clerk; payment data with Whop; and the
            website is hosted on Vercel. Each processes data on our behalf
            under their own security practices.
          </p>
          <h2>Your choices</h2>
          <p>
            Export your notes or permanently delete them from Settings inside
            the application. To close your account entirely or ask anything
            about your data, email support@myintentfield.com and we will
            respond within a few business days.
          </p>
        </article>
      </div>
    </PublicShell>
  );
}
