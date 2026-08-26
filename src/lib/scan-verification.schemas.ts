import { z } from "zod";

export const ScanIdInput = z.object({ scan_id: z.string().uuid() });
export const ScanStartEmailInput = z.object({
  scan_id: z.string().uuid(),
  origin: z.string().url().optional(),
});
