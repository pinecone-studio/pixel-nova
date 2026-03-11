# PDF Renderer

Runs a small Node service that converts rendered HTML into styled PDFs with Playwright.

## Run

```bash
npm install
npm run dev
```

## Environment

- `PORT` default: `4001`
- `PDF_RENDERER_SECRET` optional shared secret header value

## Endpoint

- `POST /render-pdf`
  - body: `{ "html": "<html>...</html>", "documentName": "file.pdf" }`
  - header: `x-renderer-secret` when secret is configured
