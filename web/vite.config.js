import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import fs from "fs";
import path from "path";
import { readdir, readFile, writeFile, mkdir } from "fs/promises";
import JSON5 from "json5";

export default defineConfig({
  plugins: [
    tailwindcss(),
    // {
    //   name: "transform-json-content",
    //   transform(code, id) {
    //     if (id.endsWith(".json")) {
    //       return code.replace(/"raw:(.*?)"/g, (_, filePath) => {
    //         const fullPath = path.resolve(path.dirname(id), "..", filePath);
    //         const content = fs.readFileSync(fullPath, "utf-8");
    //         return JSON.stringify(content);
    //       });
    //     }
    //   },
    // },
    {
      name: "transform-public-json",
      configureServer(server) {
        // Handle JSON files during development
        server.middlewares.use(async (req, res, next) => {
          if (req.url.endsWith(".json")) {
            try {
              let filePath = path.join("public", req.url);
              const exists = fs.existsSync(filePath);
              let isJSON5 = false;
              if (!exists) {
                filePath = filePath.replace(".json", ".json5");
                isJSON5 = true;
              }
              let content = fs.readFileSync(filePath, "utf-8");

              // convert to standard JSON
              if (isJSON5) {
                content = JSON.stringify(JSON5.parse(content));
              }

              // Process raw: imports
              content = content.replace(/"raw:(.*?)"/g, (_, filePath) => {
                const fullPath = path.join("src", filePath);
                const fileContent = fs.readFileSync(fullPath, "utf-8");
                return JSON.stringify(fileContent);
              });

              res.setHeader("Content-Type", "application/json");
              res.end(content);
            } catch (e) {
              console.error(e);
              next();
            }
          } else {
            next();
          }
        });
      },
      // Process JSON files during production build
      async closeBundle() {
        async function processDirectory(dir) {
          const entries = await readdir(dir, { withFileTypes: true });
          for (const entry of entries) {
            let fullPath = path.join(dir, entry.name);
            if (entry.isDirectory()) {
              await processDirectory(fullPath);
            } else if (
              entry.isFile() &&
              [".json", ".json5"].some((ext) => entry.name.endsWith(ext))
            ) {
              let content = await readFile(fullPath, "utf-8");

              content = content.replace(/"raw:(.*?)"/g, (_, filePath) => {
                const fullPath = path.join("src", filePath);
                const fileContent = fs.readFileSync(fullPath, "utf-8");
                return JSON.stringify(fileContent);
              });

              // convert JSON5 to standard JSON
              if (fullPath.includes(".json5")) {
                fullPath = fullPath.replace(".json5", ".json");
                content = JSON.stringify(JSON5.parse(content), null, 2);
              }

              const outputPath = path.join(
                "dist",
                fullPath.replace("public/", ""),
              );

              await mkdir(path.dirname(outputPath), { recursive: true });
              await writeFile(outputPath, content);
            }
          }
        }

        await processDirectory("public");
      },
    },
  ],
});
