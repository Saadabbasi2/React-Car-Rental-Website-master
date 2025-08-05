const puppeteer = require('puppeteer');
const fs = require('fs').promises;
const path = require('path');
const https = require('https');
const http = require('http');

class CarRentalScraper {
  constructor() {
    this.browser = null;
    this.page = null;
    this.scrapedData = [];
  }

  async initialize() {
    this.browser = await puppeteer.launch({ 
      headless: false,
      defaultViewport: { width: 1920, height: 1080 }
    });
    this.page = await this.browser.newPage();
    
    // Set user agent to avoid detection
    await this.page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
  }

  async scrapeWebsite(url, selectors) {
    try {
      console.log(`🚀 Navigating to: ${url}`);
      await this.page.goto(url, { waitUntil: 'networkidle2', timeout: 30000 });

      // Save full page HTML for inspection
      const pageContent = await this.page.content();
      const fs = require('fs').promises;
      await fs.mkdir('output', { recursive: true });
      await fs.writeFile('output/page-source.html', pageContent);

      // Wait for car listings to load
      try {
        await this.page.waitForSelector(selectors.carContainer, { timeout: 30000 });
      } catch (error) {
        console.warn(`⚠️ Primary selector '${selectors.carContainer}' not found, trying fallback selector '.container'`);
        await this.page.waitForSelector('.container', { timeout: 30000 });
      }
      
      console.log('📋 Scraping car data...');
      const cars = await this.page.evaluate((selectors) => {
        const carElements = document.querySelectorAll(selectors.carContainer);
        return Array.from(carElements).map((car, index) => {
          const priceText = car.querySelector(selectors.price)?.textContent || '';
          const priceMatch = priceText.match(/AED-?(\d+)/i);
          const priceValue = priceMatch ? parseFloat(priceMatch[1]) : 0;
          return {
            id: index + 1,
            brand: car.querySelector(selectors.brand)?.textContent?.trim() || 'Unknown',
            carName: car.querySelector(selectors.carName)?.textContent?.trim() || 'Unknown Model',
            price: priceValue,
            model: '2024',
            speed: '15kmpl',
            gps: 'GPS Navigation',
            seatType: 'Standard Seats',
            automatic: 'Manual',
            imageUrl: car.querySelector(selectors.image)?.src || '',
            description: 'Premium rental car with excellent features and comfort.'
          };
        });
      }, selectors);

      this.scrapedData = cars;
      console.log(`✅ Successfully scraped ${cars.length} cars`);
      return cars;

    } catch (error) {
      console.error('❌ Error scraping:', error);
      throw error;
    }
  }

  async downloadImages(cars, downloadPath) {
    console.log('📸 Downloading images...');
    
    // Create download directory
    await fs.mkdir(downloadPath, { recursive: true });
    
    const downloadPromises = cars.map(async (car, index) => {
      if (car.imageUrl) {
        try {
          const extension = path.extname(new URL(car.imageUrl).pathname) || '.jpg';
          const filename = `car-${index + 1}${extension}`;
          const filepath = path.join(downloadPath, filename);
          
          await this.downloadImage(car.imageUrl, filepath);
          return { ...car, localImage: filename };
        } catch (error) {
          console.warn(`⚠️ Failed to download image for ${car.carName}:`, error.message);
          return { ...car, localImage: null };
        }
      }
      return car;
    });

    return Promise.all(downloadPromises);
  }

  async downloadImage(url, filepath) {
    return new Promise((resolve, reject) => {
      const client = url.startsWith('https') ? https : http;
      const file = require('fs').createWriteStream(filepath);
      
      client.get(url, (response) => {
        if (response.statusCode === 200) {
          response.pipe(file);
          file.on('finish', () => {
            file.close();
            resolve();
          });
        } else {
          reject(new Error(`Failed to download image: ${response.statusCode}`));
        }
      }).on('error', reject);
    });
  }

  async generateReactDataFile(cars, outputPath) {
    console.log('📝 Generating React data file...');
    
    const reactData = cars.map(car => ({
      id: car.id,
      brand: car.brand,
      rating: Math.floor(Math.random() * 100) + 50, // Random rating 50-150
      carName: car.carName,
      imgUrl: car.localImage ? `import img${car.id} from "../all-images/cars-img/${car.localImage}"` : `import img${car.id} from "../all-images/cars-img/default-car.jpg"`,
      model: car.model,
      price: car.price,
      speed: car.speed,
      gps: car.gps,
      seatType: car.seatType,
      automatic: car.automatic,
      description: car.description || 'Premium rental car with excellent features and comfort.'
    }));

    // Generate import statements
    const imports = cars.filter(car => car.localImage)
      .map(car => `import img${car.id.toString().padStart(2, '0')} from "../all-images/cars-img/${car.localImage}";`)
      .join('\n');

    // Generate the complete data file
    const dataFile = `${imports}

const carData = ${JSON.stringify(reactData.map(car => ({
  ...car,
  imgUrl: car.imgUrl.includes('import') ? 
    `img${car.id.toString().padStart(2, '0')}` : car.imgUrl
})), null, 2)};

export default carData;`;

    await fs.writeFile(outputPath, dataFile);
    console.log(`✅ React data file created: ${outputPath}`);
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }
}

// Configuration for different websites
const websiteConfigs = {
  'leftlanecarrental.com': {
    url: 'https://leftlanecarrental.com/cars-for-rent/',
    selectors: {
      carContainer: '.elementor-column.elementor-col-33.elementor-top-column',
      brand: '.qodef-m-subtitle',
      carName: '.qodef-m-title',
      price: '.elementor-button-text',
      model: '',
      speed: '',
      gps: '',
      seatType: '',
      transmission: '',
      image: 'a > img',
      description: ''
    }
  },
  'generic': {
    selectors: {
      carContainer: '.car-card, .vehicle-card, .rental-car',
      brand: '.brand, .make',
      carName: '.model, .car-name, .vehicle-name',
      price: '.price, .daily-rate, [class*="price"]',
      model: '.year, .model-year',
      speed: '.mpg, .fuel-economy',
      gps: '.features, .amenities',
      seatType: '.seats, .seat-type',
      transmission: '.transmission, .gear-type',
      image: 'img, .car-image img',
      description: '.description, .car-description, .summary'
    }
  }
};

module.exports = { CarRentalScraper, websiteConfigs };
