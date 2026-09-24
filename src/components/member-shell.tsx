"use client";
import { useRef } from "react";
import Link from "next/link";
import { Brand } from "./brand";
import { ThemeToggle } from "./theme-toggle";
export function MemberShell({
  base,
  active,
  title,
  children,
  review = false,
  accountMenu,
  owner = false,
}: {
  base: string;
  active: string;
  title: string;
  children: React.ReactNode;
  review?: boolean;
  accountMenu?: React.ReactNode;
  owner?: boolean;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const links = (items: string[][]) =>
    items.map(([id, icon, name]) => (
      <Link
        key={id}
        href={`${base}/${id}`}
        onClick={() => dialog.current?.close()}
        className={`nav-item ${active === id ? "active" : ""}`}
        aria-current={active === id ? "page" : undefined}
      >
        <span aria-hidden="true">{icon}</span>
        {name}
        {active === id && <i />}
      </Link>
    ));
  const nav = (
    <nav aria-label="Member navigation" className="member-navigation">
      <div className="practice-navigation">
        {links([
          ["today", "◒", "Today"],
          ["course", "▤", "The course"],
          ...(!review
            ? [
                ["tools", "◇", "Inner work tools"],
                ["profile", "◎", "My self-image"],
                ["ledger", "≡", "Receiving Ledger"],
                ["book", "▥", "Book & workbook"],
                ["audio", "◖", "Morning & Evening"],
              ]
            : []),
        ])}
      </div>
      {!review && (
        <div className="sidebar-bottom">
          {links([
            ["review", "↻", "My weekly review"],
            ["settings", "⚙", "Notes & settings"],
          ])}
          <div className="products-navigation">
            {links([["purchases", "↗", "My products"]])}
          </div>
          {owner && (
            <div className="owner-navigation">
              <p className="nav-label">OWNER AREA</p>
              {links([["admin", "✎", "Content studio"]])}
            </div>
          )}
        </div>
      )}
    </nav>
  );
  return (
    <>
      {review && (
        <div className="dev-bar">
          <strong>LOCAL DEVELOPMENT REVIEW</strong>
          <span>
            Sample workspace · saved in this browser · no account or payment
          </span>
          <Link href="/">Landing page ↗</Link>
        </div>
      )}
      <div className="app-layout">
        <aside className="sidebar">
          <Brand />
          <p className="nav-label">PROSPERITY 30 / YOUR SPACE</p>
          {nav}
        </aside>
        <div className="workspace">
          <header className="app-topbar">
            <div>
              <button
                className="icon-button mobile-menu"
                onClick={() => dialog.current?.showModal()}
                aria-label="Open navigation"
              >
                ☰
              </button>
              <span>
                <span className="workspace-label">
                  YOUR WORKSPACE <i>/</i>{" "}
                </span>
                <b>{title}</b>
              </span>
            </div>
            <div className="member-account">
              <ThemeToggle />
              <span className="save-status">
                {review ? "LOCAL REVIEW" : "PRIVATE WORKSPACE"}
              </span>
              {accountMenu}
            </div>
          </header>
          <main id="main" tabIndex={-1} className="app-main">
            {children}
          </main>
        </div>
      </div>
      <dialog ref={dialog} className="mobile-menu-panel">
        <div className="dialog-head">
          <Brand />
          <button
            className="icon-button"
            aria-label="Close navigation"
            onClick={() => dialog.current?.close()}
          >
            ×
          </button>
        </div>
        {nav}
      </dialog>
    </>
  );
}
