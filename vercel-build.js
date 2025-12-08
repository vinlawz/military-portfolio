const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Create output directory if it doesn't exist
const outputDir = path.join(process.cwd(), 'staticfiles');
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir, { recursive: true });
}

// Function to copy files recursively
function copyRecursiveSync(src, dest) {
  const exists = fs.existsSync(src);
  if (!exists) {
    console.log(`Source does not exist: ${src}`);
    return;
  }
  
  const stats = fs.statSync(src);
  const isDirectory = stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(childItemName => {
      if (childItemName !== 'node_modules') {  // Skip node_modules
        copyRecursiveSync(
          path.join(src, childItemName),
          path.join(dest, childItemName)
        );
      }
    });
  } else {
    fs.mkdirSync(path.dirname(dest), { recursive: true });
    fs.copyFileSync(src, dest);
    console.log(`Copied: ${src} → ${dest}`);
  }
}

// Function to ensure directory exists
function ensureDirectoryExists(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

try {
  console.log('Starting build process...');
  
  // 1. Run Tailwind build
  console.log('\n1. Running Tailwind CSS build...');
  execSync('npx tailwindcss -i static/tailwind/input.css -o static/css/output.css --config=./theme/tailwind.config.js', { 
    stdio: 'inherit' 
  });
  
  // 2. Copy static files
  console.log('\n2. Copying static files...');
  if (fs.existsSync('static')) {
    copyRecursiveSync('static', path.join(outputDir, 'static'));
  } else {
    console.log('No static directory found');
  }
  
  // 3. Copy HTML template to root as index.html
  console.log('\n3. Copying HTML template...');
  const htmlSource = 'main/templates/main/home.html';
  if (fs.existsSync(htmlSource)) {
    const destFile = path.join(outputDir, 'index.html');
    ensureDirectoryExists(path.dirname(destFile));
    fs.copyFileSync(htmlSource, destFile);
    console.log(`Copied HTML to: ${destFile}`);
    
    // Also copy to the original location for reference
    const originalDest = path.join(outputDir, htmlSource);
    ensureDirectoryExists(path.dirname(originalDest));
    fs.copyFileSync(htmlSource, originalDest);
  } else {
    console.error(`HTML source not found: ${htmlSource}`);
    throw new Error('HTML template not found');
  }
  
  // 4. Create a simple _redirects file for SPA routing
  const redirectsPath = path.join(outputDir, '_redirects');
  fs.writeFileSync(redirectsPath, '/* /index.html 200');
  
  console.log('\n✅ Build completed successfully!');
  console.log(`Output directory: ${outputDir}`);
  
} catch (error) {
  console.error('\n❌ Build failed:');
  console.error(error);
  process.exit(1);
}
