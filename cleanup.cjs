const fs = require('fs');
const path = require('path');

const filesToDelete = [
  'src/pages/CustomerMapPage.tsx'
];

filesToDelete.forEach(file => {
  const filePath = path.join(__dirname, file);
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`✅ Deleted: ${file}`);
    }
  } catch (err) {
    console.error(`❌ Error deleting ${file}:`, err.message);
  }
});
