# Advanced Search & Filtering System Guide

## Overview
The GoCart application now includes a comprehensive advanced search and filtering system that allows users to find products quickly and efficiently using multiple criteria.

## Features

### 🔍 **Advanced Search**
- **Text Search**: Search across product names, descriptions, categories, and store names
- **Real-time Results**: Instant filtering as you type
- **Case-insensitive**: Works regardless of capitalization
- **Multi-field Search**: Searches across multiple product fields simultaneously

### 🎛️ **Advanced Filters**

#### **Category Filter**
- Filter by product categories (Phones, Laptops, Keyboards, etc.)
- Dynamic category list based on available products
- "All Categories" option to show everything

#### **Price Range Filter**
- Set minimum and maximum price limits
- Real-time price range validation
- Quick price filter buttons:
  - Under $100
  - $100 - $500
  - $500 - $1000
  - Over $1000

#### **Stock Availability Filter**
- In Stock Only (default)
- Out of Stock Only
- All Products (including out of stock)

#### **Sorting Options**
- **Newest First** (default)
- **Oldest First**
- **Price: Low to High**
- **Price: High to Low**
- **Name: A to Z**
- **Name: Z to A**
- **Most Popular** (by rating count)

### 📱 **View Modes**
- **Grid View**: Traditional card layout (default)
- **List View**: Detailed horizontal layout with more information

### 📄 **Pagination**
- Automatic pagination for large result sets
- Page navigation controls
- Results count display

## How to Use

### For Users:

1. **Basic Search**
   - Use the search bar in the navbar or shop page
   - Type any product name, category, or description
   - Results update automatically

2. **Advanced Filtering**
   - Go to the Shop page
   - Click "Filters" to expand advanced options
   - Set your desired filters:
     - Select category from dropdown
     - Set price range with min/max inputs
     - Choose stock availability
     - Use quick price filter buttons

3. **Sorting**
   - Use the sort dropdown to change result order
   - Choose from various sorting criteria

4. **View Modes**
   - Toggle between Grid and List views
   - Grid: Compact card layout
   - List: Detailed horizontal layout

### API Endpoints:

#### `GET /api/products`
Enhanced with advanced filtering parameters:

**Query Parameters:**
- `search` - Text search term
- `category` - Product category filter
- `minPrice` - Minimum price filter
- `maxPrice` - Maximum price filter
- `inStock` - Stock availability filter (true/false/all)
- `sortBy` - Sort field (createdAt, price, name, rating)
- `sortOrder` - Sort direction (asc/desc)
- `page` - Page number for pagination
- `limit` - Results per page

**Response:**
```json
{
  "products": [...],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 50,
    "pages": 5
  },
  "filters": {
    "categories": ["Phones", "Laptops", "Keyboards"],
    "priceRange": {
      "min": 50,
      "max": 2000
    }
  }
}
```

## Technical Implementation

### Frontend Components:

#### **AdvancedSearchFilter Component**
- Reusable search and filter interface
- Real-time filter updates
- Responsive design
- Filter state management

#### **Enhanced ProductCard Component**
- Supports both grid and list view modes
- Improved product information display
- Better rating and pricing display

#### **Updated Shop Page**
- Integrated advanced search and filtering
- View mode toggles
- Pagination controls
- Results count display

### Backend Enhancements:

#### **Enhanced Products API**
- Advanced filtering logic
- Multiple sort options
- Pagination support
- Filter metadata for UI

#### **Database Queries**
- Optimized Prisma queries
- Efficient filtering and sorting
- Proper indexing support

## Search Capabilities

### Text Search Fields:
- Product name
- Product description
- Product category
- Store name

### Filter Combinations:
- All filters can be combined
- Real-time result updates
- Filter state persistence
- Clear all filters option

### Performance Features:
- Efficient database queries
- Pagination for large datasets
- Optimized search indexing
- Responsive UI updates

## User Experience Features

### Visual Feedback:
- Active filter indicators
- Results count display
- Loading states
- Empty state messages

### Accessibility:
- Keyboard navigation support
- Screen reader friendly
- Clear visual hierarchy
- Intuitive controls

### Mobile Responsive:
- Touch-friendly interface
- Responsive grid layouts
- Mobile-optimized filters
- Swipe-friendly interactions

## Future Enhancements

- [ ] Search suggestions/autocomplete
- [ ] Recent searches history
- [ ] Saved filter presets
- [ ] Advanced product specifications filtering
- [ ] Search analytics and insights
- [ ] Voice search integration
- [ ] Image-based search
- [ ] AI-powered product recommendations

## Performance Considerations

- Database indexes on searchable fields
- Efficient query optimization
- Pagination to limit result sets
- Caching for filter options
- Debounced search input
- Lazy loading for large datasets
