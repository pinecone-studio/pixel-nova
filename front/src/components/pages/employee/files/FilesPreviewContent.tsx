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
        borderRadius: 20,
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
        borderRadius: 20,
        border: "none",
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
    <div className="flex-1 overflow-hidden bg-white p-6">
      {loading ? (
        <PreviewState
          border="1px solid #E5E7EB"
          background="#F8FAFC"
          color="#64748B"
        >
          Баримт ачаалж байна...
        </PreviewState>
      ) : error ? (
        <PreviewState
          border="1px solid #FECACA"
          background="#FEF2F2"
          color="#DC2626"
        >
          {error}
        </PreviewState>
      ) : content?.contentType === "text/html" ? (
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 20,
            background: "#E5E7EB",
            padding: 24,
            boxShadow: "inset 0 1px 2px rgba(255,255,255,0.8)",
          }}
        >
          <PreviewFrame document={document} srcDoc={content.content} />
        </div>
      ) : previewUrl ? (
        <div
          style={{
            width: "100%",
            height: "100%",
            borderRadius: 20,
            background: "#E5E7EB",
            padding: 24,
            boxShadow: "inset 0 1px 2px rgba(255,255,255,0.8)",
          }}
        >
          <PreviewFrame document={document} previewUrl={previewUrl} />
        </div>
      ) : (
        <PreviewState
          border="1px solid #E5E7EB"
          background="#F8FAFC"
          color="#64748B"
        >
          Preview бэлэн биш байна.
        </PreviewState>
      )}
    </div>
  );
}
