const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Manually parse .env file to get Supabase credentials
const rootDir = path.resolve(__dirname, '..');
const envPath = path.join(rootDir, '.env');

let supabaseUrl = '';
let supabaseKey = '';

if (fs.existsSync(envPath)) {
    const envContent = fs.readFileSync(envPath, 'utf8');
    const lines = envContent.split('\n');
    lines.forEach(line => {
        const parts = line.split('=');
        if (parts.length >= 2) {
            const key = parts[0].trim();
            const val = parts.slice(1).join('=').trim().replace(/['"]/g, '');
            if (key === 'VITE_SUPABASE_URL') {
                supabaseUrl = val;
            } else if (key === 'VITE_SUPABASE_PUBLISHABLE_KEY') {
                supabaseKey = val;
            }
        }
    });
}

if (!supabaseUrl || !supabaseKey) {
    console.error("❌ ERROR: Supabase credentials not found in .env file.");
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function runE2EFlowSimulation() {
    console.log("==========================================");
    console.log("🚀 CUSTOMER E2E FLOW SIMULATION STARTING 🚀");
    console.log("==========================================");
    
    let startTime, endTime;
    
    // Step 1: Load Categories
    console.log("\n[Step 1/4] Loading categories from database...");
    startTime = Date.now();
    const { data: categories, error: catError } = await supabase
        .from('categories')
        .select('*')
        .limit(10);
    endTime = Date.now();
    
    if (catError) {
        console.error("  ❌ FAILED: Error fetching categories:", catError.message);
    } else {
        console.log(`  ✅ SUCCESS: Loaded ${categories.length} categories in ${endTime - startTime}ms`);
    }

    // Step 2: Load Active Stores
    console.log("\n[Step 2/4] Loading active stores list...");
    startTime = Date.now();
    const { data: stores, error: storeError } = await supabase
        .from('stores')
        .select('*')
        .eq('is_active', true)
        .limit(5);
    endTime = Date.now();

    if (storeError) {
        console.error("  ❌ FAILED: Error fetching active stores:", storeError.message);
    } else {
        console.log(`  ✅ SUCCESS: Loaded ${stores.length} active stores in ${endTime - startTime}ms`);
    }

    // Step 3: Search Products (Guest View)
    console.log("\n[Step 3/4] Searching products...");
    startTime = Date.now();
    const { data: products, error: prodError } = await supabase
        .from('products')
        .select('*')
        .limit(12);
    endTime = Date.now();

    if (prodError) {
        console.error("  ❌ FAILED: Error fetching products:", prodError.message);
    } else {
        console.log(`  ✅ SUCCESS: Loaded ${products.length} products in ${endTime - startTime}ms`);
    }

    // Step 4: Simulate Guest Order Submission (Check RLS Insert Policy via RPC)
    console.log("\n[Step 4/4] Simulating checkout (Calling 'create_order' RPC)...");
    
    const randomSuffix = Math.floor(Math.random() * 10000);
    const storeId = stores && stores.length > 0 ? stores[0].id : null;
    const productId = products && products.length > 0 ? products[0].id : null;

    if (!storeId || !productId) {
        console.error("  ❌ FAILED: Cannot simulate order without a valid store or product.");
        return;
    }

    const orderPayload = {
        store_id: storeId,
        store_ids: [storeId],
        user_id: null,
        wilaya_id: 1, // Algiers
        full_name: `Stress Test User ${randomSuffix}`,
        phone: `0555${randomSuffix.toString().padStart(6, '0')}`,
        address: "شارع اختبار الضغط، الجزائر",
        delivery_option: "home",
        total_price: 3500.00,
        delivery_price: 400.00
    };

    const itemsPayload = [{
        product_id: productId,
        quantity: 1,
        price: 3500.00,
        selected_color: null,
        selected_size: null,
        store_id: storeId
    }];

    startTime = Date.now();
    const { data: orderResponse, error: orderError } = await supabase.rpc('create_order', {
        order_payload: orderPayload,
        items_payload: itemsPayload
    });
    endTime = Date.now();

    if (orderError) {
        console.error("  ❌ FAILED: create_order RPC invocation blocked or failed:", orderError.message);
    } else {
        console.log(`  ✅ SUCCESS: RPC create_order completed successfully!`);
        console.log(`     - Response   :`, orderResponse);
        console.log(`     - Latency    : ${endTime - startTime}ms`);
        console.log(`     - RLS Bypass via RPC verified successfully!`);
    }
    
    console.log("\n==========================================");
    console.log("🎉 SIMULATION RUN COMPLETED SUCCESSFULY 🎉");
    console.log("==========================================\n");
}

runE2EFlowSimulation();
