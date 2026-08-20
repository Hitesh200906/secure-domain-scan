import { z } from "zod";

export const AUTH_MODES = ["public", "login_required"] as const;
export const WAF_MODES = ["none", "waf"] as const;
export const TECHNOLOGIES = [
  "wordpress_php",
  "spa_frontend",
  "node_express",
  "python",
  "java_spring",
  "dotnet",
  "not_sure",
] as const;
export const SCAN_RATES = ["slow", "medium", "fast"] as const;
export const SCAN_DEPTHS = ["shallow", "standard", "deep"] as const;

export const ScanConfigSchema = z.object({
  authentication: z.enum(AUTH_MODES),
  secure_session_requested: z.boolean().default(false),
  waf: z.enum(WAF_MODES),
  technology: z.enum(TECHNOLOGIES),
  ai_validation: z.boolean(),
  scan_rate: z.enum(SCAN_RATES),
  scan_depth: z.enum(SCAN_DEPTHS),
  advanced: z.object({
    respect_robots: z.boolean(),
    include_subdomains: z.boolean(),
    include_api_endpoints: z.boolean(),
    max_crawl_depth: z.number().int().min(1).max(10),
    request_timeout: z.number().int().min(5).max(120),
    excluded_urls: z.string().trim().max(2000),
  }),
  authorization_confirmed: z.literal(true),
});

export type ScanConfig = z.infer<typeof ScanConfigSchema>;

export const SubmitScanConfigInput = z.object({
  scan_id: z.string().uuid(),
  config: ScanConfigSchema,
});

export const TECH_LABELS: Record<(typeof TECHNOLOGIES)[number], string> = {
  wordpress_php: "WordPress / PHP",
  spa_frontend: "React / Vue / Angular",
  node_express: "Node.js / Express",
  python: "Python / Django / Flask",
  java_spring: "Java / Spring",
  dotnet: ".NET / ASP.NET",
  not_sure: "Not Sure",
};
