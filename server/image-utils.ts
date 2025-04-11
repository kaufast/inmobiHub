import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

// Ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'uploads');
const originalDir = path.join(uploadDir, 'original');
const webpDir = path.join(uploadDir, 'webp');
const thumbsDir = path.join(uploadDir, 'thumbnails');

// Create directories if they don't exist
[uploadDir, originalDir, webpDir, thumbsDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Define image sizes
const imageSizes = {
  thumbnail: { width: 200, height: 150 },
  small: { width: 640, height: 480 },
  medium: { width: 1024, height: 768 },
  large: { width: 1920, height: 1280 }
};

/**
 * Process an uploaded image
 * - Saves original file
 * - Converts to WebP format
 * - Creates multiple sizes
 * - Strips EXIF data if specified
 * @param buffer Image buffer
 * @param originalFilename Original filename
 * @param options Processing options
 * @returns Object with paths to all generated files
 */
export async function processImage(
  buffer: Buffer,
  originalFilename: string,
  options: {
    quality?: number;
    stripExif?: boolean;
    generateSizes?: Array<'thumbnail' | 'small' | 'medium' | 'large'>;
    format?: 'webp' | 'jpeg' | 'png';
    preserveOriginal?: boolean;
  } = {}
) {
  // Set default options
  const {
    quality = 80,
    stripExif = true,
    generateSizes = ['thumbnail', 'medium'],
    format = 'webp',
    preserveOriginal = true
  } = options;

  // Generate unique ID for the image
  const fileId = uuidv4();
  const ext = path.extname(originalFilename);
  const baseFilename = path.basename(originalFilename, ext);
  const sanitizedBaseFilename = baseFilename
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '-');

  // Create a sharp instance from the buffer
  let sharpInstance = sharp(buffer);
  
  // Strip EXIF data if specified
  if (stripExif) {
    sharpInstance = sharpInstance.withMetadata({ exif: {} });
  }

  // Save original if requested
  const results: Record<string, string> = {};
  if (preserveOriginal) {
    const originalFilePath = path.join(originalDir, `${fileId}-${sanitizedBaseFilename}${ext}`);
    await fs.promises.writeFile(originalFilePath, buffer);
    results.original = path.relative(process.cwd(), originalFilePath);
  }

  // Convert to WebP (main image)
  const webpFilename = `${fileId}-${sanitizedBaseFilename}.webp`;
  const webpFilePath = path.join(webpDir, webpFilename);
  
  await sharpInstance
    .webp({ quality })
    .toFile(webpFilePath);
  
  results.webp = path.relative(process.cwd(), webpFilePath);

  // Generate different sizes if requested
  const sizePromises = generateSizes.map(async (size) => {
    const dimensions = imageSizes[size];
    const sizeFilename = `${fileId}-${sanitizedBaseFilename}-${size}.webp`;
    const sizeFilePath = size === 'thumbnail' 
      ? path.join(thumbsDir, sizeFilename)
      : path.join(webpDir, sizeFilename);
    
    await sharpInstance
      .resize(dimensions.width, dimensions.height, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality })
      .toFile(sizeFilePath);
    
    results[size] = path.relative(process.cwd(), sizeFilePath);
  });

  await Promise.all(sizePromises);

  // Create a preview image for LQIP (Low Quality Image Placeholder)
  const lqipFilename = `${fileId}-${sanitizedBaseFilename}-lqip.webp`;
  const lqipFilePath = path.join(webpDir, lqipFilename);
  
  await sharpInstance
    .resize(20, 15)
    .webp({ quality: 20 })
    .toFile(lqipFilePath);
  
  results.lqip = path.relative(process.cwd(), lqipFilePath);

  // Generate metadata about the image
  const metadata = await sharp(buffer).metadata();
  
  return {
    id: fileId,
    filename: sanitizedBaseFilename,
    paths: results,
    metadata: {
      width: metadata.width,
      height: metadata.height,
      format: metadata.format,
      size: buffer.length
    }
  };
}

/**
 * Process multiple images in batch
 */
export async function processMultipleImages(
  images: Array<{ buffer: Buffer; filename: string }>,
  options: Parameters<typeof processImage>[2] = {}
) {
  const results = [];
  
  for (const image of images) {
    const result = await processImage(image.buffer, image.filename, options);
    results.push(result);
  }
  
  return results;
}

/**
 * Delete an image and all its generated versions
 */
export async function deleteImage(fileId: string) {
  const filesToDelete = [];
  
  // Get all files in all directories
  const directories = [originalDir, webpDir, thumbsDir];
  
  for (const dir of directories) {
    const files = await fs.promises.readdir(dir);
    const matchingFiles = files.filter(file => file.startsWith(`${fileId}-`));
    filesToDelete.push(...matchingFiles.map(file => path.join(dir, file)));
  }
  
  // Delete all files
  await Promise.all(filesToDelete.map(file => fs.promises.unlink(file)));
  
  return { deletedCount: filesToDelete.length };
}