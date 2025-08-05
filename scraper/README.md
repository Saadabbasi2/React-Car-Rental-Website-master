# 🚗 Car Rental Data Scraper

A comprehensive web scraping solution for extracting car rental data from third-party websites and integrating it into your React car rental website.

## 🚀 Quick Start

### 1. Install Dependencies
```bash
cd scraper
npm install
```

### 2. Configure Target Website
Edit `scraper.js` and update the `CONFIG.targetUrl` with your target website URL.

### 3. Run the Scraper
```bash
# Normal mode (opens browser window)
npm run scrape

# Headless mode (runs in background)
npm run scrape:headless
```

## 📊 Data Format

The scraper generates data in the exact format your React app expects:

```javascript
{
  id: 1,
  brand: "Tesla",
  rating: 112,
  carName: "Tesla Malibu",
  imgUrl: "img01",
  model: "Model 3",
  price: 50,
  speed: "20kmpl",
  gps: "GPS Navigation",
  seatType: "Heated seats",
  automatic: "Automatic",
  description: "Premium rental car..."
}
```

## 🎯 Supported Websites

The scraper is pre-configured for:
- **leftlanecarrental.com** - Ready to use
- **Generic car rental sites** - Adaptable to most websites

## 🔧 Customization

### Adding New Website
1. Add configuration in `websiteConfigs` object in `car-scraper.js`
2. Define CSS selectors for your target website
3. Update the scraping logic if needed

### Modifying Data Fields
Edit the `generateReactDataFile` method in `car-scraper.js` to customize the output format.

## 📁 Output Structure

```
scraper/
├── output/
│   ├── raw-cars.json          # Raw scraped data
│   └── processed-cars.json   # Cleaned & processed data
├── src/assets/all-images/cars-img/
│   ├── car-1.jpg
│   ├── car-2.jpg
│   └── ...
└── src/assets/data/
    └── scrapedCarData.js     # React-ready data file
```

## 🛠️ Advanced Usage

### Custom Selectors
For websites not in the pre-configured list, you can use custom selectors:

```javascript
const customSelectors = {
  carContainer: '.car-card',
  brand: '.make',
  carName: '.model',
  price: '.daily-rate',
  // ... other selectors
};

const cars = await scraper.scrapeWebsite(url, customSelectors);
```

### Image Handling
- Images are automatically downloaded and saved to `src/assets/all-images/cars-img/`
- URLs are converted to local imports for React compatibility
- Default fallback images are provided for missing images

## 🚨 Important Notes

- **Respect robots.txt** and website terms of service
- **Rate limiting** is implemented to avoid overwhelming servers
- **Error handling** for network issues and missing elements
- **Image optimization** for web use

## 🔍 Troubleshooting

### Common Issues
1. **"Element not found"**: Update CSS selectors in website configuration
2. **"Network timeout"**: Increase timeout values or check website availability
3. **"Image download failed"**: Verify image URLs are accessible

### Debug Mode
Enable debug logging by setting:
```javascript
const CONFIG = {
  debug: true,
  // ... other config
};
```

## 📞 Support

For issues or questions:
1. Check the troubleshooting section
2. Verify website accessibility and structure
3. Update selectors if website layout changes
