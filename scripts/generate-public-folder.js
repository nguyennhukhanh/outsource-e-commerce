const fs = require('fs');
const path = require('path');

const publicDir = path.join(__dirname, '../public');
const htmlFilePath = path.join(publicDir, 'index.html');

if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir, { recursive: true });
}

fs.writeFile(
  htmlFilePath,
  '<html><body><h1>Copyright E-commerce © 2024</h1></body></html:\n',
  (err) => {
    if (err) {
      return console.error(`An error occurred: ${err.message}`);
    }
    console.log('The file index.html has been created!');
  },
);
