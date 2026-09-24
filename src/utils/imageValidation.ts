export interface ImageValidationResult {
  isValid: boolean;
  error?: string;
  warning?: string;
  width?: number;
  height?: number;
}

export const IMAGE_GUIDELINES = {
  allowedExtensions: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
  allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif'],
  maxSizeBytes: 20 * 1024 * 1024, // 20 MB
  maxSizeLabel: '20 MB',
  recommendedSizeLabel: '2 MB - 8 MB',
  minWidth: 1280,
  minHeight: 720,
  minResolutionLabel: '1280 × 720 (720p HD)',
  recommendedResolution: '1920 × 1080 (Full HD) to 3840 × 2160 (4K UHD)',
  recommendedAspectRatio: '16:9 or 16:10 Landscape'
};

/**
 * Validates a local image file against format, size, and minimum screensaver resolution.
 */
export async function validateImageFile(file: File): Promise<ImageValidationResult> {
  const extension = file.name.split('.').pop()?.toLowerCase() || '';

  // 1. Check Format / MIME type
  const isMimeValid = IMAGE_GUIDELINES.allowedMimeTypes.includes(file.type);
  const isExtValid = IMAGE_GUIDELINES.allowedExtensions.includes(extension);

  if (!isMimeValid && !isExtValid) {
    return {
      isValid: false,
      error: `The format ".${extension.toUpperCase() || 'UNKNOWN'}" is not supported. Please upload high-definition JPG, PNG, WEBP, or AVIF images.`
    };
  }

  // 2. Check File Size Limit
  if (file.size > IMAGE_GUIDELINES.maxSizeBytes) {
    const sizeMb = (file.size / (1024 * 1024)).toFixed(1);
    return {
      isValid: false,
      error: `File size (${sizeMb} MB) exceeds the maximum allowed limit of ${IMAGE_GUIDELINES.maxSizeLabel}. Please compress or choose a smaller image.`
    };
  }

  // 3. Check Image Resolution / Dimensions
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const width = img.naturalWidth;
      const height = img.naturalHeight;

      if (width < IMAGE_GUIDELINES.minWidth || height < IMAGE_GUIDELINES.minHeight) {
        resolve({
          isValid: false,
          error: `Resolution is too low (${width} × ${height}px). Minimum required resolution for a screensaver is ${IMAGE_GUIDELINES.minResolutionLabel} to prevent blurry displays.`,
          width,
          height
        });
        return;
      }

      let warning: string | undefined;
      if (height > width * 1.1) {
        warning = `Portrait photo (${width} × ${height}px): Will be framed with dynamic ambient blur on landscape displays.`;
      }

      resolve({
        isValid: true,
        warning,
        width,
        height
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        isValid: false,
        error: `Could not process "${file.name}". The image file may be corrupted or in an unsupported encoding.`
      });
    };

    img.src = objectUrl;
  });
}

/**
 * Validates an image URL by preloading it into an Image object.
 */
export async function validateImageUrl(url: string): Promise<ImageValidationResult> {
  const cleanUrl = url.trim();

  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://') && !cleanUrl.startsWith('data:image/')) {
    return {
      isValid: false,
      error: 'Please provide a valid image URL starting with https://'
    };
  }

  return new Promise((resolve) => {
    const img = new Image();
    const timer = setTimeout(() => {
      resolve({
        isValid: false,
        error: 'Image URL timed out or could not be loaded. Please check that the URL is public and directly links to an image.'
      });
    }, 10000);

    img.onload = () => {
      clearTimeout(timer);
      const width = img.naturalWidth;
      const height = img.naturalHeight;

      if (width < IMAGE_GUIDELINES.minWidth || height < IMAGE_GUIDELINES.minHeight) {
        resolve({
          isValid: false,
          error: `Image resolution (${width} × ${height}px) is below the minimum required for screensavers (${IMAGE_GUIDELINES.minResolutionLabel}).`,
          width,
          height
        });
        return;
      }

      resolve({
        isValid: true,
        width,
        height
      });
    };

    img.onerror = () => {
      clearTimeout(timer);
      resolve({
        isValid: false,
        error: 'Unable to load image from this URL. Please verify the URL points to a valid JPG, PNG, WEBP, or AVIF image and allows direct access.'
      });
    };

    img.src = cleanUrl;
  });
}
