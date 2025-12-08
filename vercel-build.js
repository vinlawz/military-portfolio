const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const config = {
  outputDir: path.join(process.cwd(), 'public'),
  staticDirs: ['static', 'media', 'images', 'css', 'js', 'fonts'],
  htmlFiles: ['main/templates/main/home.html'],
  copyDirs: ['theme'],
  copyFiles: [
    'favicon.ico',
    'robots.txt',
    'site.webmanifest'
  ]
};

// Create output directory if it doesn't exist
if (!fs.existsSync(config.outputDir)) {
  console.log(`Creating output directory: ${config.outputDir}`);
  fs.mkdirSync(config.outputDir, { recursive: true });
}

// Utility functions
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    console.log(`Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  }
};

const copyFileSync = (source, target) => {
  ensureDir(path.dirname(target));
  console.log(`Copying ${source} → ${target}`);
  fs.copyFileSync(source, target);
};

const copyRecursiveSync = (src, dest) => {
  if (!fs.existsSync(src)) {
    console.warn(`Source does not exist: ${src}`);
    return;
  }
  
  const stats = fs.statSync(src);
  if (stats.isDirectory()) {
    if (!fs.existsSync(dest)) {
      console.log(`Creating directory: ${dest}`);
      fs.mkdirSync(dest, { recursive: true });
    }
    fs.readdirSync(src).forEach(item => {
      if (item !== 'node_modules' && !item.startsWith('.')) {
        copyRecursiveSync(path.join(src, item), path.join(dest, item));
      }
    });
  } else {
    copyFileSync(src, dest);
  }
};

// Main build process
try {
  console.log('🚀 Starting build process...');
  console.log(`Working directory: ${process.cwd()}`);
  console.log(`Output directory: ${config.outputDir}`);
  
  // 1. Build Tailwind CSS
  console.log('\n🔨 Building Tailwind CSS...');
  execSync('npx tailwindcss -i static/tailwind/input.css -o static/css/output.css --config=./theme/tailwind.config.js', {
    stdio: 'inherit'
  });

  // 2. Copy static directories
  console.log('\n📂 Copying static files...');
  config.staticDirs.forEach(dir => {
    const src = path.join(process.cwd(), dir);
    const dest = path.join(config.outputDir, dir);
    console.log(`Processing directory: ${dir}`);
    console.log(`  Source: ${src}`);
    console.log(`  Destination: ${dest}`);
    if (fs.existsSync(src)) {
      console.log(`  → Copying ${dir}/`);
      copyRecursiveSync(src, dest);
    } else {
      console.warn(`  → Source directory does not exist: ${src}`);
    }
  });

  // 3. Copy individual files
  console.log('\n📄 Copying individual files...');
  config.copyFiles.forEach(file => {
    const src = path.join(process.cwd(), file);
    const dest = path.join(config.outputDir, file);
    if (fs.existsSync(src)) {
      console.log(`  → Copying ${file}`);
      copyFileSync(src, dest);
    } else {
      console.warn(`  → File not found: ${file}`);
    }
  });

  // 4. Copy HTML files
  console.log('\n📄 Processing HTML files...');
  config.htmlFiles.forEach(htmlFile => {
    const source = path.join(process.cwd(), htmlFile);
    if (fs.existsSync(source)) {
      // Copy to root as index.html
      const destFile = path.join(config.outputDir, 'index.html');
      console.log(`  → Processing ${htmlFile} → /index.html`);
      console.log(`  Source: ${source}`);
      console.log(`  Destination: ${destFile}`);
      
      // Read the HTML file
      let htmlContent = fs.readFileSync(source, 'utf8');
      
      // Fix any relative paths in the HTML
      htmlContent = htmlContent.replace(/(href|src)="([^"]*\.(css|js|jpg|jpeg|png|gif|svg|ico))"(?!.*http)/g, (match, p1, p2) => {
        // If the path starts with /static/, keep it as is
        if (p2.startsWith('/static/')) {
          return `${p1}="${p2}"`;
        }
        // Otherwise, make sure it points to the correct static path
        return `${p1}="/static/${p2}"`;
      });
      
      // Write the modified HTML to the destination
      ensureDir(path.dirname(destFile));
      fs.writeFileSync(destFile, htmlContent, 'utf8');
      console.log(`  → Successfully processed and copied HTML`);
    } else {
      console.error(`  → Error: HTML file not found at ${source}`);
    }
  });

  // 5. Copy additional directories
  console.log('\n📦 Copying additional directories...');
  config.copyDirs.forEach(dir => {
    const src = path.join(process.cwd(), dir);
    const dest = path.join(config.outputDir, dir);
    console.log(`Processing directory: ${dir}`);
    console.log(`  Source: ${src}`);
    console.log(`  Destination: ${dest}`);
    if (fs.existsSync(src)) {
      console.log(`  → Copying ${dir}/`);
      copyRecursiveSync(src, dest);
    } else {
      console.warn(`  → Source directory does not exist: ${src}`);
    }
  });

  // 6. Create _redirects for SPA
  const redirectsPath = path.join(config.outputDir, '_redirects');
  console.log(`\n📝 Creating _redirects at: ${redirectsPath}`);
  fs.writeFileSync(redirectsPath, '/* /index.html 200');
  console.log('✅ Created _redirects for SPA routing');

  // 7. Verify the output directory
  console.log('\n🔍 Verifying output directory...');
  if (!fs.existsSync(config.outputDir)) {
    throw new Error(`Output directory not found: ${config.outputDir}`);
  }
  
  const files = fs.readdirSync(config.outputDir);
  console.log(`📂 Contents of ${config.outputDir}:`);
  console.log(files.join('\n'));

  // 8. List all files in static directory for debugging
  console.log('\n🔍 Listing static files:');
  const listFiles = (dir, indent = '') => {
    const items = fs.readdirSync(dir);
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      const stats = fs.statSync(fullPath);
      console.log(`${indent}${item}${stats.isDirectory() ? '/' : ''}`);
      if (stats.isDirectory()) {
        listFiles(fullPath, indent + '  ');
      }
    });
  };
  
  console.log('\n📂 Static directory structure:');
  listFiles(path.join(config.outputDir, 'static'));

  console.log('\n✨ Build completed successfully!');
  console.log(`📁 Output directory: ${config.outputDir}`);

} catch (error) {
  console.error('\n❌ Build failed:');
  console.error(error);
  process.exit(1);
}
