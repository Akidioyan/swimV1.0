const fs = require('fs');
const path = require('path');
const glob = require('glob');

// --- 配置 ---
// 您的映射文件路径，键是旧路径，值是新 CDN URL
// 示例: { "/pingpang/assets/logo.png": "https://cdn.example.com/assets/logo-hashed.png", ... }
const assetMapPath = path.resolve(__dirname, 'asset-map.json'); // 假设映射文件与此脚本在同一目录，并命名为 asset-map.json
const distDir = path.resolve(__dirname, '../../dist'); // dist 目录的路径
const fileTypesToProcess = ['html', 'css', 'js']; // 要处理的文件类型扩展名
// --- END 配置 ---

function escapeRegExp(string) {
  // 转义正则表达式特殊字符，但不转义路径分隔符 /
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function replaceInFile(filePath, assetMap) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    let fileChangedOverall = false; // Track if the file was changed by any replacement

    // Helper function to perform replacement and log
    const doReplace = (pathKeyToReplace, cdnUrl, isDerived = false) => {
      // Regex to match the path when it's likely a full asset path string
      // Looks for paths enclosed in quotes, parentheses, or followed/preceded by space or common path-ending characters
      const regex = new RegExp('(["\'\(\s])' + escapeRegExp(pathKeyToReplace) + '(["\'\)\s\?#])', 'g');
      let madeChangeThisCall = false;
      if (regex.test(content)) {
        content = content.replace(regex, (match, p1, p2) => {
          return p1 + cdnUrl + p2;
        });
        console.log(`  Replaced${isDerived ? " (derived bare path)" : " (direct map key)"}: "${pathKeyToReplace}" 
    with: "${cdnUrl}"`);
        madeChangeThisCall = true;
      }
      return madeChangeThisCall;
    };

    console.log(`Processing file: ${filePath}`);
    let changesInThisFile = false;

    for (const originalMapKey in assetMap) {
      if (assetMap.hasOwnProperty(originalMapKey)) {
        const cdnUrl = assetMap[originalMapKey];
        let pathReplacedInLoop = false;

        // 1. Always try to replace the original key from asset-map.json (e.g., "/pingpang/assets/image.png")
        if (doReplace(originalMapKey, cdnUrl, false)) {
          pathReplacedInLoop = true;
        }

        // 2. If originalMapKey starts with "/pingpang/", also try to replace its bare version (e.g., "assets/image.png")
        //    but only if no explicit mapping already exists in assetMap for that bare version.
        const pingpangPrefix = "/pingpang/";
        if (originalMapKey.startsWith(pingpangPrefix)) {
          const derivedBarePath = originalMapKey.substring(pingpangPrefix.length); // e.g., "assets/image.png"
          const pathPotentiallyInCode = "/" + derivedBarePath; // e.g., "/assets/image.png"
          
          // Check if an explicit mapping for the derived forms already exists.
          // If not, attempt replacement using these derived forms.
          // We give precedence to explicit mappings for bare paths or paths with a leading slash
          // to avoid overriding a more specific CDN URL if one were defined for these forms.
          if (!assetMap.hasOwnProperty(derivedBarePath) && !assetMap.hasOwnProperty(pathPotentiallyInCode)) {
            // Prioritize the form with a leading slash, as it's common in src attributes like "/assets/..."
            if (doReplace(pathPotentiallyInCode, cdnUrl, true)) { 
              pathReplacedInLoop = true;
            } 
            // Fallback to the bare form (e.g., "assets/...") if the slashed one didn't match and wasn't already replaced
            else if (doReplace(derivedBarePath, cdnUrl, true)) { 
              pathReplacedInLoop = true;
            }
          }
        }
        
        if (pathReplacedInLoop) {
          changesInThisFile = true;
        }
      }
    }

    if (changesInThisFile) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`  File updated: ${filePath}`);
      fileChangedOverall = true; // Though this variable isn't used further, good for clarity
    } else {
      // console.log(`  No changes made to: ${filePath}`); // Optional: log files with no changes
    }

  } catch (error) {
    console.error(`Error processing file ${filePath}:`, error);
  }
}

function main() {
  if (!fs.existsSync(assetMapPath)) {
    console.error(`Error: Asset map file not found at ${assetMapPath}`);
    console.log('Please create an asset-map.json file with oldPath: newCdnUrl mappings.');
    console.log('Example content for asset-map.json:');
    console.log('{');
    console.log('  "/pingpang/assets/image.png": "httpsXXX/image-hash.png",');
    console.log('  "/pingpang/assets/style.css": "httpsXXX/style-hash.css"');
    console.log('}');
    return;
  }

  if (!fs.existsSync(distDir)) {
    console.error(`Error: dist directory not found at ${distDir}`);
    return;
  }

  let assetMap;
  try {
    assetMap = JSON.parse(fs.readFileSync(assetMapPath, 'utf8'));
  } catch (error) {
    console.error(`Error reading or parsing asset map file ${assetMapPath}:`, error);
    return;
  }

  if (Object.keys(assetMap).length === 0) {
    console.log('Asset map is empty. Nothing to replace.');
    return;
  }

  console.log(`Starting asset path replacement in ${distDir}...`);

  const globPattern = `**/*.@(${fileTypesToProcess.join('|')})`;
  const files = glob.sync(globPattern, { cwd: distDir, nodir: true });

  if (files.length === 0) {
    console.log('No files found to process with the specified extensions.');
    return;
  }

  files.forEach(file => {
    const filePath = path.join(distDir, file);
    replaceInFile(filePath, assetMap);
  });

  console.log('Asset path replacement process finished.');
}

// --- 运行脚本 ---
// 您可以通过在终端中运行 `node src/utils/replaceAssetPaths.js` 来执行此脚本
// 确保在运行前已经构建了项目 (npm run build) 并且 asset-map.json 文件已准备好
main(); 