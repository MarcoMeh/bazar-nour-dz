const fs = require('fs');
const path = require('path');

const rootDir = path.resolve(__dirname, '..');
const migrationsDir = path.join(rootDir, 'supabase', 'migrations');

if (!fs.existsSync(migrationsDir)) {
    console.error("Migrations directory not found at:", migrationsDir);
    process.exit(1);
}

const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));

let policiesList = [];

// Regular expression to parse PostgreSQL policy definitions
const policyRegex = /create\s+policy\s+\"([^\"]+)\"\s+on\s+public\.([a-zA-Z0-9_\-]+)\s+for\s+(all|select|insert|update|delete)\s+to\s+([a-zA-Z0-9_, ]+)?\s*(?:using\s*\(([^)]+)\))?\s*(?:with\s+check\s*\(([^)]+)\))?/gi;
const simplePolicyRegex = /create\s+policy\s+\"([^\"]+)\"\s+on\s+public\.([a-zA-Z0-9_\-]+)\s*(?:for\s+(all|select|insert|update|delete))?\s*(?:using\s*\((.+?)\))?\s*(?:with\s+check\s*\((.+?)\))?/gi;

files.forEach(file => {
    const content = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    
    // Clean SQL comments and newlines for easier regex matching
    const cleanedContent = content
        .replace(/--.*$/gm, '') // remove single-line comments
        .replace(/\/\*[\s\S]*?\*\//g, '') // remove multi-line comments
        .replace(/\s+/g, ' '); // normalize spaces
        
    let match;
    simplePolicyRegex.lastIndex = 0;
    while ((match = simplePolicyRegex.exec(cleanedContent)) !== null) {
        const [fullMatch, name, table, operationRaw, usingExpr, checkExpr] = match;
        const operation = (operationRaw || 'all').toLowerCase();
        
        policiesList.push({
            file,
            name,
            table: table.toLowerCase(),
            operation,
            using: usingExpr ? usingExpr.trim() : null,
            check: checkExpr ? checkExpr.trim() : null
        });
    }
});

console.log("==========================================");
console.log("🔍 SUPABASE RLS SECURITY POLICY AUDITOR 🔍");
console.log("==========================================");
console.log(`Parsed ${policiesList.length} RLS policies from migration files.\n`);

// Security rule checks
let warningCount = 0;
const auditedTables = new Set(policiesList.map(p => p.table));

auditedTables.forEach(table => {
    console.log(`Table [${table}]:`);
    const tablePolicies = policiesList.filter(p => p.table === table);
    
    tablePolicies.forEach(policy => {
        let isSecure = true;
        let reasons = [];
        
        // Rule 1: Check if policy is public write (very dangerous)
        if (policy.operation === 'all' || policy.operation === 'insert' || policy.operation === 'update' || policy.operation === 'delete') {
            const usesTrue = (policy.using === 'true') || (policy.check === 'true');
            if (usesTrue) {
                // Orders insertion is allowed to public, but other tables shouldn't
                if (table !== 'orders' && table !== 'store_registration_requests' && policy.operation !== 'select') {
                    isSecure = false;
                    reasons.push("🚨 CRITICAL: Allows public write access (USING/CHECK is 'true').");
                }
            }
        }
        
        // Rule 2: Check if policy has check condition for authenticated users
        if (policy.operation !== 'select' && table !== 'orders' && table !== 'store_registration_requests') {
            const hasAuthCheck = 
                (policy.using && (policy.using.includes('auth.role()') || policy.using.includes('auth.uid()'))) ||
                (policy.check && (policy.check.includes('auth.role()') || policy.check.includes('auth.uid()')));
                
            if (!hasAuthCheck && policy.name.toLowerCase().includes('authenticated')) {
                isSecure = false;
                reasons.push("⚠️ WARNING: Policy name mentions 'authenticated' but expression lacks auth.uid() or auth.role() check.");
            }
        }

        // Print policy details
        const status = isSecure ? "✅ SECURE" : "❌ VULNERABLE";
        if (!isSecure) warningCount++;
        
        console.log(`  - Policy: "${policy.name}" (${policy.operation.toUpperCase()}) -> ${status}`);
        if (policy.using) console.log(`    USING: ${policy.using}`);
        if (policy.check) console.log(`    CHECK: ${policy.check}`);
        reasons.forEach(r => console.log(`    * ${r}`));
    });
    console.log("");
});

console.log("==========================================");
console.log(`Audit Finished with ${warningCount} warnings/vulnerabilities.`);
console.log("==========================================\n");
