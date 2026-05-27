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
          backgroundColor: "#FAF9F7",
          flexDirection: "column",
          justifyContent: "flex-end",
          padding: "80px 80px",
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            width: "40%",
            height: "100%",
            background:
              "linear-gradient(to right, #FAF9F7, #E8E6E3)",
          }}
        />
        <p
          style={{
            fontSize: 13,
            letterSpacing: "0.25em",
            textTransform: "uppercase",
            color: "#6B6B6B",
            margin: "0 0 16px 0",
          }}
        >
          Исследовать Иркутск · Полезно про Иркутск
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
          Иркутск и Байкал — истории для тех, кто хочет узнать больше
        </p>
        <div
          style={{
            position: "absolute",
            bottom: 48,
            right: 80,
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              backgroundColor: "#0B3D5C",
            }}
          />
          <p
            style={{
              fontSize: 13,
              color: "#0B3D5C",
              margin: 0,
              letterSpacing: "0.15em",
              textTransform: "uppercase",
            }}
          >
            polezno.irkutsk.ru
          </p>
        </div>
      </div>
    ),
    { ...size }
  );
}
