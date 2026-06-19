"use client";

import { useCallback, useEffect, useState } from "react";
import { useFormFields } from "@payloadcms/ui";

const SITE_BASE =
  (typeof window !== "undefined"
    ? process.env.NEXT_PUBLIC_SERVER_URL
    : process.env.NEXT_PUBLIC_SERVER_URL)?.replace(/\/$/, "") ||
  "https://irkportal.ru";

export default function ArPostcardQrPreview() {
  const slug = useFormFields(([fields]) => fields.slug?.value as string | undefined);
  const qrTargetUrl = useFormFields(
    ([fields]) => fields.qrTargetUrl?.value as string | undefined
  );
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const targetUrl =
    qrTargetUrl ||
    (slug ? `${SITE_BASE}/ar-postcards/${slug}` : null);

  useEffect(() => {
    if (!targetUrl) {
      setQrDataUrl(null);
      return;
    }

    let cancelled = false;

    void import("qrcode").then((QRCode) => {
      QRCode.toDataURL(targetUrl, {
        width: 180,
        margin: 2,
        errorCorrectionLevel: "M",
      })
        .then((url) => {
          if (!cancelled) setQrDataUrl(url);
        })
        .catch(() => {
          if (!cancelled) setQrDataUrl(null);
        });
    });

    return () => {
      cancelled = true;
    };
  }, [targetUrl]);

  const copyLink = useCallback(async () => {
    if (!targetUrl) return;
    try {
      await navigator.clipboard.writeText(targetUrl);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // ignore
    }
  }, [targetUrl]);

  if (!slug) {
    return (
      <div
        style={{
          marginBottom: "24px",
          padding: "16px",
          border: "1px solid var(--theme-elevation-150)",
          borderRadius: "4px",
          background: "var(--theme-elevation-50)",
        }}
      >
        <p style={{ margin: 0, fontSize: "13px", color: "var(--theme-elevation-500)" }}>
          Укажите slug — здесь появится QR и ссылка для печати на открытке.
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        marginBottom: "24px",
        padding: "16px",
        border: "1px solid var(--theme-elevation-150)",
        borderRadius: "4px",
        background: "var(--theme-elevation-50)",
      }}
    >
      <p
        style={{
          margin: "0 0 12px",
          fontSize: "13px",
          fontWeight: 600,
        }}
      >
        QR для печати
      </p>
      {qrDataUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={qrDataUrl}
          alt={`QR ${slug}`}
          width={180}
          height={180}
          style={{ display: "block", marginBottom: "12px", background: "#fff" }}
        />
      ) : (
        <p style={{ fontSize: "12px", color: "var(--theme-elevation-500)" }}>
          Генерация QR…
        </p>
      )}
      <p
        style={{
          margin: "0 0 8px",
          fontSize: "12px",
          wordBreak: "break-all",
          fontFamily: "monospace",
        }}
      >
        {targetUrl}
      </p>
      <button
        type="button"
        onClick={copyLink}
        style={{
          fontSize: "13px",
          padding: "6px 12px",
          borderRadius: "4px",
          border: "1px solid var(--theme-elevation-200)",
          background: "var(--theme-elevation-0)",
          cursor: "pointer",
        }}
      >
        {copied ? "Скопировано" : "Копировать ссылку"}
      </button>
      <p
        style={{
          margin: "12px 0 0",
          fontSize: "11px",
          color: "var(--theme-elevation-500)",
        }}
      >
        После публикации не меняйте slug — QR на открытках останется прежним.
      </p>
    </div>
  );
}
