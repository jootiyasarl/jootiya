"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global Error:", error);
  }, [error]);

  return (
    <html>
      <body style={{ padding: 20, fontFamily: "system-ui" }}>
        <h1 style={{ color: "#dc2626", fontSize: 24 }}>Erreur détectée</h1>
        <pre style={{ background: "#f5f5f5", padding: 16, borderRadius: 8, overflow: "auto", fontSize: 13 }}>
          {error?.message || "Unknown error"}
          {"\n\n"}
          {error?.stack || ""}
          {"\n\ndigest: "}
          {error?.digest || "N/A"}
        </pre>
        <button
          onClick={() => reset()}
          style={{
            marginTop: 20,
            padding: "10px 20px",
            background: "#f97316",
            color: "white",
            border: "none",
            borderRadius: 8,
            fontSize: 16,
            cursor: "pointer",
          }}
        >
          Réessayer
        </button>
      </body>
    </html>
  );
}
