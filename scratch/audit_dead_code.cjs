const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const srcDir = path.join(rootDir, 'src');

function getFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        if (stat.isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== 'dist') {
                getFiles(filePath, fileList);
            }
        } else {
            if (filePath.endsWith('.ts') || filePath.endsWith('.tsx')) {
                fileList.push(filePath);
            }
        }
    });
    return fileList;
}

const allFiles = getFiles(srcDir);
const importMap = {};
const exportsMap = {};

console.log("==========================================");
console.log("🧹 DEAD CODE & COMPONENT USAGE AUDIT 🧹");
console.log("==========================================");
console.log(`Found ${allFiles.length} TypeScript/React files inside src/.\n`);

// Initialize usage counters
const fileUsage = {};
allFiles.forEach(file => {
    const relativePath = path.relative(srcDir, file).replace(/\\/g, '/');
    fileUsage[relativePath] = {
        path: file,
        referencedBy: []
    };
});

// Scan files for imports
allFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const relativePath = path.relative(srcDir, file).replace(/\\/g, '/');
    
    // Match standard imports like: import { X } from '@/components/Y' or './Y'
    // Regex matches strings inside single or double quotes in import statements
    const importRegex = /import\s+[\s\S]*?\s+from\s+['"]([^'"]+)['"]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
        let importPath = match[1];
        
        // Resolve path aliases or relative paths
        let resolvedPath = '';
        if (importPath.startsWith('@/')) {
            resolvedPath = importPath.substring(2); // remove '@/ '
        } else if (importPath.startsWith('./') || importPath.startsWith('../')) {
            const fileDir = path.dirname(file);
            const absoluteImportPath = path.resolve(fileDir, importPath);
            resolvedPath = path.relative(srcDir, absoluteImportPath).replace(/\\/g, '/');
        }
        
        if (resolvedPath) {
            // Check matches with extensions or without extensions
            const matchingKeys = Object.keys(fileUsage).filter(key => {
                const keyWithoutExt = key.replace(/\.(ts|tsx)$/, '');
                return keyWithoutExt === resolvedPath || key === resolvedPath;
            });
            
            matchingKeys.forEach(key => {
                if (!fileUsage[key].referencedBy.includes(relativePath)) {
                    fileUsage[key].referencedBy.push(relativePath);
                }
            });
        }
    }
});

// Identify entry points (should not be flagged as dead code)
const entryPoints = ['main.tsx', 'App.tsx', 'vite-env.d.ts', 'type_defs.ts'];

let deadFilesCount = 0;
console.log("⚠️ Unreferenced Files (Potential Dead Code):");

Object.keys(fileUsage).sort().forEach(key => {
    const isEntryPoint = entryPoints.some(ep => key.endsWith(ep));
    const isLibOrIntegration = key.startsWith('integrations/') || key.startsWith('lib/') || key.startsWith('type_defs');
    
    if (fileUsage[key].referencedBy.length === 0 && !isEntryPoint && !isLibOrIntegration) {
        deadFilesCount++;
        console.log(`  - ❌ [${key}] - 0 references`);
    }
});

if (deadFilesCount === 0) {
    console.log("  ✅ SUCCESS: No unreferenced components or utility files detected.");
}

console.log("\n==========================================");
console.log("📦 DEPENDENCY COMPLEXITY ANALYZER (package.json)");
console.log("==========================================");

const pkgPath = path.join(rootDir, 'package.json');
if (fs.existsSync(pkgPath)) {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    const deps = Object.keys(pkg.dependencies || {});
    const devDeps = Object.keys(pkg.devDependencies || {});
    
    console.log(`Total Dependencies     : ${deps.length}`);
    console.log(`Total Dev Dependencies : ${devDeps.length}`);
    
    // Check if any major bulky dependencies are present
    const bulkyDeps = ['lodash', 'moment', 'chart.js', 'recharts', 'date-fns'];
    console.log("\nMajor Bundled Libraries Detected:");
    bulkyDeps.forEach(dep => {
        if (deps.includes(dep) || devDeps.includes(dep)) {
            const isDev = devDeps.includes(dep) ? "dev" : "prod";
            console.log(`  - [${dep}] (${isDev})`);
        }
    });
}
console.log("==========================================\n");
