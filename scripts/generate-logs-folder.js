const fs = require('fs');
const path = require('path');

const logsDir = path.join(__dirname, '../logs');
const errorFilePath = path.join(logsDir, 'error.log');

if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

fs.writeFile(errorFilePath, 'INITIAL ERROR LOG:\n', (err) => {
  if (err) {
    return console.error(`An error occurred: ${err.message}`);
  }
  console.log('The file error.log has been created!');
});
