import { defineConfig, loadEnv } from "vite";
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  console.log("[vite.config] VITE_BACKEND_URL =", env.VITE_BACKEND_URL);
  return {
    server: {
      host: "0.0.0.0",
      port: 5173,
      strictPort: true,
      watch: { usePolling: true },
      proxy: {
        "/api": {
          target: env.VITE_BACKEND_URL,
          changeOrigin: true,
          secure: false,
          rewrite: (path) => path,
          configure(proxy) {
            proxy.on("proxyReq", (proxyReq, req) => {
              console.log(
                "[proxyReq]",
                req.method,
                req.url,
                "→",
                proxyReq.protocol + "//" + proxyReq.host + proxyReq.path
              );
            });
            proxy.on("proxyRes", (proxyRes, req) => {
              console.log("[proxyRes]", proxyRes.statusCode, req.url);
            });
            proxy.on("error", (err) => {
              console.error("[proxy error]", err);
            });
          },
        },
      },
    },
  };
});
