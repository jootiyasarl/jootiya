"use client"

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Upload, X, Loader2, Smartphone, Car, Shirt, Home, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';

const adSchema = z.object({
    title: z.string().min(5, "Le titre doit contenir au moins 5 caractères"),
    price: z.coerce.number().min(1, "Le prix doit être supérieur à 0"),
    category: z.string().min(1, "Veuillez sélectionner une catégorie"),
    description: z.string().min(20, "La description doit être détaillée (min 20 caractères)"),
    location: z.string().min(3, "La localisation est requise"),
});

type AdFormValues = {
    title: string;
    price: number | string;
    category: string;
    description: string;
    location: string;
};

const CATEGORIES = [
    { id: 'electronics', label: 'Électronique', icon: Smartphone, color: 'text-blue-500', bg: 'bg-blue-50 dark:bg-blue-900/20' },
    { id: 'vehicles', label: 'Véhicules', icon: Car, color: 'text-orange-500', bg: 'bg-orange-50 dark:bg-orange-900/20' },
    { id: 'fashion', label: 'Mode', icon: Shirt, color: 'text-pink-500', bg: 'bg-pink-50 dark:bg-pink-900/20' },
    { id: 'property', label: 'Immobilier', icon: Home, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20' },
];

export default function AdPostForm() {
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<AdFormValues>({
        resolver: zodResolver(adSchema) as any,
    });

    const selectedCategory = watch('category');

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setImages(prev => [...prev, ...newFiles]);

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
            if (!user.data.user) throw new Error("Non authentifié");

            // 1. Upload Images
            const uploadedUrls = [];
            for (const file of images) {
                const fileName = `${user.data.user.id}/${Date.now()}-${file.name}`;
                const { error: uploadError } = await supabase.storage
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
                    // category: data.category, // Assuming 'category' column exists now or handled via ID
                    images: uploadedUrls,
                    status: 'pending'
                });

            if (insertError) throw insertError;

            alert('Annonce publiée avec succès ! En attente d\'approbation.');
        } catch (error) {
            console.error(error);
            alert('Échec de la publication de l\'annonce.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8 max-w-4xl mx-auto">

            {/* Section 1: Details */}
            <div className="bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl rounded-3xl p-6 md:p-8 dark:bg-zinc-900/70">
                <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-bold dark:bg-blue-900 dark:text-blue-300">1</span>
                    Détails de l'article
                </h2>

                <div className="space-y-6">
                    {/* Category Selection */}
                    <div className="space-y-3">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Catégorie</label>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {CATEGORIES.map((cat) => {
                                const Icon = cat.icon;
                                const isSelected = selectedCategory === cat.id;
                                return (
                                    <button
                                        key={cat.id}
                                        type="button"
                                        onClick={() => setValue('category', cat.id, { shouldValidate: true })}
                                        className={cn(
                                            "relative flex flex-col items-center justify-center gap-3 p-4 rounded-xl border-2 transition-all duration-200 hover:scale-[1.02]",
                                            isSelected
                                                ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10"
                                                : "border-transparent bg-gray-50 hover:bg-gray-100 dark:bg-zinc-800 dark:hover:bg-zinc-800/80"
                                        )}
                                    >
                                        <div className={cn("p-3 rounded-full", cat.bg)}>
                                            <Icon className={cn("h-6 w-6", cat.color)} />
                                        </div>
                                        <span className={cn("text-sm font-medium", isSelected ? "text-blue-700 dark:text-blue-300" : "text-gray-600 dark:text-gray-400")}>
                                            {cat.label}
                                        </span>
                                        {isSelected && (
                                            <div className="absolute top-2 right-2 text-blue-500">
                                                <CheckCircle2 className="h-4 w-4" />
                                            </div>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        <input type="hidden" {...register('category')} />
                        {errors.category && <p className="text-red-500 text-xs mt-1">{errors.category.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Titre</label>
                        <Input {...register('title')} placeholder="ex: iPhone 15 Pro Max - État neuf" className="bg-white/50 dark:bg-zinc-900/50" />
                        {errors.title && <p className="text-red-500 text-xs">{errors.title.message}</p>}
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Description</label>
                        <textarea
                            {...register('description')}
                            className="flex min-h-[150px] w-full rounded-2xl border border-input bg-white/50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-zinc-900/50 resize-y"
                            placeholder="Décrivez votre article en détail (état, caractéristiques, raison de la vente)..."
                        />
                        {errors.description && <p className="text-red-500 text-xs">{errors.description.message}</p>}
                    </div>
                </div>
            </div>

            {/* Section 2: Media & Price */}
            <div className="grid md:grid-cols-2 gap-8">
                <div className="bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl rounded-3xl p-6 md:p-8 dark:bg-zinc-900/70 h-fit">
                    <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-bold dark:bg-blue-900 dark:text-blue-300">2</span>
                        Photos
                    </h2>

                    <div className="space-y-4">
                        <label className="relative flex flex-col items-center justify-center w-full aspect-video rounded-2xl border-2 border-dashed border-gray-300 cursor-pointer hover:border-blue-500 hover:bg-blue-50/50 dark:border-zinc-700 dark:hover:border-blue-500 dark:hover:bg-blue-900/10 transition-all group">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center">
                                <div className="p-4 rounded-full bg-blue-50 mb-3 group-hover:scale-110 transition-transform dark:bg-zinc-800">
                                    <Upload className="w-8 h-8 text-blue-500" />
                                </div>
                                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Cliquez pour télécharger des photos</p>
                                <p className="text-xs text-gray-500 mt-1">SVG, PNG, JPG (max 800x400px)</p>
                            </div>
                            <input type="file" className="hidden" multiple accept="image/*" onChange={handleImageChange} />
                        </label>

                        {previews.length > 0 && (
                            <div className="grid grid-cols-4 gap-2 mt-4">
                                {previews.map((src, idx) => (
                                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden group border border-gray-200 dark:border-zinc-700">
                                        <Image src={src} alt="preview" fill className="object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => removeImage(idx)}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600"
                                        >
                                            <X size={12} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white/70 backdrop-blur-xl border border-white/20 shadow-xl rounded-3xl p-6 md:p-8 dark:bg-zinc-900/70 h-fit">
                    <h2 className="text-xl font-semibold mb-6 text-gray-900 dark:text-white flex items-center gap-2">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-600 text-sm font-bold dark:bg-blue-900 dark:text-blue-300">3</span>
                        Détails
                    </h2>

                    <div className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Prix (DH)</label>
                            <div className="relative">
                                <span className="absolute left-3 top-2.5 text-gray-500">DH</span>
                                <Input type="number" {...register('price')} className="pl-10 bg-white/50 dark:bg-zinc-900/50" />
                            </div>
                            {errors.price && <p className="text-red-500 text-xs">{errors.price.message}</p>}
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Localisation</label>
                            <Input {...register('location')} placeholder="Ville, Quartier" className="bg-white/50 dark:bg-zinc-900/50" />
                            {errors.location && <p className="text-red-500 text-xs">{errors.location.message}</p>}
                        </div>
                    </div>
                </div>
            </div>

            <Button type="submit" disabled={isSubmitting} size="lg" className="w-full text-lg h-14 rounded-2xl font-bold shadow-lg hover:shadow-blue-500/25 transition-all">
                {isSubmitting ? (
                    <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Publication en cours...
                    </>
                ) : (
                    'Publier l\'annonce'
                )}
            </Button>
        </form>
    );
}
