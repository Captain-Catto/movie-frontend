import { ImageResponse } from "next/og";

export const runtime = "edge";
export const size = {
  width: 180,
  height: 180,
};
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
          backgroundColor: "#DC2626",
          borderRadius: "40px",
        }}
      >
        <div
          style={{
            width: 0,
            height: 0,
            borderLeft: "50px solid white",
            borderTop: "35px solid transparent",
            borderBottom: "35px solid transparent",
            marginLeft: "10px",
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
