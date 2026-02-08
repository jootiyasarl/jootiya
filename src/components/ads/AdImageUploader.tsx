"use client";

import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
  MAX_AD_IMAGES,
  type UploadedAdImage,
  uploadAdImages,
} from "@/lib/adImages";

interface PreviewItem {
  id: string;
  file: File;
  url: string;
}

interface AdImageUploaderProps {
  adId: string;
  maxImages?: number;
  onUploadComplete?: (images: UploadedAdImage[]) => void;
}

export function AdImageUploader({
  adId,
  maxImages = MAX_AD_IMAGES,
  onUploadComplete,
}: AdImageUploaderProps) {
  const [previews, setPreviews] = useState<PreviewItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleOpenFilePicker = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (
    event,
  ) => {
    const files = Array.from(event.target.files ?? []);
    if (!files.length) return;

    setError(null);

    setPreviews((current) => {
      const remainingSlots = maxImages - current.length;
      if (remainingSlots <= 0) {
        return current;
      }

      const nextFiles = files
        .filter((file) => file.type.startsWith("image/"))
        .slice(0, remainingSlots);

      const newPreviews: PreviewItem[] = nextFiles.map((file) => ({
        id: `${file.name}-${file.lastModified}-${Math.random()
          .toString(36)
          .slice(2, 8)}`,
        file,
        url: URL.createObjectURL(file),
      }));

      return [...current, ...newPreviews];
    });

    // Allow re-selecting the same files
    event.target.value = "";
  };

  const handleRemove = (id: string) => {
    setPreviews((current) => {
      const next = current.filter((item) => {
        if (item.id === id) {
          URL.revokeObjectURL(item.url);
          return false;
        }
        return true;
      });
      return next;
    });
  };

  const handleUpload = async () => {
    if (!previews.length || !adId) return;

    try {
      setUploading(true);
      setError(null);

      const files = previews.map((item) => item.file);
      const uploaded = await uploadAdImages(adId, files);

      onUploadComplete?.(uploaded);
    } catch (err: any) {
      console.error(err);
      const msg = err.message || "Failed to upload images. Please try again.";
      setError(msg);
      // Also show a toast for consistency
      import("sonner").then(({ toast }) => toast.error(`Upload error: ${msg}`));
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    return () => {
      // Cleanup object URLs on unmount
      setPreviews((current) => {
        current.forEach((item) => URL.revokeObjectURL(item.url));
        return [];
      });
    };
  }, []);

  return (
    <div className="space-y-3 rounded-lg border border-dashed border-zinc-300 bg-white p-4">
      <div className="flex items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium text-zinc-900">
            Ad images
          </p>
          <p className="text-xs text-zinc-500">
            Upload up to {maxImages} images. We&apos;ll compress them automatically.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleOpenFilePicker}
          disabled={previews.length >= maxImages || uploading}
        >
          Choose images
        </Button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      {previews.length > 0 ? (
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
          {previews.map((item) => (
            <div
              key={item.id}
              className="group relative overflow-hidden rounded-md border bg-zinc-50"
            >
              <div className="relative h-24 w-full">
                <Image
                  src={item.url}
                  alt="Ad image preview"
                  fill
                  className="object-cover"
                />
              </div>
              <button
                type="button"
                onClick={() => handleRemove(item.id)}
                className="absolute right-1 top-1 inline-flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex items-center justify-center rounded-md border border-dashed border-zinc-200 bg-zinc-50 px-4 py-6 text-xs text-zinc-500">
          No images selected yet. Click "Choose images" to add up to {maxImages} images.
        </div>
      )}

      <div className="flex items-center justify-between gap-2 text-xs text-zinc-500">
        <span>
          {previews.length} / {maxImages} images selected
        </span>
        <div className="flex items-center gap-2">
          {error ? (
            <span className="text-[11px] text-red-500">{error}</span>
          ) : null}
          <Button
            type="button"
            size="sm"
            onClick={handleUpload}
            disabled={uploading || previews.length === 0}
          >
            {uploading ? "Uploading..." : "Upload images"}
          </Button>
        </div>
      </div>
    </div>
  );
}
