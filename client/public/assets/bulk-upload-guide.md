# Property Bulk Upload Guide

This guide will help you successfully upload multiple property listings at once using our bulk upload feature.

## CSV File Format

Your CSV file should include the following columns:

| Column | Description | Required | Example |
|--------|-------------|----------|---------|
| title | Property title | Yes | "Modern Downtown Condo" |
| description | Detailed property description | Yes | "Beautiful condo with city views" |
| price | Price in dollars (no $ symbol) | Yes | 450000 |
| address | Street address | Yes | "123 Main St" |
| city | City name | Yes | "Seattle" |
| state | State code | Yes | "WA" |
| zipCode | Postal/Zip code | No | "98101" |
| country | Country name | No | "USA" |
| latitude | Latitude coordinates | No | 47.6062 |
| longitude | Longitude coordinates | No | -122.3321 |
| bedrooms | Number of bedrooms | No | 2 |
| bathrooms | Number of bathrooms | No | 2 |
| squareFeet | Square footage of the property | No | 1200 |
| lotSize | Lot size in square feet | No | 5000 |
| yearBuilt | Year the property was built | No | 2018 |
| propertyType | Type of property (house, condo, apartment, townhouse, land) | Yes | "condo" |
| isPremium | Premium listing (true/false) | No | false |
| isActive | Active listing (true/false) | No | true |
| images | Image URLs separated by pipe (|) characters | No | "https://example.com/image1.jpg\|https://example.com/image2.jpg" |

## Adding Multiple Images

For multiple images, separate each image URL with a pipe character (|) in the "images" column:

```
https://example.com/image1.jpg|https://example.com/image2.jpg|https://example.com/image3.jpg
```

Each property can have up to 10 images. Images should be publicly accessible URLs.

## Example 

Here's an example of a properly formatted row in your CSV file:

```
Luxury Downtown Penthouse,Stunning penthouse with panoramic city views,1250000,888 First Avenue #2400,Seattle,WA,98101,USA,47.6062,-122.3321,3,3.5,2800,0,2019,condo,true,true,https://images.unsplash.com/photo-1551361415-69c87624161d|https://images.unsplash.com/photo-1598928636135-d146006ff4be
```

## Tips for Success

1. **Required Fields**: Make sure all required fields are filled in
2. **Formatting**: Avoid special characters in text fields
3. **Image URLs**: Only use direct links to images
4. **File Size**: Limit your upload to 100 properties per file
5. **Excel Export**: If using Excel, save/export as CSV format
6. **Commas in Text**: If your descriptions contain commas, ensure the field is properly quoted

## Troubleshooting

If you encounter errors during upload:

1. **Validation Errors**: Check the error messages for specific fields that need correction
2. **Image Errors**: Verify that all image URLs are publicly accessible
3. **File Format**: Ensure your CSV is properly formatted with the correct number of columns

Need more help? Contact support for assistance with bulk uploads.