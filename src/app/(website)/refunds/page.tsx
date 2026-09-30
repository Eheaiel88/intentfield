import { PublicShell } from "@/components/public-shell";

export const metadata = { title: "Refund policy — IntentField" };

export default function Refunds() {
  return (
    <PublicShell>
      <div className="wrap reading-wrap policy-page">
        <article className="reader">
          <p className="eyebrow">INTENTFIELD / REFUND POLICY</p>
          <h1>Refund policy</h1>
          <p className="micro">Effective September 30, 2026</p>
          <h2>Seven-day refunds on digital products</h2>
          <p>
            Every IntentField product — the Book + Workbook ($19), Prosperity
            30 ($79) and the Morning &amp; Evening audio companion ($29) — is a
            one-time digital purchase with a seven-day refund window. If a
            product is not a fit, request a refund within 7 days of purchase
            and we will refund that purchase in full.
          </p>
          <h2>How to request one</h2>
          <p>
            Payments are processed by Whop, and refunds are issued through
            your Whop order. Use the order support option on your Whop
            receipt, or email us at support@myintentfield.com with the email
            you purchased with, and we will process it. You never need to
            share your private notes or explain yourself to qualify.
          </p>
          <h2>What happens after a refund</h2>
          <p>
            Access to the refunded product ends when the refund is issued.
            Products you did not refund are unaffected — refunding the audio
            companion, for example, leaves your book and course exactly as
            they were. Your saved notes remain available for export from
            Settings while your account exists.
          </p>
          <h2>What this policy is not</h2>
          <p>
            The refund window applies to your purchase; it is not a guarantee
            of income, business results or any specific personal outcome, and
            nothing about the products should be read that way.
          </p>
        </article>
      </div>
    </PublicShell>
  );
}
