import type { Document, DocumentContent } from "@/lib/types";

function PreviewState({
  border,
  background,
  color,
  children,
}: {
  border: string;
  background?: string;
  color: string;
  children: string;
}) {
  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        borderRadius: 10,
        border,
        background,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color,
        fontSize: 14,
      }}
    >
      {children}
    </div>
  );
}

function PreviewFrame({
  document,
  previewUrl,
  srcDoc,
}: {
  document: Document;
  previewUrl?: string;
  srcDoc?: string;
}) {
  return (
    <iframe
      title={document.documentName}
      style={{
        width: "100%",
        height: "100%",
        borderRadius: 10,
        border: "1px solid rgba(255,255,255,0.10)",
        background: "#fff",
      }}
      src={previewUrl}
      srcDoc={srcDoc}
    />
  );
}

export function FilesPreviewContent({
  document,
  content,
  previewUrl,
  loading,
  error,
}: {
  document: Document;
  content: DocumentContent | null;
  previewUrl: string | null;
  loading: boolean;
  error: string | null;
}) {
  return (
    <div
      style={{
        height: "calc(100% - 65px)",
        background: "#0a0b0f",
        padding: 24,
      }}
    >
      {loading ? (
        <PreviewState
          border="1px solid rgba(255,255,255,0.10)"
          color="rgba(148,163,184,0.5)"
        >
          Баримт ачаалж байна...
        </PreviewState>
      ) : error ? (
        <PreviewState
          border="1px solid rgba(239,68,68,0.2)"
          background="rgba(239,68,68,0.05)"
          color="#f87171"
        >
          {error}
        </PreviewState>
      ) : content?.contentType === "text/html" ? (
        <PreviewFrame document={document} srcDoc={content.content} />
      ) : previewUrl ? (
        <PreviewFrame document={document} previewUrl={previewUrl} />
      ) : (
        <PreviewState
          border="1px solid rgba(255,255,255,0.10)"
          color="rgba(148,163,184,0.5)"
        >
          Preview бэлэн биш байна.
        </PreviewState>
      )}
    </div>
  );
}
