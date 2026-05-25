const fs = require('fs');
const path = require('path');

const targetPath = path.resolve(__dirname, '..', 'src', 'config', 'stress_test_data.json');

if (fs.existsSync(targetPath)) {
    fs.unlinkSync(targetPath);
    console.log("✅ Stress test mock data JSON removed successfully.");
} else {
    console.log("ℹ️ No stress test mock data JSON found to remove.");
}
