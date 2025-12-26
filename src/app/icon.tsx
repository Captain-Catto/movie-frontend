import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 32,
  height: 32,
};
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
          backgroundColor: "#DC2626",
          borderRadius: "4px",
        }}
      >
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: "12px solid white",
            borderTop: "8px solid transparent",
            borderBottom: "8px solid transparent",
            marginLeft: "2px",
            display: "flex",
          }}
        />
      </div>
    ),
    {
      ...size,
    }
  );
}
