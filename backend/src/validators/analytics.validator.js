import { z } from "zod";

const objectId = z.string().regex(/^[a-f\d]{24}$/i, "Invalid project id");
const date = z.string().datetime({ offset: true });

export const analyticsSummarySchema = z.object({
  query: z.object({
    from: date,
    to: date,
    previousFrom: date,
    previousTo: date,
    projectId: objectId.optional()
  })
});
