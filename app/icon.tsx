import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
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
          fontSize: 18,
          fontWeight: 600,
          letterSpacing: "-0.04em",
        }}
      >
        И
      </div>
    ),
    { ...size }
  );
}
