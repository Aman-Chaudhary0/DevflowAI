import { z } from "zod";

const text = (max = 12000) => z.string().trim().max(max).optional();
const base = { prompt: text(), language: z.enum(["javascript", "typescript", "python", "java", "go", "rust"]).optional(), framework: z.enum(["react", "nextjs", "vue", "angular", "svelte", "none"]).optional(), instructions: text(3000), code: text(16000), sourceCode: text(16000), error: text(5000), stackTrace: text(8000), expectedBehavior: text(2000), projectName: text(120), description: text(3000), documentationType: text(50), applicationType: text(100), users: text(1000), roles: text(2000), functionality: text(4000), database: text(80), backendTechnology: text(100), integrations: text(2000), dialect: z.enum(["PostgreSQL", "MySQL", "MongoDB", "SQLite", "SQL Server"]).optional(), schema: text(6000), reviewFocus: text(2000), codeType: text(100), additionalInstructions: text(3000) };
const makeSchema = (required) => z.object({ body: z.object({ ...base, ...Object.fromEntries(required.map((key) => [key, key === "dialect" ? base.dialect : z.string().trim().min(1).max(key === "code" || key === "sourceCode" ? 16000 : 12000)])) }).strict() }).refine(({ body }) => JSON.stringify(body).length <= 20000, "AI tool input exceeds the request limit");
export const aiToolSchemas = {
  "code-generator": makeSchema(["prompt"]),
  "code-review": makeSchema(["code"]),
  documentation: makeSchema(["prompt"]),
  "bug-fixer": makeSchema(["error"]),
  "backend-generator": makeSchema(["prompt"]),
  "sql-generator": makeSchema(["prompt", "dialect"])
};
