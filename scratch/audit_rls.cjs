const fs = require('fs');
const path = require('path');

// Set root path to current workspace directory
const rootDir = path.resolve(__dirname, '..');
const migrationsDir = path.join(rootDir, 'supabase', 'migrations');

if (!fs.existsSync(migrationsDir)) {
    console.error("Migrations directory not found at:", migrationsDir);
    process.exit(1);
}

const files = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.sql'));

let tables = new Set();
let rlsEnabled = new Set();
let policies = {};

// Regular expressions to detect statements in PostgreSQL format
const createTableRegex = /create\s+table\s+(?:if\s+not\s+exists\s+)?(?:public\.)?([a-zA-Z0-9_\"\-]+)/gi;
const enableRlsRegex = /alter\s+table\s+(?:only\s+)?(?:public\.)?([a-zA-Z0-9_\"\-]+)\s+enable\s+row\s+level\s+security/gi;
const createPolicyRegex = /create\s+policy\s+([a-zA-Z0-9_\"\-]+)\s+on\s+(?:public\.)?([a-zA-Z0-9_\"\-]+)/gi;

files.sort().forEach(file => {
    const content = fs.readFileSync(path.join(migrationsDir, file), 'utf8');
    
    // Find created tables
    let match;
    createTableRegex.lastIndex = 0;
    while ((match = createTableRegex.exec(content)) !== null) {
        const tableName = match[1].replace(/\"/g, '').toLowerCase();
        // Ignore system or standard extensions tables
        if (tableName !== 'spatial_ref_sys') {
            tables.add(tableName);
        }
    }
    
    // Find RLS enabled tables
    enableRlsRegex.lastIndex = 0;
    while ((match = enableRlsRegex.exec(content)) !== null) {
        const tableName = match[1].replace(/\"/g, '').toLowerCase();
        rlsEnabled.add(tableName);
    }
    
    // Find policies
    createPolicyRegex.lastIndex = 0;
    while ((match = createPolicyRegex.exec(content)) !== null) {
        const policyName = match[1].replace(/\"/g, '').toLowerCase();
        const tableName = match[2].replace(/\"/g, '').toLowerCase();
        if (!policies[tableName]) {
            policies[tableName] = [];
        }
        policies[tableName].push(policyName);
    }
});

console.log("==========================================");
console.log("🛡️ SUPABASE DATABASE RLS SECURITY AUDIT 🛡️");
console.log("==========================================");
console.log(`Total Tables Detected in Migrations : ${tables.size}`);
console.log(`Tables with RLS Explicitly Enabled  : ${rlsEnabled.size}`);

let missingRls = [];
for (let table of tables) {
    if (!rlsEnabled.has(table)) {
        missingRls.push(table);
    }
}

if (missingRls.length > 0) {
    console.log("\n⚠️ WARNING: Tables missing explicit Row-Level Security (RLS) enablement:");
    missingRls.forEach(t => {
        console.log(`  - ❌ [${t}] - Potential Security Gap!`);
    });
    console.log("\n* Note: Some tables (like junctions or system configurations) might be intentionally open or handled differently, but business tables must have RLS.");
} else {
    console.log("\n✅ SUCCESS: All detected tables have Row-Level Security (RLS) enabled.");
}

console.log("\n==========================================");
console.log("📊 POLICIES COUNT BY TABLE");
console.log("==========================================");
const sortedTables = Array.from(tables).sort();
sortedTables.forEach(table => {
    const count = policies[table] ? policies[table].length : 0;
    const rlsStatus = rlsEnabled.has(table) ? "RLS: ON" : "RLS: OFF";
    console.log(`  - [${table.padEnd(25)}] : ${count.toString().padStart(2)} policies (${rlsStatus})`);
});
console.log("==========================================\n");
