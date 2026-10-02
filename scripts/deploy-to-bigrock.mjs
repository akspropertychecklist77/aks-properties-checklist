import { Client } from "basic-ftp";
import { execSync } from "child_process";
import fs from "fs";
import path from "path";

async function deploy() {
  console.log("=========================================");
  console.log("🚀 STARTING DIRECT DEPLOYMENT TO BIGROCK");
  console.log("=========================================\n");

  // 1. Build Astro static production files
  console.log("📦 1. Building Astro production site...");
  execSync("npm run build", { stdio: "inherit" });
  console.log("✓ Build complete.\n");

  // 2. Connect to BigRock FTP
  console.log("📡 2. Connecting to BigRock FTP server...");
  const client = new Client();
  client.ftp.verbose = false; // keep output clean

  try {
    await client.access({
      host: "ftp.akspropertychecklist.in",
      user: "bigrock@akspropertychecklist.in",
      password: "Akgunman@123",
      secure: false
    });
    console.log("✓ Connected to BigRock FTP successfully.\n");

    // 3. Move/Rename old WordPress index.php and .htaccess to avoid conflicts
    console.log("🔄 3. Preparing public_html on server...");
    await client.cd("public_html");
    const currentFiles = await client.list();
    const fileNames = currentFiles.map(f => f.name);

    if (fileNames.includes("index.php")) {
      console.log("   -> Renaming old WordPress index.php to index.php.wordpress_backup...");
      try {
        await client.rename("index.php", "index.php.wordpress_backup");
      } catch (e) {
        console.warn("   (Note: Could not rename index.php:", e.message, ")");
      }
    }

    if (fileNames.includes(".htaccess") && !fileNames.includes(".htaccess.wordpress_backup")) {
      console.log("   -> Backing up old .htaccess to .htaccess.wordpress_backup...");
      try {
        await client.rename(".htaccess", ".htaccess.wordpress_backup");
      } catch (e) {
        console.warn("   (Note: Could not rename .htaccess:", e.message, ")");
      }
    }

    // 4. Upload all files from dist/ into public_html/
    console.log("\n🚚 4. Uploading dist/ files to /public_html on BigRock...");
    client.trackProgress(info => {
      process.stdout.write(`   Uploading: ${info.name} (${info.bytesOverall} bytes)\r`);
    });

    await client.uploadFromDir("dist", ".");
    console.log("\n\n✓ All files uploaded successfully to BigRock!\n");

    // 5. Verify live files
    console.log("🔍 5. Verifying deployed files in public_html...");
    const updatedList = await client.list();
    const updatedNames = updatedList.map(f => f.name);
    console.log("   - index.html present?", updatedNames.includes("index.html") ? "YES ✓" : "NO ✗");
    console.log("   - .htaccess present?", updatedNames.includes(".htaccess") ? "YES ✓" : "NO ✗");
    console.log("   - _astro/ directory present?", updatedNames.includes("_astro") ? "YES ✓" : "NO ✗");
    console.log("   - images/ directory present?", updatedNames.includes("images") ? "YES ✓" : "NO ✗");

  } catch (err) {
    console.error("❌ Deployment failed with error:", err);
    throw err;
  } finally {
    client.close();
  }

  console.log("\n=========================================");
  console.log("🎉 DEPLOYMENT TO BIGROCK COMPLETE!");
  console.log("Website: https://akspropertychecklist.in");
  console.log("=========================================\n");
}

deploy().catch(() => process.exit(1));

