

async function setupGitHubPages() {
  const fs = require('fs');
  const path = require('path');

  // Create CNAME file
  const cnameContent = 'www.stremblay.cc';
  const cnamePath = path.join(__dirname, 'dist', 'CNAME');

  try {
    fs.writeFileSync(cnamePath, cnameContent, 'utf8');
    console.log('CNAME file created successfully!');
  } catch (error) {
    console.error('Error creating CNAME file:', error);
  }

  // Copy 404.html for client-side routing
  const source404 = path.join(__dirname, '404.html');
  const dest404 = path.join(__dirname, 'dist', '404.html');

  try {
    if (fs.existsSync(source404)) {
      fs.copyFileSync(source404, dest404);
      console.log('404.html copied successfully!');
    }
  } catch (error) {
    console.error('Error copying 404.html:', error);
  }

  // Copy .nojekyll file
  const sourceNojekyll = path.join(__dirname, '.nojekyll');
  const destNojekyll = path.join(__dirname, 'dist', '.nojekyll');

  try {
    if (fs.existsSync(sourceNojekyll)) {
      fs.copyFileSync(sourceNojekyll, destNojekyll);
      console.log('.nojekyll copied successfully!');
    }
  } catch (error) {
    console.error('Error copying .nojekyll:', error);
  }
}

setupGitHubPages();
