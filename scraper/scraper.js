const { CarRentalScraper, websiteConfigs } = require('./car-scraper');
const fs = require('fs').promises;
const path = require('path');

// Configuration
const CONFIG = {
  targetUrl: process.env.TARGET_URL || 'https://leftlanecarrental.com/cars-for-rent/',
  outputDir: path.join(__dirname, 'output'),
  imagesDir: path.join(__dirname, '../src/assets/all-images/cars-img'),
  dataFile: path.join(__dirname, '../src/assets/data/scrapedCarData.js'),
  headless: process.argv.includes('--headless')
};

async function main() {
  const scraper = new CarRentalScraper();
  
  try {
    console.log('🚗 Starting Car Rental Data Scraping...\n');
    
    // Initialize scraper
    await scraper.initialize();
    
    // Determine website configuration
    const hostname = new URL(CONFIG.targetUrl).hostname;
    const config = websiteConfigs[hostname] || websiteConfigs.generic;
    
    console.log(`🎯 Target: ${CONFIG.targetUrl}`);
    console.log(`📊 Using config: ${hostname in websiteConfigs ? hostname : 'generic'}\n`);
    
    // Scrape data
    const cars = await scraper.scrapeWebsite(CONFIG.targetUrl, config.selectors);
    
    // Create output directories
    await fs.mkdir(CONFIG.outputDir, { recursive: true });
    
    // Save raw data
    await fs.writeFile(
      path.join(CONFIG.outputDir, 'raw-cars.json'),
      JSON.stringify(cars, null, 2)
    );
    
    // Download images
    const carsWithImages = await scraper.downloadImages(cars, CONFIG.imagesDir);
    
    // Generate React-compatible data file
    await scraper.generateReactDataFile(carsWithImages, CONFIG.dataFile);
    
    // Save processed data
    await fs.writeFile(
      path.join(CONFIG.outputDir, 'processed-cars.json'),
      JSON.stringify(carsWithImages, null, 2)
    );
    
    console.log('\n✅ Scraping completed successfully!');
    console.log(`📁 Raw data saved: ${path.join(CONFIG.outputDir, 'raw-cars.json')}`);
    console.log(`📁 Processed data saved: ${path.join(CONFIG.outputDir, 'processed-cars.json')}`);
    console.log(`🖼️ Images saved to: ${CONFIG.imagesDir}`);
    console.log(`📊 React data file: ${CONFIG.dataFile}`);
    
  } catch (error) {
    console.error('❌ Scraping failed:', error);
  } finally {
    await scraper.close();
  }
}

// Handle command line arguments
if (require.main === module) {
  main();
}

module.exports = { main, CONFIG };
