import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          backgroundColor: "#F4F3F0",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "80px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <p
          style={{
            fontSize: 13,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "#6B6B6B",
            margin: "0 0 16px 0",
          }}
        >
          Concept Store · Байкальская эстетика
        </p>
        <p
          style={{
            fontSize: 54,
            fontWeight: 300,
            color: "#1C1C1E",
            margin: 0,
            lineHeight: 1.15,
            maxWidth: 700,
          }}
        >
          Предметы с историей места
        </p>
        <p
          style={{
            fontSize: 18,
            color: "#6B6B6B",
            margin: "20px 0 0 0",
            fontWeight: 300,
          }}
        >
          polezno.irkutsk.ru/shop
        </p>
      </div>
    ),
    { ...size }
  );
}
