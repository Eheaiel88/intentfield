import { test, expect, type Page } from "@playwright/test";
import {
  clerk,
  clerkSetup,
  setupClerkTestingToken,
} from "@clerk/testing/playwright";
import { execFileSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";

// Opt-in integration test: uses only this app's development Clerk/Convex
// instances, reserved test email addresses and synthetic lesson responses.
const app = "app_3Jl9HTB86RFhkocqo2A6WkgnzLG";
const run = randomUUID();
const users: Array<{
  id: string;
  email: string;
  principal: string;
  source: string;
}> = [];
function apiMutation(path: string, method: string, body?: object) {
  const args = [
    "api",
    path,
    "--app",
    app,
    "--instance",
    "dev",
    "-X",
    method,
    ...(body ? ["-d", JSON.stringify(body)] : []),
  ];
  execFileSync("clerk", [...args, "--dry-run"], { stdio: "pipe" });
  const out = execFileSync("clerk", [...args, "--yes"], { encoding: "utf8" });
  return JSON.parse(out);
}
function grant(
  index: number,
  active: boolean,
  sku: "book" | "course" | "audio" = "course",
) {
  const u = users[index];
  execFileSync(
    "npx",
    [
      "convex",
      "run",
      "grants:applyVerified",
      JSON.stringify({
        principal: u.principal,
        sku,
        source: u.source + ":" + sku,
        active,
      }),
    ],
    { stdio: "pipe" },
  );
}
async function previewCookie(page: Page) {
  if (!process.env.TEST_VERCEL_COOKIE_FILE) return;
  const cookies = readFileSync(process.env.TEST_VERCEL_COOKIE_FILE, "utf8")
    .split("\n")
    .filter((l) => l.startsWith("#HttpOnly_") || !l.startsWith("#"))
    .map((l) => l.replace("#HttpOnly_", "").split("\t"))
    .filter((a) => a.length === 7)
    .map(([domain, , path, secure, expires, name, value]) => ({
      domain,
      path,
      secure: secure === "TRUE",
      expires: Number(expires),
      name,
      value,
      httpOnly: true,
      sameSite: "None" as const,
    }));
  await page.context().addCookies(cookies);
}
async function signIn(page: Page, index: number) {
  await previewCookie(page);
  await page.goto("/sign-in");
  await clerk.signIn({ page, emailAddress: users[index].email });
  await page.goto("/app/today");
}
test.beforeAll(async () => {
  if (
    !process.env.CLERK_SECRET_KEY?.startsWith("sk_test_") ||
    !process.env.CONVEX_DEPLOYMENT?.startsWith("dev:") ||
    process.env.CLERK_JWT_ISSUER_DOMAIN !==
      "https://creative-chipmunk-4237.clerk.accounts.dev"
  )
    throw Error("Use IntentField development credentials only.");
  await clerkSetup();
  for (const name of ["a", "b"]) {
    const email = `intentfield-${run}-${name}+clerk_test@example.com`;
    const u = apiMutation("/users", "POST", {
      email_address: [email],
      skip_password_requirement: true,
      first_name: "IntentField test " + name,
    });
    users.push({
      id: u.id,
      email,
      principal: process.env.CLERK_JWT_ISSUER_DOMAIN + "|" + u.id,
      source: "test:clerk-convex:" + run + ":" + name,
    });
  }
});
test.afterAll(async () => {
  for (let i = 0; i < users.length; i++) {
    try {
      grant(i, false);
      grant(i, false, "book");
      grant(i, false, "audio");
    } finally {
      apiMutation("/users/" + users[i].id, "DELETE");
    }
  }
});
test("complete member framework saves and resumes private work across products and sessions", async ({
  page,
  browser,
}) => {
  test.setTimeout(180000);
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await previewCookie(page);
  await setupClerkTestingToken({ page });
  await page.goto("/app/today");
  await expect(page).toHaveURL(/\/sign-in/);
  await signIn(page, 0);
  await expect(
    page.getByText("Prosperity 30 isn’t included in your account yet."),
  ).toBeVisible();
  for (const sku of ["book", "course", "audio"] as const) grant(0, true, sku);
  await page.reload();
  await page
    .getByRole("link", { name: "Begin today’s practice", exact: true })
    .click();
  await page
    .getByLabel("My chief prosperity focus")
    .fill("E2E: Build a useful service");
  await page.getByLabel("One action I will take").fill("E2E: Ask one customer");
  await page
    .getByLabel("When and what I will review")
    .fill("E2E: Friday feedback");
  await page
    .getByRole("button", { name: "Complete this lesson", exact: false })
    .click();
  await expect(page).toHaveURL(/lesson\/1\/complete/);
  await page.goto("/app/today");
  await expect(
    page.getByRole("heading", {
      name: "E2E: Build a useful service",
      exact: true,
    }),
  ).toBeVisible();
  await expect(page.getByText("1 OF 30 LESSONS COMPLETED")).toBeVisible();
  await page.goto("/app/lesson/2");
  await page
    .locator("aside textarea")
    .nth(0)
    .fill("E2E: Reflection on my self-image");
  await page
    .getByLabel("One action I will take")
    .fill("E2E: Send one proposal");
  await page
    .getByRole("button", { name: "Complete this lesson", exact: false })
    .click();
  await expect(page).toHaveURL(/lesson\/2\/complete/);
  await page.goto("/app/lesson/3");
  await page
    .getByRole("button", { name: "Open the lesson guide", exact: false })
    .click();
  await page
    .getByRole("button", { name: "Help me reflect", exact: false })
    .click();
  for (const [i, field] of (
    await page.locator("dialog textarea").all()
  ).entries())
    await field.fill("E2E guide " + i);
  await page.getByRole("button", { name: "Review my reflection" }).click();
  await page
    .getByRole("button", { name: "Save this reflection to my lesson" })
    .click();
  await expect(page.locator("dialog.guide-dialog")).not.toBeVisible();
  await expect(page.getByText("My saved reflection")).toBeVisible();
  await page.goto("/app/book/workbook");
  await page
    .getByLabel("My chief prosperity focus")
    .fill("E2E workbook direction");
  await page
    .getByRole("button", { name: "Save my notes", exact: true })
    .click();
  await expect(
    page.getByText("Saved to your private workspace."),
  ).toBeVisible();
  await page.goto("/app/tools");
  await expect(page.locator(".tool-card")).toHaveCount(8);
  await page.locator(".tool-card").first().click();
  await page.locator("textarea").first().fill("E2E private tool note");
  await page
    .getByRole("button", { name: "Save my notes", exact: true })
    .click();
  await expect(
    page.getByText("Saved to your private workspace."),
  ).toBeVisible();
  await page.goto("/app/profile");
  await expect(page.locator("select")).toHaveCount(12);
  await page.locator("select").nth(0).selectOption("0");
  await page.locator("select").nth(1).selectOption("");
  await page
    .getByRole("button", { name: "Save my notes", exact: true })
    .click();
  await expect(
    page.getByText("Saved to your private workspace."),
  ).toBeVisible();
  await page.reload();
  await expect(page.locator("select").nth(0)).toHaveValue("0");
  await expect(page.locator("select").nth(1)).toHaveValue("");
  await page.goto("/app/ledger");
  await page
    .getByLabel("What did I do, and what happened?")
    .fill("E2E: Sent an offer and received feedback");
  await page.getByRole("button", { name: "Save reflection draft" }).click();
  await expect(
    page.getByText("Saved to your private workspace."),
  ).toBeVisible();
  await page
    .getByRole("button", { name: "Save my reflection", exact: true })
    .click();
  await expect(
    page
      .locator(".ledger-entries")
      .getByText("E2E: Sent an offer and received feedback"),
  ).toBeVisible();
  await page.goto("/app/review");
  await expect(page.getByText("Lessons completed")).toBeVisible();
  await page.goto("/app/audio/morning");
  await expect(page.locator(".audio-script p")).not.toHaveCount(0);
  await expect(
    page.getByText("Written pilot available.", { exact: false }),
  ).toBeVisible();
  await page.goto("/app/course");
  await expect(page.locator(".lesson-row")).toHaveCount(30);
  await page.goto("/app/lesson/30");
  await expect(page.locator(".teaching")).toBeVisible();
  const fresh = await browser.newContext();
  const resumed = await fresh.newPage();
  await signIn(resumed, 0);
  await expect(resumed.getByText("2 OF 30 LESSONS COMPLETED")).toBeVisible();
  await resumed.goto("/app/book/workbook");
  await expect(resumed.getByLabel("My chief prosperity focus")).toHaveValue(
    "E2E workbook direction",
  );
  await fresh.close();
  const other = await browser.newContext();
  const isolated = await other.newPage();
  grant(1, true, "book");
  await signIn(isolated, 1);
  await expect(
    isolated.getByText("Prosperity 30 isn’t included in your account yet."),
  ).toBeVisible();
  await isolated.goto("/app/book/workbook");
  await expect(isolated.getByLabel("My chief prosperity focus")).toHaveValue(
    "",
  );
  await isolated.goto("/app/audio");
  await expect(
    isolated.getByText(
      "Morning & Evening audio isn’t included in your account yet.",
    ),
  ).toBeVisible();
  await other.close();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/app/today");
  await expect(page.locator(".app-main")).toBeVisible();
  await page.screenshot({
    path: "/tmp/intentfield-today-desktop.png",
    fullPage: true,
  });
  await page.setViewportSize({ width: 390, height: 844 });
  for (const path of [
    "today",
    "course",
    "lesson/1",
    "lesson/30",
    "tools",
    "tool/desire",
    "profile",
    "ledger",
    "review",
    "book",
    "book/workbook",
    "audio",
    "audio/evening",
    "purchases",
    "settings",
  ]) {
    await page.goto("/app/" + path);
    await expect(page.locator(".app-main")).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      path + " mobile overflow",
    ).toBe(true);
  }
  await page.goto("/app/lesson/1");
  await expect(page.locator(".app-main")).toBeVisible();
  await page.screenshot({
    path: "/tmp/intentfield-lesson-mobile.png",
    fullPage: true,
  });
  await page.getByRole("button", { name: "Open navigation" }).click();
  await expect(page.locator("dialog.mobile-menu-panel")).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.locator("dialog.mobile-menu-panel")).not.toBeVisible();
  await page.setViewportSize({ width: 1440, height: 1000 });
  await page.goto("/app/settings");
  const downloadPromise = page.waitForEvent("download");
  await page
    .getByRole("button", { name: "Export my notes", exact: false })
    .click();
  const download = await downloadPromise;
  expect(download.suggestedFilename()).toBe("intentfield-my-notes.json");
  await page.getByRole("button", { name: "Clear my workspace notes" }).click();
  await page
    .getByLabel("Type CLEAR MY NOTES to confirm")
    .fill("CLEAR MY NOTES");
  await page
    .getByRole("button", { name: "Clear my notes", exact: true })
    .click();
  await expect(
    page.getByText("Your notes were cleared.", { exact: false }),
  ).toBeVisible();
  await page.goto("/app/today");
  await expect(page.getByText("0 OF 30 LESSONS COMPLETED")).toBeVisible();
  grant(0, false);
  await page.reload();
  await expect(
    page.getByText("Prosperity 30 isn’t included in your account yet."),
  ).toBeVisible();
  expect(errors).toEqual([]);
});

test("owner content studio publishes a draft and serves uploaded PDF and audio", async ({
  page,
}) => {
  test.setTimeout(120000);
  for (const sku of ["book", "course", "audio"] as const) grant(0, true, sku);
  execFileSync(
    "npx",
    [
      "convex",
      "run",
      "content:setOwner",
      JSON.stringify({ principal: users[0].principal }),
    ],
    { stdio: "pipe" },
  );
  await signIn(page, 0);
  await page.goto("/app/admin");
  await expect(
    page.getByRole("heading", { name: "Shape the journey." }),
  ).toBeVisible();
  await expect(
    page.getByLabel("Choose content to edit").locator("option"),
  ).toHaveCount(42);
  // Exercise the editor on the existing lesson without changing its published words.
  await page.getByLabel("Choose content to edit").selectOption("lesson/30");
  if (
    await page
      .getByText("PUBLISHED CONTENT · REVISION", { exact: false })
      .count()
  ) {
    const original = await page
      .getByLabel("Title", { exact: true })
      .inputValue();
    await page.getByLabel("Title", { exact: true }).fill(original + " ");
    await page.getByRole("button", { name: "Save draft", exact: true }).click();
    await expect(
      page.getByText("SAVED DRAFT / NOT PUBLISHED", { exact: false }),
    ).toBeVisible();
    await page.getByLabel("Title", { exact: true }).fill(original);
    await page.getByRole("button", { name: "Save draft", exact: true }).click();
    await expect(
      page.getByRole("button", { name: "Publish saved draft" }),
    ).toBeEnabled();
    await page.getByRole("button", { name: "Publish saved draft" }).click();
    await expect(
      page.getByText("PUBLISHED CONTENT · REVISION", { exact: false }),
    ).toBeVisible();
  }
  for (const key of ["audio/morning", "book"]) {
    await page.getByLabel("Choose content to edit").selectOption(key);
    if (
      await page.getByRole("button", { name: "Remove published file" }).count()
    )
      continue; // Never replace an owner's uploaded file.
    try {
      if (key === "book")
        await page
          .locator("input[type=file]")
          .setInputFiles({
            name: "intentfield-e2e-sample.pdf",
            mimeType: "application/pdf",
            buffer: readFileSync(
              "public/downloads/intentfield-book-workbook-sample.pdf",
            ),
          });
      else {
        const wav = Buffer.alloc(44 + 8820);
        wav.write("RIFF");
        wav.writeUInt32LE(wav.length - 8, 4);
        wav.write("WAVEfmt ", 8);
        wav.writeUInt32LE(16, 16);
        wav.writeUInt16LE(1, 20);
        wav.writeUInt16LE(1, 22);
        wav.writeUInt32LE(44100, 24);
        wav.writeUInt32LE(88200, 28);
        wav.writeUInt16LE(2, 32);
        wav.writeUInt16LE(16, 34);
        wav.write("data", 36);
        wav.writeUInt32LE(8820, 40);
        await page
          .locator("input[type=file]")
          .setInputFiles({
            name: "intentfield-e2e-silence.wav",
            mimeType: "audio/wav",
            buffer: wav,
          });
      }
      await page
        .getByRole("button", { name: "Upload and publish file" })
        .click();
      await expect(
        page.getByRole("button", { name: "Remove published file" }),
      ).toBeVisible();
      await page.goto("/app/" + key);
      if (key === "book") {
        const url = await page
          .getByRole("link", { name: "Download the book PDF", exact: false })
          .getAttribute("href");
        const response = await page.request.get(url!);
        expect(response.ok()).toBe(true);
        expect(response.headers()["content-type"]).toContain("application/pdf");
      } else {
        await expect(page.locator("audio")).toBeVisible();
        await expect
          .poll(() =>
            page
              .locator("audio")
              .evaluate(
                (el: HTMLAudioElement) =>
                  Number.isFinite(el.duration) && el.duration > 0,
              ),
          )
          .toBe(true);
      }
    } finally {
      await page.goto("/app/admin");
      await page.getByLabel("Choose content to edit").selectOption(key);
      if (
        await page
          .getByText("Current file: intentfield-e2e-", { exact: false })
          .count()
      ) {
        page.once("dialog", (d) => d.accept());
        await page
          .getByRole("button", { name: "Remove published file" })
          .click();
        await expect(
          page.getByText("No production file published yet."),
        ).toBeVisible();
      }
    }
  }
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(page.locator(".content-editor")).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.screenshot({
    path: "/tmp/intentfield-admin-mobile.png",
    fullPage: true,
  });
});
