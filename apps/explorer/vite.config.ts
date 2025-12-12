import fs from "fs";
import path from "path";

import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import { defineConfig, type Plugin } from "vite";

import type { OutputAsset } from "rollup";
// import inject from "@rollup/plugin-inject";

// Rollup's CommonJS plugin only processes node_modules by default. Include our
// locally-built workspace packages so named exports from CommonJS bundles work.
const workspaceDistPackagesPattern = /dist[\\/]packages[\\/]/;

/**
 * Custom Vite plugin to generate version.html with @lit-protocol package versions
 */
function generateVersionPage(): Plugin {
  return {
    name: "generate-version-page",
    generateBundle(_, bundle) {
      // Read package.json to extract @lit-protocol versions
      const packageJsonPath = path.resolve(process.cwd(), "package.json");
      const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf-8"));

      // Filter @lit-protocol packages
      const litPackages = Object.entries(packageJson.dependencies || {})
        .filter(([name]) => name.startsWith("@lit-protocol"))
        .sort(([a], [b]) => a.localeCompare(b));

      // Generate HTML content
      const html = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Lit Protocol Package Versions | Naga Interactive Doc</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 2rem;
            background-color: #f8f9fa;
        }
        .container {
            background: white;
            padding: 2rem;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
        h1 {
            color: #333;
            border-bottom: 2px solid #007acc;
            padding-bottom: 0.5rem;
        }
        .package-list {
            list-style: none;
            padding: 0;
        }
        .package-item {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0.75rem;
            border-bottom: 1px solid #eee;
            transition: background-color 0.2s;
        }
        .package-item:hover {
            background-color: #f8f9fa;
        }
        .package-name {
            font-weight: 600;
            color: #333;
        }
        .package-version {
            font-family: 'Monaco', 'Consolas', monospace;
            background: #e9ecef;
            padding: 0.25rem 0.5rem;
            border-radius: 4px;
            color: #007acc;
        }
        .generated-time {
            margin-top: 2rem;
            padding-top: 1rem;
            border-top: 1px solid #eee;
            color: #666;
            font-size: 0.9rem;
        }
        .home-link {
            display: inline-block;
            margin-top: 1rem;
            padding: 0.5rem 1rem;
            background: #007acc;
            color: white;
            text-decoration: none;
            border-radius: 4px;
            transition: background-color 0.2s;
        }
        .home-link:hover {
            background: #005a9c;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>@lit-protocol Package Versions</h1>
        <p>This page shows all the Lit Protocol packages used in this build.</p>
        
        <ul class="package-list">
            ${litPackages
              .map(
                ([name, version]) => `
            <li class="package-item">
                <span class="package-name">${name}</span>
                <span class="package-version">${version}</span>
            </li>
            `
              )
              .join("")}
        </ul>
        
        <div class="generated-time">
            Generated on: ${new Date().toISOString()}
        </div>
        
        <a href="/" class="home-link">← Back to Home</a>
    </div>
</body>
</html>`;

      // Emit the version.html file
      bundle["version.html"] = {
        type: "asset",
        fileName: "version.html",
        source: html,
      } as OutputAsset;
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  preview: {
    allowedHosts: ["lit-explorer-naga.onrender.com", "naga-explorer.getlit.dev"],
  },
  plugins: [
    react(),
    // inject({ Buffer: ["buffer", "Buffer"] }),
    generateVersionPage(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@layout": path.resolve(__dirname, "./src/layout"),
      buffer: "buffer",
    },
    dedupe: ["wagmi", "@wagmi/core", "viem"],
  },
  optimizeDeps: { include: ["buffer"] },
  build: {
    commonjsOptions: {
      include: [/node_modules/, workspaceDistPackagesPattern],
    },
  },
});
