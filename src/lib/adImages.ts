"use client";

import { supabase } from "@/lib/supabaseClient";

export const AD_IMAGES_BUCKET = "ad-images";
export const MAX_AD_IMAGES = 10;

export interface UploadedAdImage {
  path: string;
  publicUrl: string | null;
}

import imageCompression from "browser-image-compression";

export async function compressImageFile(
  file: File,
  options: any = {},
): Promise<File> {
  const compressionOptions = {
    maxSizeMB: options.maxSizeMB || 0.5,
    maxWidthOrHeight: options.maxWidth || 1200,
    useWebWorker: true,
    preserveExif: false, // Explicitly strip EXIF/GPS metadata for privacy
  };

  try {
    console.log(`Senior/ZeroWaste: Compressing ad image ${file.name}...`);
    const compressedFile = await imageCompression(file, compressionOptions);
    console.log(`Senior/ZeroWaste: Compressed ${file.name} to ${compressedFile.size / 1024} KB`);
    return compressedFile;
  } catch (error) {
    console.error("Compression error:", error);
    return file; // Fallback to original
  }
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
