const assert = require("node:assert/strict");
const crypto = require("node:crypto");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("/Users/user/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright");

const siteRoot = path.resolve(__dirname, "..");
const brainRoot = path.resolve(siteRoot, "..", "..");
const indexPath = path.join(siteRoot, "index.html");
const indexSource = fs.readFileSync(indexPath, "utf8");
const baseUrl = process.env.REQUEST73_BASE_URL || "http://127.0.0.1:8765/";
const outputDir = process.env.REQUEST73_QC_DIR
  || path.join(
    brainRoot,
    "00_幹部room",
    "00_司令室_Codex",
    "reports",
    "assets",
    "2026-08-15_request73"
  );
const reportPath = path.join(outputDir, "request73-browser-qc.json");
const browserPath = "/Users/user/Library/Caches/ms-playwright/chromium_headless_shell-1228/chrome-headless-shell-mac-arm64/chrome-headless-shell";
const existingLpPaths = [
  path.join(siteRoot, "gem-skill", "mail", "index.html"),
  path.join(siteRoot, "gem-skill", "index.html"),
  path.join(siteRoot, "kesazuni-akeru", "index.html")
];

function attributeValues(source, attribute) {
  return [...source.matchAll(new RegExp(`${attribute}="([^"]+)"`, "g"))].map((match) => match[1]);
}

const existingLpInventory = existingLpPaths.map((file) => {
  const source = fs.readFileSync(file, "utf8");
  return {
    file,
    pages: attributeValues(source, "data-page"),
    sections: attributeValues(source, "data-sec"),
    labels: attributeValues(source, "data-rondo-label")
  };
});

const expectedSections = [
  "top-hero",
  "top-gem",
  "top-app",
  "top-service",
  "top-works",
  "top-profile",
  "top-contact",
  "top-footer"
];
const existingLpPages = new Set(existingLpInventory.flatMap((item) => item.pages));
const existingLpSections = new Set(existingLpInventory.flatMap((item) => item.sections));
const existingLpLabels = new Set(existingLpInventory.flatMap((item) => item.labels));
const expectedCtaLabels = [
  "top-nav-register",
  "top-hero-gem",
  "top-gem-mail",
  "top-app-line",
  "top-service-line",
  "top-contact-line"
];
const expectedPriceRows = [
  ["いまあるアプリ・ツールの小修正", "3,000〜5,000円"],
  ["1枚もののミニアプリ制作予約メモ・チェックリスト・計算ツールなど", "5,000〜15,000円"],
  ["音声入力・カレンダー付きアプリ", "10,000〜30,000円"],
  ["見守り（不具合対応・小さな改善）", "月3,000〜5,000円"]
];
const expectedTimeline = [
  ["2004", "教員になる", "高校・特別支援学校あわせて22年、300人以上を指導"],
  ["2022.12", "腹膜透析を開始", "自宅で毎日。働き方を「仕組みで回す」設計に切り替える"],
  ["2026.4", "退職、AI実務へ", "複数のAIと役割分担するチーム体制を自宅に構築"],
  ["2026", "AIミニアプリ工房として活動開始", "美容室の予約アプリ導入・学習アプリ「そらりん」開発・Robloxゲーム開発・AI活用教材リリース"]
];

fs.mkdirSync(outputDir, { recursive: true });

const report = {
  request: 73,
  startedAt: new Date().toISOString(),
  baseUrl,
  source: {
    path: indexPath,
    sha256: crypto.createHash("sha256").update(indexSource).digest("hex"),
    validatorPath: __filename,
    validatorSha256: crypto.createHash("sha256").update(fs.readFileSync(__filename)).digest("hex")
  },
  existingLpInventory,
  assertions: [],
  failures: [],
  consoleErrors: [],
  pageErrors: [],
  mockedHeatIngests: [],
  viewports: {}
};

function check(condition, message, detail) {
  const pass = Boolean(condition);
  report.assertions.push({ message, pass, ...(detail === undefined ? {} : { detail }) });
  if (!pass) report.failures.push({ message, detail });
}

function normalize(value) {
  return String(value || "").replace(/\s+/g, " ").trim();
}

function sameMembers(actual, expected) {
  return actual.length === expected.length
    && [...actual].sort().every((value, index) => value === [...expected].sort()[index]);
}

async function inspectViewport(browser, name, width, height) {
  const context = await browser.newContext({
    viewport: { width, height },
    reducedMotion: "reduce"
  });
  const page = await context.newPage();
  const localConsoleErrors = [];
  const localPageErrors = [];

  await page.route("https://rondo.pop7237radio.workers.dev/ingest/heat**", async (route) => {
    const request = route.request();
    const rawBody = request.postData() || "";
    let payload = null;
    try { payload = JSON.parse(rawBody); } catch (_) {}
    report.mockedHeatIngests.push({
      viewport: name,
      method: request.method(),
      url: request.url(),
      contentType: request.headers()["content-type"] || "",
      hasBody: Boolean(rawBody),
      payload
    });
    await route.fulfill({ status: 204, body: "" });
  });

  page.on("pageerror", (error) => {
    localPageErrors.push(String(error));
    report.pageErrors.push({ viewport: name, text: String(error) });
  });
  page.on("console", (message) => {
    if (message.type() === "error") {
      localConsoleErrors.push(message.text());
      report.consoleErrors.push({ viewport: name, text: message.text() });
    }
  });

  await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 30_000 });
  await page.waitForTimeout(2_300);

  const state = await page.evaluate(({ expectedSections, existingLpSections }) => {
    const visible = (element) => {
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return style.display !== "none" && style.visibility !== "hidden" && rect.width > 0 && rect.height > 0;
    };
    const sectionValues = [...document.querySelectorAll("[data-sec]")]
      .map((element) => element.getAttribute("data-sec"));
    const labels = [...document.querySelectorAll("[data-rondo-label]")]
      .map((element) => element.getAttribute("data-rondo-label"));
    const ctas = [...document.querySelectorAll("[data-rondo-cta]")].map((element) => {
      const rect = element.getBoundingClientRect();
      const owner = element.closest("[data-sec], [data-rondo-click-sec]");
      return {
        label: element.getAttribute("data-rondo-label"),
        href: element.getAttribute("href"),
        resolvedHref: element.href,
        height: rect.height,
        width: rect.width,
        visible: visible(element),
        owner: owner?.getAttribute("data-sec") || owner?.getAttribute("data-rondo-click-sec") || null
      };
    });
    const hashes = [...document.querySelectorAll('a[href^="#"]')].map((element) => ({
      href: element.getAttribute("href"),
      targetExists: Boolean(document.querySelector(element.getAttribute("href"))),
      isCta: element.hasAttribute("data-rondo-cta")
    }));
    const ids = [...document.querySelectorAll("[id]")].map((element) => element.id);
    const revealNotVisible = [...document.querySelectorAll(".reveal")]
      .filter((element) => getComputedStyle(element).opacity === "0")
      .length;
    const heatScripts = [...document.querySelectorAll('script[src*="rondo.pop7237radio.workers.dev/heat.js"]')]
      .map((element) => ({ page: element.dataset.page, defer: element.defer }));

    return {
      title: document.title,
      bodyText: document.body.innerText,
      h1: document.querySelector("h1")?.textContent || "",
      heroSub: document.querySelector(".hero .sub")?.textContent || "",
      heroPrice: document.querySelector(".hero-price")?.textContent || "",
      bodyWidth: document.body.scrollWidth,
      documentWidth: document.documentElement.scrollWidth,
      viewportWidth: window.innerWidth,
      heatScripts,
      sectionValues,
      sectionDuplicates: sectionValues.filter((value, index) => sectionValues.indexOf(value) !== index),
      sectionConflicts: sectionValues.filter((value) => existingLpSections.includes(value)),
      navClickSections: [...document.querySelectorAll("[data-rondo-click-sec]")]
        .map((element) => element.getAttribute("data-rondo-click-sec")),
      labels,
      labelDuplicates: labels.filter((value, index) => labels.indexOf(value) !== index),
      overlongLabels: labels.filter((value) => value.length > 24),
      ctas,
      hashes,
      duplicateIds: ids.filter((value, index) => ids.indexOf(value) !== index),
      revealNotVisible,
      worksCount: document.querySelectorAll("#works .work").length,
      priceRows: [...document.querySelectorAll("table.price tr")].map((row) => [
        row.querySelector("th")?.textContent?.replace(/\s+/g, " ").trim() || "",
        row.querySelector("td")?.textContent?.replace(/\s+/g, " ").trim() || ""
      ]),
      profileParagraphs: [...document.querySelectorAll("#profile .prof-text p")]
        .map((element) => element.textContent.replace(/\s+/g, " ").trim()),
      timeline: [...document.querySelectorAll("#profile .tl-item")].map((item) => [
        item.querySelector(".year")?.textContent?.trim() || "",
        item.querySelector(".what")?.textContent?.trim() || "",
        item.querySelector(".memo")?.textContent?.replace(/\s+/g, " ").trim() || ""
      ]),
      expectedSections
    };
  }, { expectedSections, existingLpSections: [...existingLpSections] });

  state.horizontalOverflowPx = Math.max(state.bodyWidth, state.documentWidth) - state.viewportWidth;
  report.viewports[name] = state;

  check(state.title === "あなたのGemをSkills化しませんか？｜AIミニアプリ工房 えい", `${name}: titleが確定文言`);
  check(normalize(state.h1) === "あなたのGemをSkills化しませんか？", `${name}: H1がGem主柱`, normalize(state.h1));
  check(normalize(state.heroSub) === "たくさんあるGemを、AIに投げるだけでスキル化してくれるスキルを作っています。", `${name}: Gem説明が稼働LPと一致`);
  check(normalize(state.heroPrice) === "値段は980円。事前登録で500円クーポンをお渡しします（980円 → 480円）。", `${name}: 価格・クーポン文言が一致`);
  check(state.horizontalOverflowPx <= 1, `${name}: 横はみ出し1px以内`, state.horizontalOverflowPx);
  check(state.heatScripts.length === 1, `${name}: heat.jsは1件`, state.heatScripts);
  check(state.heatScripts[0]?.page === "ei-top", `${name}: Rondo page keyはei-top`, state.heatScripts);
  check(!existingLpPages.has(state.heatScripts[0]?.page), `${name}: page keyは既設3LPと非衝突`, [...existingLpPages]);
  check(state.heatScripts[0]?.defer === true, `${name}: heat.jsはdefer`);
  check(sameMembers(state.sectionValues, expectedSections), `${name}: data-sec 8区画が確定値`, state.sectionValues);
  check(state.sectionDuplicates.length === 0, `${name}: data-sec重複0`, state.sectionDuplicates);
  check(state.sectionConflicts.length === 0, `${name}: 既設LPのdata-secと衝突0`, state.sectionConflicts);
  check(JSON.stringify(state.navClickSections) === JSON.stringify(["top-nav"]), `${name}: 固定ナビはclick-secのみ`, state.navClickSections);
  check(state.labelDuplicates.length === 0, `${name}: data-rondo-label重複0`, state.labelDuplicates);
  check(state.overlongLabels.length === 0, `${name}: labelは24文字以内`, state.overlongLabels);
  check(state.labels.every((label) => !existingLpLabels.has(label)), `${name}: labelは既設3LPと非衝突`, [...existingLpLabels]);
  check(sameMembers(state.ctas.map((cta) => cta.label), expectedCtaLabels), `${name}: CTAラベル6件が確定値`, state.ctas);
  check(state.ctas.every((cta) => cta.owner), `${name}: 全CTAが計測区画内`, state.ctas);
  check(state.ctas.every((cta) => !cta.href.startsWith("#")), `${name}: 内部スクロールをCV扱いしない`, state.ctas);
  check(state.ctas.every((cta) => cta.resolvedHref.includes("/gem-skill/mail/") || cta.resolvedHref.startsWith("https://lin.ee/")), `${name}: CTA行き先は事前登録かLINEのみ`, state.ctas);
  check(state.ctas.filter((cta) => cta.visible).every((cta) => cta.height >= 44), `${name}: 可視CTAは高さ44px以上`, state.ctas);
  check(state.hashes.every((hash) => hash.targetExists), `${name}: ページ内リンクの行き先が全て存在`, state.hashes);
  check(state.hashes.every((hash) => !hash.isCta), `${name}: ページ内リンクにCTA属性0`, state.hashes);
  check(state.duplicateIds.length === 0, `${name}: ID重複0`, state.duplicateIds);
  check(state.revealNotVisible === 0, `${name}: 表示保険後の非表示コンテンツ0`, state.revealNotVisible);
  check(state.worksCount === 8, `${name}: 既存WORKS 8件を維持`, state.worksCount);
  check(["週3透析", "週3回透析", "血液透析", "病院で透析", "ベッド", "針"].every((word) => !state.bodyText.includes(word)), `${name}: 公開本文のD-01誤認語0`);
  check(JSON.stringify(state.priceRows) === JSON.stringify(expectedPriceRows), `${name}: 料金4項目を一字維持`, state.priceRows);
  check(state.profileParagraphs.length === 3 && state.profileParagraphs[1].includes("いまは自宅で毎日、腹膜透析をしながら仕事をしています。"), `${name}: プロフィール正本を維持`, state.profileParagraphs);
  check(JSON.stringify(state.timeline) === JSON.stringify(expectedTimeline), `${name}: 経歴年表4件を一字維持`, state.timeline);
  check(localPageErrors.length === 0, `${name}: pageerror 0`, localPageErrors);
  check(localConsoleErrors.length === 0, `${name}: console.error 0`, localConsoleErrors);

  await page.evaluate(() => {
    const cta = document.querySelector('[data-rondo-label="top-hero-gem"]');
    cta.addEventListener("click", (event) => event.preventDefault(), { once: true });
    cta.click();
  });
  await page.waitForTimeout(200);

  for (const section of expectedSections) {
    await page.locator(`[data-sec="${section}"]`).scrollIntoViewIfNeeded();
    const reached = await page.locator(`[data-sec="${section}"]`).evaluate((element) => {
      const rect = element.getBoundingClientRect();
      return rect.bottom > 0 && rect.top < window.innerHeight;
    });
    check(reached, `${name}: ${section}へ実スクロール到達`);
  }

  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(150);
  await page.screenshot({
    path: path.join(outputDir, `ei-site-local-${width}x${height}-request73.png`),
    fullPage: true
  });
  await context.close();
}

async function main() {
  const forbiddenD01 = ["週3透析", "週3回透析", "血液透析", "病院で透析"];
  check(forbiddenD01.every((word) => !indexSource.includes(word)), "D-01誤認語0", forbiddenD01.filter((word) => indexSource.includes(word)));
  check(indexSource.includes("いまは自宅で毎日、腹膜透析をしながら仕事をしています。"), "D-01正本文を維持");
  const browser = await chromium.launch({
    executablePath: browserPath,
    headless: true,
    args: ["--no-first-run", "--no-default-browser-check", "--request73-ei-site-qc"]
  });

  try {
    await inspectViewport(browser, "mobile", 375, 812);
    await inspectViewport(browser, "desktop", 1440, 1000);
    const allowedPayloadKeys = new Set(["page", "url", "w", "events"]);
    const allowedEventKeys = new Set(["kind", "sec", "sel", "gx", "gy", "n", "v"]);
    check(report.mockedHeatIngests.length >= 4, "Rondo ingestをPC/SPで実捕捉", report.mockedHeatIngests.length);
    check(report.mockedHeatIngests.every((item) => item.method === "POST"), "全ingestがPOST");
    check(report.mockedHeatIngests.every((item) => item.payload?.page === "ei-top"), "全payloadのpageがei-top");
    check(report.mockedHeatIngests.every((item) => ["sp", "pc"].includes(item.payload?.w)), "全payloadに端末区分sp/pc");
    check(report.mockedHeatIngests.every((item) => Array.isArray(item.payload?.events) && item.payload.events.length > 0), "全payloadにeventあり");
    check(report.mockedHeatIngests.every((item) => Object.keys(item.payload || {}).every((key) => allowedPayloadKeys.has(key))), "payloadに許可外フィールド0");
    check(report.mockedHeatIngests.every((item) => item.payload.events.every((event) => Object.keys(event).every((key) => allowedEventKeys.has(key)))), "eventに許可外フィールド0");
    for (const [viewport, widthKey] of [["mobile", "sp"], ["desktop", "pc"]]) {
      const events = report.mockedHeatIngests
        .filter((item) => item.viewport === viewport && item.payload?.w === widthKey)
        .flatMap((item) => item.payload.events);
      check(events.some((event) => event.kind === "view"), `${viewport}: view送信を捕捉`);
      check(events.some((event) => event.kind === "cta_view"), `${viewport}: cta_view送信を捕捉`);
      check(events.some((event) => event.kind === "cta_click" && event.sec === "top-hero" && event.sel.endsWith("|top-hero-gem")), `${viewport}: 主CTAクリック送信を捕捉`, events);
    }
  } finally {
    await browser.close();
    report.finishedAt = new Date().toISOString();
    report.pass = report.failures.length === 0;
    fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  }

  assert.equal(report.failures.length, 0, JSON.stringify(report.failures, null, 2));
  process.stdout.write(`${JSON.stringify({
    pass: true,
    assertions: report.assertions.length,
    mockedHeatIngests: report.mockedHeatIngests.length,
    reportPath,
    screenshots: [
      path.join(outputDir, "ei-site-local-375x812-request73.png"),
      path.join(outputDir, "ei-site-local-1440x1000-request73.png")
    ]
  }, null, 2)}\n`);
}

main().catch((error) => {
  report.finishedAt = new Date().toISOString();
  report.pass = false;
  if (!report.failures.some((failure) => failure.message === "unhandled error")) {
    report.failures.push({ message: "unhandled error", detail: error.stack || String(error) });
  }
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`, "utf8");
  console.error(error.stack || error);
  process.exitCode = 1;
});
