import imageCompression from 'browser-image-compression';

export interface CompressionOptions {
  maxSizeMB?: number;
  maxWidthOrHeight?: number;
  useWebWorker?: boolean;
  fileType?: string;
}

/**
 * ضغط الصور تلقائياً في المتصفح وتحويلها إلى صيغة WebP لتسريع التحميل والتوفير في مساحة التخزين
 */
export async function compressProductImage(
  imageFile: File,
  customOptions?: CompressionOptions
): Promise<File> {
  const options: CompressionOptions = {
    maxSizeMB: 0.6, // الحد الأقصى للحجم 600 كيلوبايت
    maxWidthOrHeight: 1600, // أقصى دقة مناسبة لمتجر إلكتروني فائق الجودة
    useWebWorker: true,
    fileType: 'image/webp', // التحويل إلى صيغة WebP الحديثة والمضغوطة
    ...customOptions,
  };

  try {
    const compressedBlob = await imageCompression(imageFile, options);
    
    // إنشاء ملف جديد بصيغة .webp
    const newFileName = imageFile.name.substring(0, imageFile.name.lastIndexOf('.')) || imageFile.name;
    const compressedFile = new File([compressedBlob], `${newFileName}.webp`, {
      type: 'image/webp',
      lastModified: Date.now(),
    });

    return compressedFile;
  } catch (error) {
    console.error('فشل ضغط الصورة:', error);
    // في حال حدوث أي خطأ، نرجع الملف الأصلي كإجراء احتياطي
    return imageFile;
  }
}
