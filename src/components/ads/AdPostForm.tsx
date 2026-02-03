"use client"

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Upload, X, Loader2 } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';

const adSchema = z.object({
    title: z.string().min(5, "Title must be at least 5 characters"),
    price: z.coerce.number().min(1, "Price must be greater than 0"),
    category: z.string().min(1, "Please select a category"),
    description: z.string().min(20, "Description must be detailed (min 20 chars)"),
    location: z.string().min(3, "Location is required"),
});

// Explicitly define form values for inputs, allowing string for price input which HTML returns
type AdFormValues = {
    title: string;
    price: number | string; // Allow string input from HTML form
    category: string;
    description: string;
    location: string;
};

export default function AdPostForm() {
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, formState: { errors } } = useForm<AdFormValues>({
        // Type casting resolver to any or unknown prevents the complex deep type mismatch
        // between Zod's inferred output (number) and RHF's input expectations (string | number)
        resolver: zodResolver(adSchema) as any,
    });

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setImages(prev => [...prev, ...newFiles]);

            // Create previews
            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const onSubmit = async (data: AdFormValues) => {
        setIsSubmitting(true);
        try {
            const user = await supabase.auth.getUser();
            if (!user.data.user) throw new Error("Not authenticated");

            // 1. Upload Images
            const uploadedUrls = [];
            for (const file of images) {
                const fileName = `${user.data.user.id}/${Date.now()}-${file.name}`;
                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('ad-images')
                    .upload(fileName, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('ad-images')
                    .getPublicUrl(fileName);

                uploadedUrls.push(publicUrl);
            }

            // 2. Insert Ad Record
            const { error: insertError } = await supabase
                .from('ads')
                .insert({
                    seller_id: user.data.user.id,
                    title: data.title,
                    description: data.description,
                    price: data.price,
                    location: data.location,
                    // category_id: data.category, // Assuming ID is passed, simplified for now
                    images: uploadedUrls,
                    status: 'pending'
                });

            if (insertError) throw insertError;

            alert('Ad posted successfully! Pending approval.');
            // box redirect logic here
        } catch (error) {
            console.error(error);
            alert('Failed to post ad.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-2xl mx-auto p-6 bg-white/50 backdrop-blur-md rounded-3xl border border-white/20 shadow-xl dark:bg-zinc-900/50">

            <div className="space-y-4">
                <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Post a New Ad
                </h2>

                {/* Title */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <Input {...register('title')} placeholder="e.g. iPhone 15 Pro Max - Like New" />
                    {errors.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}
                </div>

                {/* Price & Location */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Price ($)</label>
                        <Input type="number" {...register('price')} />
                        {errors.price && <p className="text-red-500 text-xs">{errors.price.message}</p>}
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium">Location</label>
                        <Input {...register('location')} placeholder="City, Area" />
                        {errors.location && <p className="text-red-500 text-xs">{errors.location.message}</p>}
                    </div>
                </div>

                {/* Category */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Category</label>
                    <select
                        {...register('category')}
                        className="flex h-11 w-full rounded-2xl border border-input bg-transparent px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-white/50 dark:bg-zinc-900/50"
                    >
                        <option value="">Select Category</option>
                        <option value="electronics">Electronics</option>
                        <option value="vehicles">Vehicles</option>
                        <option value="fashion">Fashion</option>
                        <option value="property">Property</option>
                    </select>
                    {errors.category && <p className="text-red-500 text-xs">{errors.category.message}</p>}
                </div>

                {/* Description */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Description</label>
                    <textarea
                        {...register('description')}
                        className="flex min-h-[120px] w-full rounded-2xl border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 bg-white/50 dark:bg-zinc-900/50 resize-none"
                        placeholder="Describe your item..."
                    />
                    {errors.description && <p className="text-red-500 text-xs">{errors.description.message}</p>}
                </div>

                {/* Image Upload */}
                <div className="space-y-2">
                    <label className="text-sm font-medium">Photos</label>
                    <div className="grid grid-cols-4 gap-4">
                        <label className="flex flex-col items-center justify-center w-full aspect-square rounded-2xl border-2 border-dashed border-gray-300 cursor-pointer hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-zinc-800 transition-colors">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                <Upload className="w-6 h-6 text-gray-400" />
                                <span className="text-xs text-gray-500 mt-2">Add Photo</span>
                            </div>
                            <input type="file" className="hidden" multiple accept="image/*" onChange={handleImageChange} />
                        </label>

                        {previews.map((src, idx) => (
                            <div key={idx} className="relative aspect-square rounded-2xl overflow-hidden group">
                                <Image src={src} alt="preview" fill className="object-cover" />
                                <button
                                    type="button"
                                    onClick={() => removeImage(idx)}
                                    className="absolute top-1 right-1 bg-black/50 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X size={12} />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>

            </div>

            <Button type="submit" disabled={isSubmitting} size="lg" className="w-full">
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Publishing...
                    </>
                ) : (
                    'Post Ad Now'
                )}
            </Button>
        </form>
    );
}
