import { z } from "zod";

export const ScanIdInput = z.object({ scan_id: z.string().uuid() });
export const ScanConfirmLinkInput = z.object({
  scan_id: z.string().uuid(),
  access_token: z.string().min(1).optional(),
  token_hash: z.string().min(1).optional(),
  type: z.string().optional(),
});
export const ScanStartEmailInput = z.object({
  scan_id: z.string().uuid(),
  origin: z.string().url().optional(),
});
