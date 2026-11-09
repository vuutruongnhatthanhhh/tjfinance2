import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// iOS "Add to Home Screen" ignores icon.svg and only reads apple-icon, so
// the coin needs its own PNG render here (same shape/gradients as icon.svg)
// to show up on mobile the way it already does in desktop tabs.
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
          background: "#0a0f1a",
        }}
      >
        <svg width="132" height="132" viewBox="0 0 32 32" fill="none">
          <defs>
            <linearGradient id="coinOuter" x1="4" y1="3" x2="28" y2="29" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#5eead4" />
              <stop offset="55%" stopColor="#2dd4bf" />
              <stop offset="100%" stopColor="#0f766e" />
            </linearGradient>
            <linearGradient id="coinRim" x1="16" y1="5" x2="16" y2="27" gradientUnits="userSpaceOnUse">
              <stop offset="0%" stopColor="#99f6e4" />
              <stop offset="100%" stopColor="#14b8a6" />
            </linearGradient>
          </defs>
          <circle cx="16" cy="16" r="14" fill="url(#coinOuter)" />
          <circle cx="16" cy="16" r="10.5" fill="none" stroke="url(#coinRim)" strokeWidth="1.3" opacity="0.55" />
          <path
            d="M8.5 20.5L13 15.5L16.5 18.5L23.5 10.5"
            stroke="#f0fdfa"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
          <path
            d="M18.3 10L23.6 10.3L23.3 15.6"
            stroke="#f0fdfa"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
            fill="none"
          />
        </svg>
      </div>
    ),
    { ...size }
  );
}
