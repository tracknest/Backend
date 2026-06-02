import swaggerJsdoc from "swagger-jsdoc";
import swaggerUi from "swagger-ui-express";
import type { Express } from "express";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isDev = process.env.NODE_ENV !== "production";
const routeExtension = isDev ? "*.ts" : "*.js";
const routesGlob = path.join(process.cwd(), "src", "routes", routeExtension);

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "TrackNest API",
      version: "1.0.0",
      description: "API documentation for TrackNest",
    },
    servers: [
      {
        url: process.env.API_URL ?? "http://localhost:5000",
        description:
          process.env.NODE_ENV === "production" ? "Production" : "Local",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
        },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: [routesGlob],
};

export const swaggerSpec = swaggerJsdoc(options);

export default (app: Express): void => {
  if (process.env.NODE_ENV !== "production") {
    app.use(
      "/api-docs",
      swaggerUi.serve,
      swaggerUi.setup(swaggerSpec, {
        swaggerOptions: {
          persistAuthorization: true,
          docExpansion: "list",
          filter: true,
          tryItOutEnabled: true,
        },
        customSiteTitle: "TrackNest API Docs",
        customCss: `
          .swagger-ui .topbar { display: none }
          .swagger-ui .info { margin: 20px 0 }
        `,
      }),
    );

    app.get("/api-docs.json", (_req, res) => {
      res.setHeader("Content-Type", "application/json");
      res.json(swaggerSpec);
    });

    const pathCount = Object.keys(
      (swaggerSpec as { paths?: object }).paths ?? {},
    ).length;

    console.log(
      `[swagger] Docs available at http://localhost:${process.env.PORT ?? 5000}/api-docs`,
    );
    console.log(`[swagger] Routes glob  : ${routesGlob}`);
    console.log(`[swagger] Paths found  : ${pathCount}`);

    if (pathCount === 0) {
      console.warn(
        "[swagger] ⚠️  No paths found — the glob likely didn't match any files.\n" +
          `           Check that this path exists: ${routesGlob}`,
      );
    }
  }
};