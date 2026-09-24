"use client";
import { useRef } from "react";
import Link from "next/link";
import { Brand } from "./brand";
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
  const nav = (
    <nav aria-label="Member navigation">
      {[
        ["today", "◒", "Today"],
        ["course", "▤", "The course"],
        ...(!review
          ? [
              ["tools", "◇", "Inner work tools"],
              ["profile", "◎", "My self-image"],
              ["ledger", "≡", "Receiving Ledger"],
              ["book", "▥", "Book & workbook"],
              ["audio", "◖", "Morning & Evening"],
              ["review", "↻", "My weekly review"],
              ["purchases", "↗", "My products"],
              ["settings", "⚙", "Notes & settings"],
              ...(owner ? [["admin", "✎", "Content studio"]] : []),
            ]
          : []),
      ].map(([id, icon, name]) => (
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
      ))}
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
                YOUR WORKSPACE <i>/</i> <b>{title}</b>
              </span>
            </div>
            <div className="member-account">
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
