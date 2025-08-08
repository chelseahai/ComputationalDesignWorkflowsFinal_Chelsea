# Mapbox Setup Instructions

## Getting Your Mapbox Access Token

1. **Sign up for Mapbox**:
   - Go to [https://www.mapbox.com/](https://www.mapbox.com/)
   - Create a free account

2. **Get your access token**:
   - After signing in, go to your account dashboard
   - Navigate to "Access tokens" in the left sidebar
   - Copy your default public token (starts with `pk.`)

3. **Update the code**:
   - Open `script.js`
   - Find line with: `mapboxgl.accessToken = 'pk.eyJ1IjoiZXhhbXBsZSIsImEiOiJjbGV4YW1wbGUifQ.example';`
   - Replace the example token with your actual token

## Example:
```javascript
mapboxgl.accessToken = 'pk.eyJ1IjoieW91cnVzZXJuYW1lIiwiYSI6ImNsZXhhbXBsZSJ9.your_actual_token_here';
```

## Features of the Geospatial Visualization

- **Urban Design Analysis**: Shows parks, cultural institutions, and transportation hubs in NYC
- **Interactive Layers**: Toggle different types of locations on/off
- **Data-Driven Sizing**: Circle sizes represent area (parks), visitors (culture), or daily riders (transport)
- **Color Coding**:
  - Green: Parks and public spaces
  - Orange: Cultural institutions and museums
  - Blue: Transportation hubs and stations
- **Interactive Popups**: Click on any point for detailed information
- **Navigation Controls**: Zoom, pan, and fullscreen options

## Data Sources

The visualization uses a custom GeoJSON file (`nyc_urban_data.geojson`) containing:
- 15 locations across New York City
- Real data for parks (area in acres), cultural institutions (annual visitors), and transportation hubs (daily riders)
- Meaningful descriptions and context for each location

## File Location

Place your GeoJSON file in the same directory as your HTML file:
```
your-project/
├── index.html
├── script.js
├── styles.css
├── nyc_urban_data.geojson
└── MAPBOX_SETUP.md
```
