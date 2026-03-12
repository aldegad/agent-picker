import path from "node:path";
import { chromium } from "playwright";

const appRoot = process.cwd();
const artifactsDir = path.resolve(appRoot, ".artifacts", "agent-picker");
const targetUrl =
  process.env.AGENT_PICKER_QA_URL ??
  process.env.DESIGN_LAB_QA_URL ??
  "http://127.0.0.1:3000/playground";

const scenarios = [
  {
    name: "desktop",
    viewport: { width: 1600, height: 980 },
  },
  {
    name: "laptop",
    viewport: { width: 1280, height: 900 },
  },
  {
    name: "mobile",
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
  },
];

async function ensureBoardHasNode(page) {
  const addButtons = page.getByRole("button", { name: /^Add / });
  const buttonCount = await addButtons.count();
  if (buttonCount === 0) return;

  const removeButtons = page.getByRole("button", { name: "Remove study" });
  if ((await removeButtons.count()) === 0) {
    await addButtons.first().click();
    await page.waitForTimeout(400);
  }
}

async function main() {
  await import("node:fs/promises").then((fs) => fs.mkdir(artifactsDir, { recursive: true }));
  const browser = await chromium.launch({ headless: true });

  try {
    for (const scenario of scenarios) {
      const context = await browser.newContext({
        viewport: scenario.viewport,
        isMobile: scenario.isMobile,
        hasTouch: scenario.hasTouch,
      });
      const page = await context.newPage();

      await page.goto(targetUrl, { waitUntil: "domcontentloaded" });
      await page.waitForTimeout(500);
      await ensureBoardHasNode(page);
      await page.screenshot({
        path: path.join(artifactsDir, `${scenario.name}.png`),
        fullPage: true,
      });

      await context.close();
    }
  } finally {
    await browser.close();
  }

  console.log(`Saved screenshots to ${artifactsDir}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
