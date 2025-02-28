

async function createCNAME() {
  const fs = require('fs');
const path = require('path');

const cnameContent = 'stremblay.cc';
const cnamePath = path.join(__dirname, 'dist', 'CNAME');

try {
  fs.writeFileSync(cnamePath, cnameContent, 'utf8');
  console.log('CNAME file created successfully!');
} catch (error) {
  console.error('Error creating CNAME file:', error);
}

}

createCNAME();
