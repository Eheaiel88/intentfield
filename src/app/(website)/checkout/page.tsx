import { PublicShell } from "@/components/public-shell";
import { BookObject, ButtonLink } from "@/components/brand";
export default function Checkout() {
  return (
    <PublicShell>
      <div className="flow-wrap wrap">
        <div className="flow-grid">
          <section>
            <p className="eyebrow">YOUR BEGINNING / $19</p>
            <h1 className="flow-title">
              The book.
              <br />
              The work.
              <br />
              <span>Your next step.</span>
            </h1>
            <p className="lead">The Inner Work of Building Wealth</p>
            <div className="purchase-product">
              <BookObject small />
              <div>
                <h3>The Wealth Primer</h3>
                <p>
                  Digital book + printable workbook
                  <br />
                  Worked examples + action checklist
                </p>
                <span className="pill">ONE-TIME PURCHASE</span>
              </div>
            </div>
            <div className="preview-payment">
              <span className="lock-icon">◇</span>
              <div>
                <strong>Purchases are not open yet</strong>
                <p>
                  We are preparing the complete book and connecting Whop
                  checkout. You can read the opening chapter now.
                </p>
              </div>
            </div>
            <ButtonLink href="/sample">Read the sample</ButtonLink>
          </section>
          <aside className="order-summary">
            <p className="eyebrow">THE PLANNED OFFER</p>
            <h3>A stronger foundation.</h3>
            <div className="order-row">
              <span>Book + workbook</span>
              <b>$19</b>
            </div>
            <p className="micro">
              Optional offers after the book:
              <br />
              Prosperity 30 course + platform · additional $79
              <br />
              Morning & Evening Audio · additional $29
              <br />
              <br />
              One-time prices in USD, before applicable tax.
            </p>
          </aside>
        </div>
      </div>
    </PublicShell>
  );
}
