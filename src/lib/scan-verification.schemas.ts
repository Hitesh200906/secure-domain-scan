import { z } from "zod";

export const ScanIdInput = z.object({ scan_id: z.string().uuid() });
export const ScanOtpInput = z.object({
  scan_id: z.string().uuid(),
  code: z.string().trim().regex(/^\d{6}$/),
});
