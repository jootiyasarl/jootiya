"use client";

import { supabase } from "@/lib/supabaseClient";

export const AD_IMAGES_BUCKET = "ad-images";
export const MAX_AD_IMAGES = 10;

export interface UploadedAdImage {
  path: string;
  publicUrl: string | null;
}

interface CompressOptions {
  maxWidth?: number;
  maxHeight?: number;
  quality?: number; // 0 - 1
  mimeType?: string;
}

export async function compressImageFile(
  file: File,
  options: CompressOptions = {},
): Promise<File> {
  const {
    maxWidth = 1600,
    maxHeight = 1600,
    quality = 0.75,
    mimeType = "image/jpeg",
  } = options;

  return new Promise((resolve, reject) => {
    const image = new Image();

    image.onload = () => {
      const { width, height } = image;
      const scale = Math.min(maxWidth / width, maxHeight / height, 1);
      const targetWidth = Math.round(width * scale);
      const targetHeight = Math.round(height * scale);

      const canvas = document.createElement("canvas");
      canvas.width = targetWidth;
      canvas.height = targetHeight;

      const ctx = canvas.getContext("2d");
      if (!ctx) {
        reject(new Error("Failed to get canvas context for image compression"));
        return;
      }

      ctx.drawImage(image, 0, 0, targetWidth, targetHeight);

      canvas.toBlob(
        (blob) => {
          if (!blob) {
            reject(new Error("Failed to create compressed image blob"));
            return;
          }

          const fileName = file.name.replace(/\.[^.]+$/, "") || "image";
          const extension = mimeType === "image/png" ? "png" : "jpg";

          const compressedFile = new File([blob], `${fileName}.${extension}`, {
            type: mimeType,
            lastModified: Date.now(),
          });

          resolve(compressedFile);
        },
        mimeType,
        quality,
      );
    };

    image.onerror = () => {
      reject(new Error("Failed to load image for compression"));
    };

    const reader = new FileReader();
    reader.onload = () => {
      image.src = reader.result as string;
    };
    reader.onerror = () => {
      reject(new Error("Failed to read file for compression"));
    };

    reader.readAsDataURL(file);
  });
}

export async function uploadAdImages(
  adId: string,
  files: File[],
): Promise<UploadedAdImage[]> {
  if (!adId) {
    throw new Error("adId is required to upload ad images");
  }

  if (!files.length) {
    return [];
  }

  const limitedFiles = files.slice(0, MAX_AD_IMAGES);
  const results: UploadedAdImage[] = [];

  for (let index = 0; index < limitedFiles.length; index += 1) {
    const file = limitedFiles[index];

    const compressed = await compressImageFile(file);

    const extension =
      compressed.type === "image/png" ? "png" : "jpg";
    const timestamp = Date.now();
    const randomSuffix = Math.random().toString(36).slice(2, 8);
    const fileName = `${timestamp}-${index}-${randomSuffix}.${extension}`;

    const path = `ads/${adId}/images/${fileName}`;

    const { error: uploadError } = await supabase.storage
      .from(AD_IMAGES_BUCKET)
      .upload(path, compressed, {
        cacheControl: "3600",
        upsert: false,
        contentType: compressed.type,
      });

    if (uploadError) {
      throw uploadError;
    }

    const { data } = supabase.storage
      .from(AD_IMAGES_BUCKET)
      .getPublicUrl(path);

    results.push({
      path,
      publicUrl: data?.publicUrl ?? null,
    });
  }

  return results;
}
