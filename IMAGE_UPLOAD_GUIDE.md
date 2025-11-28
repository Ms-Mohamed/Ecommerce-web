# Image Upload System Guide

## Overview
The GoCart application now includes a comprehensive image upload system for product management. This allows administrators to upload real product images instead of using placeholder URLs.

## Features

### 🖼️ **Image Upload Component**
- **Drag & Drop Interface**: Easy-to-use image upload with preview
- **Multiple Image Support**: Upload up to 5 images per product
- **File Validation**: Supports JPEG, PNG, and WebP formats
- **Size Limits**: Maximum 5MB per image
- **Real-time Preview**: See uploaded images immediately
- **Remove Functionality**: Easy removal of individual images

### 🔒 **Security Features**
- **Admin Authentication**: Only admin users can upload images
- **File Type Validation**: Only image files are allowed
- **Size Validation**: Prevents oversized uploads
- **Unique Filenames**: Prevents filename conflicts

### 📁 **File Storage**
- **Local Storage**: Images stored in `public/uploads/products/`
- **Public Access**: Images accessible via `/uploads/products/filename`
- **Git Ignored**: Uploaded files are not tracked in version control

## How to Use

### For Administrators:

1. **Access Admin Panel**
   - Sign in as admin (`admin@example.com`)
   - Navigate to Admin Panel → Products

2. **Add New Product**
   - Click "Add Product" button
   - Fill in product details
   - Use the "Upload Images" section to add product photos
   - Click "Upload Images" to select files
   - Preview uploaded images
   - Remove unwanted images using the X button

3. **Edit Existing Product**
   - Click the edit icon on any product
   - Modify product details
   - Add/remove images as needed
   - Save changes

### API Endpoints:

#### `POST /api/upload`
Upload a single image file.

**Request:**
- Method: POST
- Content-Type: multipart/form-data
- Body: FormData with 'file' field

**Response:**
```json
{
  "success": true,
  "url": "/uploads/products/product_1234567890_abc123.jpg",
  "fileName": "product_1234567890_abc123.jpg"
}
```

**Error Responses:**
- `401`: Unauthorized (not signed in)
- `403`: Forbidden (not admin)
- `400`: Bad request (invalid file type/size)
- `500`: Server error

## File Structure

```
public/
├── uploads/
│   ├── products/
│   │   ├── product_1234567890_abc123.jpg
│   │   ├── product_1234567891_def456.png
│   │   └── ...
│   └── .gitkeep
```

## Technical Details

### ImageUpload Component Props:
- `images`: Array of image URLs
- `onImagesChange`: Callback function when images change
- `maxImages`: Maximum number of images (default: 5)
- `className`: Additional CSS classes

### File Naming Convention:
- Format: `product_{timestamp}_{randomString}.{extension}`
- Example: `product_1699123456789_abc123def.jpg`

### Supported File Types:
- JPEG (.jpg, .jpeg)
- PNG (.png)
- WebP (.webp)

### File Size Limits:
- Maximum: 5MB per image
- Recommended: 1-2MB for optimal performance

## Troubleshooting

### Common Issues:

1. **Upload Fails**
   - Check file size (must be < 5MB)
   - Verify file type (JPEG, PNG, WebP only)
   - Ensure admin authentication

2. **Images Not Displaying**
   - Check file path in database
   - Verify file exists in uploads directory
   - Check browser console for errors

3. **Permission Errors**
   - Ensure uploads directory is writable
   - Check file system permissions

## Future Enhancements

- [ ] Image compression/optimization
- [ ] Cloud storage integration (AWS S3, Cloudinary)
- [ ] Image resizing for different sizes
- [ ] Bulk upload functionality
- [ ] Image editing tools (crop, rotate, etc.)

## Security Considerations

- All uploads are validated for file type and size
- Only authenticated admin users can upload
- Files are stored in a controlled directory
- Unique filenames prevent conflicts and guessing
- No executable files are allowed
