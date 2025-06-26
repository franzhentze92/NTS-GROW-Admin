# Web Analytics Setup Guide

This guide will help you set up the comprehensive web analytics system for the GROW Admin Platform.

## 🚀 Overview

The analytics system tracks:
- **Page views** with detailed user information
- **User sessions** with duration and behavior metrics
- **Geographic data** showing where users are located
- **Device and browser** information
- **Traffic sources** (organic search, direct, social, etc.)
- **Custom events** for specific user interactions
- **Performance metrics** (page load times, etc.)

## 📋 Prerequisites

- Supabase project already set up
- Existing authentication system
- Node.js and npm installed

## 🔧 Setup Steps

### 1. Run the Analytics SQL Setup

Execute the `supabase_analytics_setup.sql` file in your Supabase SQL editor:

```sql
-- Copy and paste the entire contents of supabase_analytics_setup.sql
-- This creates all necessary tables, indexes, and functions
```

### 2. Install Required Dependencies

```bash
npm install leaflet @types/leaflet date-fns
```

### 3. Verify Setup

After running the SQL, you should see these tables in your Supabase dashboard:
- `page_views`
- `user_sessions`
- `user_events`
- `geographic_data`
- `performance_metrics`

## 🎯 Features Implemented

### Real-Time Analytics Dashboard
- **KPI Cards**: Total sessions, avg duration, pages per session, bounce rate
- **Geographic Map**: Interactive map showing user locations with clustering
- **Traffic Sources**: Pie chart of where visitors come from
- **Device Breakdown**: Bar charts for devices and browsers
- **Top Pages**: Most visited pages with detailed metrics
- **Time Series**: Daily user activity over time

### Automatic Tracking
- **Page Views**: Automatically tracked on every page load
- **User Sessions**: Session management with unique IDs
- **Device Detection**: Automatic browser and OS detection
- **Geographic Data**: IP-based location tracking (requires additional setup)

### Advanced Features
- **Date Range Filtering**: Filter data by custom date ranges
- **Real-Time Updates**: Data refreshes automatically
- **Export Functionality**: Export analytics data (to be implemented)
- **Error Handling**: Graceful error handling and retry mechanisms

## 🔍 How It Works

### Data Flow
1. **Page Load** → Analytics context tracks page view
2. **User Interaction** → Custom events can be tracked
3. **Data Storage** → All data stored in Supabase
4. **Dashboard** → Real-time visualization of analytics data

### Tracking Implementation
```typescript
// Automatic page view tracking
useEffect(() => {
  trackPageView(window.location.pathname, document.title);
}, []);

// Custom event tracking
trackEvent('click', 'export_button', { page: 'analytics' });
```

## 🗺️ Geographic Mapping

The system includes an interactive map showing:
- **User Locations**: Where your visitors are located
- **Interactive Markers**: Click for detailed information
- **Clustering**: Groups nearby markers for better visualization
- **Real-time Updates**: Map updates with new data

## 📊 Sample Data

The setup includes sample data for testing:
- 5 sample page views from different Australian cities
- 4 user sessions with various metrics
- Geographic data for Sydney, Melbourne, Brisbane, and Perth

## 🔧 Configuration Options

### Date Range Presets
- Last 7 days
- Last 30 days (default)
- Last 90 days
- Custom range

### Filtering Options
- Page categories
- Device types
- Traffic sources
- Geographic regions

## 🚀 Next Steps

### 1. Enhanced Geographic Data
To get real geographic data, you can integrate with:
- **IP Geolocation API** (free tier available)
- **MaxMind GeoIP2** database
- **CloudFlare IP Geolocation**

### 2. Advanced Tracking
- **Scroll depth tracking**
- **Time on page tracking**
- **Click heatmaps**
- **Form abandonment tracking**

### 3. Performance Monitoring
- **Page load time tracking**
- **Core Web Vitals**
- **Error tracking**

### 4. Export Features
- **CSV export**
- **PDF reports**
- **Scheduled reports**

## 🛠️ Troubleshooting

### Common Issues

1. **No data showing**
   - Check if SQL setup was completed
   - Verify Supabase connection
   - Check browser console for errors

2. **Map not loading**
   - Ensure Leaflet CSS is loaded
   - Check internet connection for map tiles
   - Verify geographic data has coordinates

3. **Performance issues**
   - Check database indexes
   - Monitor query performance
   - Consider data archiving for old records

### Debug Mode
Enable debug logging by adding to your environment:
```bash
REACT_APP_ANALYTICS_DEBUG=true
```

## 📈 Analytics Insights

The system provides insights like:
- **Most popular pages** and user engagement
- **Geographic distribution** of your audience
- **Device preferences** for optimization
- **Traffic source effectiveness**
- **User behavior patterns**

## 🔒 Privacy & Compliance

- **GDPR Compliant**: No personal data stored
- **Privacy First**: Uses session IDs, not user IDs
- **Configurable**: Can be disabled per user preference
- **Transparent**: Clear data collection policies

## 📞 Support

If you encounter issues:
1. Check the browser console for errors
2. Verify Supabase table structure
3. Test with sample data first
4. Review the analytics context implementation

---

**Note**: This analytics system is designed to be privacy-friendly and GDPR compliant. It tracks aggregate data rather than individual user behavior, making it suitable for business analytics while respecting user privacy. 