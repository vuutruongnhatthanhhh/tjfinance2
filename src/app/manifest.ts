import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "TJFinance",
    short_name: "TJFinance",
    description: "Quản lý chi tiêu, thu nhập và các khoản đầu tư cá nhân của bạn.",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0f1a",
    theme_color: "#0a0f1a",
    icons: [
      {
        src: "/icon.svg",
        sizes: "any",
        type: "image/svg+xml",
      },
      {
        src: "/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
    ],
  };
}
