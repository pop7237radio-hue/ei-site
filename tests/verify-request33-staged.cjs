const fs = require("node:fs");
const path = require("node:path");
const { pathToFileURL } = require("node:url");
const { spawnSync } = require("node:child_process");
const { chromium } = require("playwright");

const root = path.resolve(__dirname, "..");
const sourcePath = path.join(root, "index.html");
const backupPath = path.join(root, "backups", "2026-07-13_before-request33", "index.html");
const stagedPath = path.join(root, "qc", "2026-07-13_request33", "staged-index-with-placeholder.html");
const patchPath = path.join(root, "patches", "2026-07-13_request33_goatcounter_NOT_APPLIED.patch");
const outputDir = path.join(root, "qc", "2026-07-13_request33");
const reportPath = path.join(outputDir, "ei-site-staged-goatcounter-browser-qc.json");
const browserPath = "/Users/user/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell";

fs.mkdirSync(outputDir, { recursive: true });

const report = {
  startedAt: new Date().toISOString(),
  assertions: [],
  failures: [],
  pageErrors: [],
  consoleErrors: [],
  externalRequests: [],
  viewports: {}
};

function check(condition, message) {
  const pass = Boolean(condition);
  report.assertions.push({ message, pass });
  if (!pass) report.failures.push(message);
}

async function inspect(page, name, width, height) {
  await page.setViewportSize({ width, height });
  await page.waitForTimeout(100);
  const state = await page.evaluate(() => ({
    innerWidth: window.innerWidth,
    bodyWidth: document.body.scrollWidth,
    documentWidth: document.documentElement.scrollWidth,
    mainVisible: Boolean(document.querySelector("main")),
    h1: document.querySelector("h1")?.textContent?.trim() || "",
    cards: document.querySelectorAll(".work").length
  }));
  state.horizontalOverflowPx = Math.max(state.bodyWidth, state.documentWidth) - width;
  report.viewports[name] = state;
  check(state.horizontalOverflowPx <= 1, `${name}の横はみ出しは1px以内`);
  check(state.mainVisible, `${name}でmainが表示される`);
  check(state.h1 === "小さな困りごとを、小さなアプリで。", `${name}で見出しが維持される`);
  check(state.cards >= 1, `${name}で制作カードが維持される`);
  await page.screenshot({
    path: path.join(outputDir, `ei-site-staged-${width}x${height}-request33.png`),
    fullPage: true
  });
}

async function main() {
  const source = fs.readFileSync(sourcePath, "utf8");
  const backup = fs.readFileSync(backupPath, "utf8");
  const staged = fs.readFileSync(stagedPath, "utf8");

  check(source === backup, "ei-site本体は着手前バックアップと完全一致");
  check(!source.includes("goatcounter"), "ei-site本体へ計測タグ未適用");
  check(staged.includes("https://YOURCODE.goatcounter.com/count"), "検品用コピーだけにcodeプレースホルダ");
  check(staged.includes("https://gc.zgo.at/count.js"), "検品用コピーに公式script URL");

  const patchCheck = spawnSync("git", ["apply", "--check", patchPath], {
    cwd: root,
    encoding: "utf8"
  });
  report.patchCheck = {
    status: patchCheck.status,
    stdout: patchCheck.stdout,
    stderr: patchCheck.stderr
  };
  check(patchCheck.status === 0, "未適用パッチが現行index.htmlへ競合なく当たる");

  let browser;
  try {
    browser = await chromium.launch({
      executablePath: browserPath,
      headless: true,
      args: ["--no-first-run", "--no-default-browser-check", "--request33-ei-site-staged"]
    });
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.route(/^https?:\/\//, (route) => {
      report.externalRequests.push(route.request().url());
      return route.abort();
    });
    page.on("pageerror", (error) => report.pageErrors.push(String(error)));
    page.on("console", (message) => {
      const expectedBlockedScript = message.type() === "error"
        && message.text().includes("Failed to load resource");
      if (message.type() === "error" && !expectedBlockedScript) {
        report.consoleErrors.push(message.text());
      }
    });

    await page.goto(pathToFileURL(stagedPath).href, {
      waitUntil: "domcontentloaded",
      timeout: 30_000
    });
    await inspect(page, "desktop", 1280, 900);
    await inspect(page, "mobile", 375, 812);
    check(report.externalRequests.length === 1, "検品用コピーの外部要求はscript 1件だけ");
    check(report.externalRequests[0] === "https://gc.zgo.at/count.js", "外部要求先はGoatCounter公式scriptだけ");
    check(report.pageErrors.length === 0, "ページエラー0件");
    check(report.consoleErrors.length === 0, "想定外コンソールエラー0件");
  } finally {
    if (browser) await browser.close();
    report.finishedAt = new Date().toISOString();
    report.pass = report.failures.length === 0;
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  }

  if (!report.pass) {
    console.error(JSON.stringify(report, null, 2));
    process.exitCode = 1;
  } else {
    console.log(JSON.stringify({
      pass: true,
      assertions: report.assertions.length,
      viewports: report.viewports,
      externalRequests: report.externalRequests,
      reportPath
    }, null, 2));
  }
}

main().catch((error) => {
  report.failures.push(error.stack || String(error));
  report.finishedAt = new Date().toISOString();
  report.pass = false;
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.error(error);
  process.exitCode = 1;
});
