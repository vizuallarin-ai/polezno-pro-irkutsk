import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0B3D5C",
          color: "#FAF9F7",
          fontSize: 96,
          fontWeight: 500,
          letterSpacing: "-0.04em",
        }}
      >
        И
      </div>
    ),
    { ...size }
  );
}
