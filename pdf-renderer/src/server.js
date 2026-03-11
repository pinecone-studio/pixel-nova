import express from "express";
import { chromium } from "playwright";

const PORT = Number.parseInt(process.env.PORT ?? "4001", 10);
const RENDERER_SECRET = process.env.PDF_RENDERER_SECRET ?? "";

const app = express();
app.use(express.json({ limit: "10mb" }));

let browserPromise;

function getBrowser() {
  if (!browserPromise) {
    browserPromise = chromium.launch({ headless: true });
  }
  return browserPromise;
}

function isAuthorized(req) {
  if (!RENDERER_SECRET) {
    return true;
  }

  return req.header("x-renderer-secret") === RENDERER_SECRET;
}

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.post("/render-pdf", async (req, res) => {
  if (!isAuthorized(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const { html, documentName } = req.body ?? {};
  if (typeof html !== "string" || html.trim().length === 0) {
    return res.status(400).json({ error: "html is required" });
  }

  const browser = await getBrowser();
  const page = await browser.newPage();

  try {
    await page.setContent(html, { waitUntil: "networkidle" });
    await page.emulateMedia({ media: "screen" });

    const pdf = await page.pdf({
      format: "A4",
      printBackground: true,
      preferCSSPageSize: true,
      margin: {
        top: "12mm",
        right: "12mm",
        bottom: "12mm",
        left: "12mm",
      },
    });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `inline; filename="${documentName ?? "document.pdf"}"`,
    );
    return res.send(Buffer.from(pdf));
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return res.status(500).json({ error: message });
  } finally {
    await page.close();
  }
});

app.listen(PORT, () => {
  console.log(`PDF renderer listening on :${PORT}`);
});
