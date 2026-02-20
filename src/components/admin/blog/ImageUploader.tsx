"use client";

import React, { useState, useCallback } from "react";
import imageCompression from "browser-image-compression";
import { Upload, X, ImageIcon, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/lib/supabaseClient";
import { toast } from "sonner";

interface ImageUploaderProps {
  onUploadComplete: (url: string) => void;
  currentImage?: string;
  label?: string;
}

export const ImageUploader = ({ onUploadComplete, currentImage, label = "Image de couverture" }: ImageUploaderProps) => {
  const [isCompressing, setIsCompressing] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentImage || null);
  const [compressionStats, setCompressionStats] = useState<{ original: string; compressed: string } | null>(null);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check if it's an image
    if (!file.type.startsWith("image/")) {
      toast.error("Veuillez sélectionner une image valide");
      return;
    }

    try {
      setIsCompressing(true);
      
      const options = {
        maxSizeMB: 0.2, // 200KB
        maxWidthOrHeight: 1200,
        useWebWorker: true,
        fileType: "image/webp",
      };

      console.log(`Original size: ${formatSize(file.size)}`);
      
      const compressedFile = await imageCompression(file, options);
      
      setCompressionStats({
        original: formatSize(file.size),
        compressed: formatSize(compressedFile.size)
      });

      // Local preview
      const localPreview = URL.createObjectURL(compressedFile);
      setPreview(localPreview);
      setIsCompressing(false);

      // Start Upload
      await uploadToSupabase(compressedFile);

    } catch (error) {
      console.error("Compression error:", error);
      toast.error("Erreur lors della compression de l'image");
      setIsCompressing(false);
    }
  };

  const uploadToSupabase = async (file: File) => {
    setIsUploading(true);
    try {
      const fileExt = "webp";
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
      const filePath = `blog/${fileName}`;

      const bucketName = "ad-images"; // Changed from blog_content to ad-images
      const { data, error } = await supabase.storage
        .from(bucketName)
        .upload(filePath, file, {
          cacheControl: "3600",
          upsert: false
        });

      if (error) {
        if (error.message.includes("bucket not found")) {
          toast.error(`Bucket '${bucketName}' non trouvé. Veuillez le créer dans Supabase Storage.`);
        }
        throw error;
      }

      const { data: { publicUrl } } = supabase.storage
        .from(bucketName)
        .getPublicUrl(filePath);

      onUploadComplete(publicUrl);
      toast.success("Image optimisée et téléchargée !");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Erreur lors du téléchargement");
    } finally {
      setIsUploading(false);
    }
  };

  const removeImage = () => {
    setPreview(null);
    setCompressionStats(null);
    onUploadComplete("");
  };

  return (
    <div className="space-y-4">
      <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] ml-1">{label}</label>
      
      <div className={cn(
        "relative group border-2 border-dashed rounded-[2rem] transition-all duration-300 overflow-hidden",
        preview ? "border-zinc-800 bg-zinc-900/20" : "border-zinc-800 bg-zinc-900/40 hover:border-orange-500/50 hover:bg-orange-500/5",
        (isCompressing || isUploading) && "opacity-60 pointer-events-none"
      )}>
        
        {preview ? (
          <div className="relative aspect-video w-full">
            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <Button 
                type="button"
                variant="destructive" 
                size="sm" 
                onClick={removeImage}
                className="rounded-full h-10 w-10 p-0"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
            
            {compressionStats && !isUploading && (
              <div className="absolute bottom-4 left-4 right-4 p-3 bg-zinc-950/80 backdrop-blur-md rounded-2xl border border-zinc-800 flex items-center justify-between text-[10px] font-bold">
                <div className="flex items-center gap-2 text-zinc-400">
                  <span className="line-through">{compressionStats.original}</span>
                  <span className="text-emerald-500">{compressionStats.compressed}</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-500">
                  <CheckCircle2 className="h-3 w-3" />
                  OPTIMISÉ WEBP
                </div>
              </div>
            )}
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center aspect-video cursor-pointer p-8">
            <div className="p-4 bg-zinc-950 rounded-[1.5rem] border border-zinc-800 mb-4 group-hover:scale-110 transition-transform">
              <Upload className="h-6 w-6 text-orange-500" />
            </div>
            <span className="text-sm font-bold text-zinc-300">Glissez-déposez ou cliquez</span>
            <span className="text-[10px] text-zinc-500 font-medium mt-1 uppercase tracking-widest text-center">
              WEBP, PNG, JPG (MAX 1200px, &lt; 200KB)
            </span>
            <input 
              type="file" 
              id="blog-image-upload"
              className="hidden" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
          </label>
        )}

        {(isCompressing || isUploading) && (
          <div className="absolute inset-0 bg-zinc-950/60 backdrop-blur-sm flex flex-col items-center justify-center text-white z-10">
            <Loader2 className="h-8 w-8 animate-spin text-orange-500 mb-3" />
            <span className="text-xs font-black uppercase tracking-widest animate-pulse">
              {isCompressing ? "Optimisation de l'image..." : "Téléchargement..."}
            </span>
          </div>
        )}
      </div>
    </div>
  );
};
