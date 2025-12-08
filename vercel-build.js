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
  const stats = exists && fs.statSync(src);
  const isDirectory = exists && stats.isDirectory();

  if (isDirectory) {
    if (!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }
    fs.readdirSync(src).forEach(childItemName => {
      copyRecursiveSync(
        path.join(src, childItemName),
        path.join(dest, childItemName)
      );
    });
  } else {
    fs.copyFileSync(src, dest);
  }
}

// Run Tailwind build
try {
  console.log('Running Tailwind CSS build...');
  execSync('npx tailwindcss -i static/tailwind/input.css -o static/css/output.css --config=./theme/tailwind.config.js', { stdio: 'inherit' });
  
  // Copy static files
  console.log('Copying static files...');
  if (fs.existsSync('static')) {
    copyRecursiveSync('static', path.join(outputDir, 'static'));
  }
  
  // Copy HTML template
  console.log('Copying HTML template...');
  const htmlDir = path.join(outputDir, 'main/templates/main');
  if (!fs.existsSync(htmlDir)) {
    fs.mkdirSync(htmlDir, { recursive: true });
  }
  
  if (fs.existsSync('main/templates/main/home.html')) {
    fs.copyFileSync(
      'main/templates/main/home.html',
      path.join(htmlDir, 'home.html')
    );
  }
  
  console.log('Build completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('Build failed:', error);
  process.exit(1);
}
