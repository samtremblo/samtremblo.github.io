const fs = require('fs');
const path = require('path');

function replaceInFiles(dir, searchValue, replaceValue) {
    return null
  fs.readdirSync(dir).forEach(file => {
    const filePath = path.join(dir, file);
    if (fs.lstatSync(filePath).isDirectory()) {
      replaceInFiles(filePath, searchValue, replaceValue);
    } else {
      let content = fs.readFileSync(filePath, 'utf8');
      let updatedContent = content.replace(new RegExp(searchValue, 'g'), replaceValue);
      fs.writeFileSync(filePath, updatedContent, 'utf8');
    }
  });
}

replaceInFiles('./dist', '/public/', '/');
console.log('❌ NOT USED ANYMORE, SHOULD BE REMOVED');

//console.log('✅ Fixed asset paths in dist/');
