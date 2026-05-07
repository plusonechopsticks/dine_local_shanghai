/**
 * Social media CLI for Dine Local Shanghai using OpenCLI.
 *
 * Setup:
 *   npm install -g @jackwener/opencli
 *
 * Usage:
 *   npx tsx scripts/social.ts post   --platform weibo   --message "..."
 *   npx tsx scripts/social.ts post   --platform facebook --message "..."
 *   npx tsx scripts/social.ts post   --platform instagram --message "..."
 *   npx tsx scripts/social.ts check  --platform weibo
 *   npx tsx scripts/social.ts check  --platform facebook
 *   npx tsx scripts/social.ts check  --platform instagram
 *   npx tsx scripts/social.ts setup
 */

import { execSync } from "child_process";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type Platform = "weibo" | "facebook" | "instagram";
type Command = "post" | "check" | "setup" | "help";

interface Args {
  command: Command;
  platform?: Platform;
  message?: string;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const PLATFORMS: Platform[] = ["weibo", "facebook", "instagram"];

function isValidPlatform(p: string): p is Platform {
  return PLATFORMS.includes(p as Platform);
}

function opencliAvailable(): boolean {
  try {
    execSync("opencli --version", { stdio: "pipe" });
    return true;
  } catch {
    return false;
  }
}

function runOpencli(args: string): string {
  try {
    return execSync(`opencli ${args}`, { encoding: "utf8", stdio: "pipe" });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "opencli command failed";
    throw new Error(message);
  }
}

function printSetupInstructions() {
  console.log(`
OpenCLI Social Media — Setup
=============================

1. Install OpenCLI globally:

   npm install -g @jackwener/opencli

2. OpenCLI uses your existing Chrome login sessions — no API keys needed.
   Make sure you are already logged in to each platform in Chrome.

3. Verify installation:

   opencli --version

Supported platforms for Dine Local Shanghai:
  • weibo     — Chinese microblogging (fully supported by OpenCLI)
  • facebook  — Meta social network
  • instagram — Image-focused platform

Run a post:
  npx tsx scripts/social.ts post --platform weibo --message "Your post text"

Check notifications/feed:
  npx tsx scripts/social.ts check --platform weibo
`);
}

function printHelp() {
  console.log(`
Usage: npx tsx scripts/social.ts <command> [options]

Commands:
  post    Post a message to a social media platform
  check   Check notifications/feed for a platform
  setup   Show setup instructions for OpenCLI
  help    Show this help message

Options:
  --platform   Target platform: weibo | facebook | instagram
  --message    Text content of the post (required for 'post')

Examples:
  npx tsx scripts/social.ts post --platform weibo --message "Come dine with a local Shanghai family!"
  npx tsx scripts/social.ts post --platform instagram --message "Authentic home cooking in Shanghai"
  npx tsx scripts/social.ts check --platform facebook
`);
}

// ---------------------------------------------------------------------------
// Argument parsing
// ---------------------------------------------------------------------------

function parseArgs(argv: string[]): Args {
  const args = argv.slice(2);
  const command = (args[0] as Command) ?? "help";

  let platform: Platform | undefined;
  let message: string | undefined;

  for (let i = 1; i < args.length; i++) {
    if (args[i] === "--platform" && args[i + 1]) {
      const p = args[++i];
      if (!isValidPlatform(p)) {
        console.error(
          `Unknown platform "${p}". Must be one of: ${PLATFORMS.join(", ")}`
        );
        process.exit(1);
      }
      platform = p;
    } else if (args[i] === "--message" && args[i + 1]) {
      message = args[++i];
    }
  }

  return { command, platform, message };
}

// ---------------------------------------------------------------------------
// Commands
// ---------------------------------------------------------------------------

function cmdPost(platform: Platform, message: string) {
  if (!opencliAvailable()) {
    console.error(
      "OpenCLI is not installed. Run `npx tsx scripts/social.ts setup` for instructions."
    );
    process.exit(1);
  }

  console.log(`Posting to ${platform}...`);
  // OpenCLI command: opencli run <platform>.post "<message>"
  const output = runOpencli(`run ${platform}.post "${message.replace(/"/g, '\\"')}"`);
  console.log(output || "Post published successfully.");
}

function cmdCheck(platform: Platform) {
  if (!opencliAvailable()) {
    console.error(
      "OpenCLI is not installed. Run `npx tsx scripts/social.ts setup` for instructions."
    );
    process.exit(1);
  }

  console.log(`Checking ${platform} notifications/feed...`);
  // OpenCLI command: opencli run <platform>.check
  const output = runOpencli(`run ${platform}.check`);
  console.log(output || "No new notifications.");
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

const { command, platform, message } = parseArgs(process.argv);

switch (command) {
  case "post": {
    if (!platform) {
      console.error("--platform is required for the post command.");
      printHelp();
      process.exit(1);
    }
    if (!message) {
      console.error("--message is required for the post command.");
      printHelp();
      process.exit(1);
    }
    cmdPost(platform, message);
    break;
  }

  case "check": {
    if (!platform) {
      console.error("--platform is required for the check command.");
      printHelp();
      process.exit(1);
    }
    cmdCheck(platform);
    break;
  }

  case "setup": {
    printSetupInstructions();
    break;
  }

  default: {
    printHelp();
    break;
  }
}
