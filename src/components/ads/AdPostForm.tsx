"use client"

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Upload, X, Loader2, Smartphone, Car, Shirt,
    CheckCircle2, ChevronRight, ChevronLeft,
    Image as ImageIcon, MapPin, Tag, FileText,
    Sparkles, Info, Star, Laptop, Package, Armchair, Hammer, Gamepad2, PawPrint, BookOpen
} from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';
import { MOROCCAN_CITIES } from '@/lib/constants/cities';

const adSchema = z.object({
    title: z.string().min(5, "Le titre doit contenir au moins 5 caractères"),
    price: z.coerce.number().min(1, "Le prix doit être supérieur à 0"),
    category: z.string().min(1, "Veuillez sélectionner une catégorie"),
    description: z.string().min(20, "La description doit être détaillée (min 20 caractères)"),
    city: z.string().min(1, "La ville est requise"),
    neighborhood: z.string().optional(),
    phone: z.string().min(10, "Le numéro de téléphone est requis (min 10 chiffres)"),
    condition: z.enum(['new', 'used'], { message: "L'état du produit est requis" }),
});

type AdFormValues = {
    title: string;
    price: number | string;
    category: string;
    description: string;
    city: string;
    neighborhood?: string;
    phone: string;
    condition: 'new' | 'used';
};

const CATEGORIES = [
    { id: 'electronics', label: 'Électronique', icon: Smartphone, color: 'text-blue-500', bg: 'bg-blue-50/50', border: 'border-blue-100' },
    { id: 'home-furniture', label: 'Maison & Ameublement', icon: Armchair, color: 'text-green-500', bg: 'bg-green-50/50', border: 'border-green-100' },
    { id: 'vehicles', label: 'Véhicules & Transport', icon: Car, color: 'text-orange-500', bg: 'bg-orange-50/50', border: 'border-orange-100' },
    { id: 'fashion', label: 'Mode & Chaussures', icon: Shirt, color: 'text-pink-500', bg: 'bg-pink-50/50', border: 'border-pink-100' },
    { id: 'tools-equipment', label: 'Outils & Équipement', icon: Hammer, color: 'text-stone-500', bg: 'bg-stone-50/50', border: 'border-stone-100' },
    { id: 'hobbies', label: 'Loisirs & Divertissement', icon: Gamepad2, color: 'text-purple-500', bg: 'bg-purple-50/50', border: 'border-purple-100' },
    { id: 'animals', label: 'Animaux', icon: PawPrint, color: 'text-amber-500', bg: 'bg-amber-50/50', border: 'border-amber-100' },
    { id: 'books', label: 'Livres & Études', icon: BookOpen, color: 'text-sky-500', bg: 'bg-sky-50/50', border: 'border-sky-100' },
    { id: 'used-clearance', label: 'Occasions / Vide-grenier', icon: Tag, color: 'text-red-500', bg: 'bg-red-50/50', border: 'border-red-100' },
    { id: 'other', label: 'Autres', icon: Package, color: 'text-zinc-500', bg: 'bg-zinc-50/50', border: 'border-zinc-100' },
];

const STEPS = [
    { id: 'category', label: 'Catégorie', icon: Tag },
    { id: 'details', label: 'Détails', icon: FileText },
    { id: 'media', label: 'Photos', icon: ImageIcon },
    { id: 'final', label: 'Prix & Lieu', icon: MapPin },
];

interface AdPostFormProps {
    mode?: 'create' | 'edit';
    initialData?: Partial<AdFormValues> & { id?: string; image_urls?: string[] };
    onSuccess?: () => void;
}

export default function AdPostForm({ mode = 'create', initialData, onSuccess }: AdPostFormProps) {
    const [currentStep, setCurrentStep] = useState(0);
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>(initialData?.image_urls || []);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { register, handleSubmit, setValue, watch, trigger, formState: { errors } } = useForm<AdFormValues>({
        resolver: zodResolver(adSchema) as any,
        defaultValues: {
            category: initialData?.category || '',
            title: initialData?.title || '',
            description: initialData?.description || '',
            city: (initialData as any)?.city || '', // Use explicit city if available
            neighborhood: (initialData as any)?.neighborhood || '',
            phone: (initialData as any)?.phone || '',
            price: initialData?.price || '',
            condition: (initialData as any)?.condition || 'used'
        }
    });

    const selectedCategory = watch('category');

    const handleNext = async () => {
        let fieldsToValidate: (keyof AdFormValues)[] = [];

        if (currentStep === 0) fieldsToValidate = ['category'];
        if (currentStep === 1) fieldsToValidate = ['title', 'description', 'condition'];
        if (currentStep === 3) fieldsToValidate = ['price', 'city', 'phone'];

        const isValid = await trigger(fieldsToValidate);

        if (isValid) {
            setCurrentStep(prev => Math.min(prev + 1, STEPS.length - 1));
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleBack = () => {
        setCurrentStep(prev => Math.max(prev - 1, 0));
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const newFiles = Array.from(e.target.files);
            setImages(prev => [...prev, ...newFiles]);

            const newPreviews = newFiles.map(file => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...newPreviews]);
        }
    };

    const removeImage = (index: number) => {
        const previewToRemove = previews[index];

        // If it's a new image (blob URL), we should find its index in the 'images' array and remove it
        if (previewToRemove.startsWith('blob:')) {
            // This is a bit tricky if multiple blobs are added. 
            // Better: find how many blobs are before this one in the previews array.
            const blobIndex = previews.slice(0, index).filter(p => p.startsWith('blob:')).length;
            setImages(prev => prev.filter((_, i) => i !== blobIndex));
        }

        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const onSubmit = async (data: AdFormValues) => {
        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Vous devez être connecté pour publier une annonce.");

            // 1. Upload New Images
            const newUploadedUrls = [];
            for (const file of images) {
                // Sanitize filename
                const cleanName = file.name.replace(/[^\w.-]/g, '_');
                const fileName = `${user.id}/${Date.now()}-${cleanName}`;

                const { error: uploadError } = await supabase.storage
                    .from('ad-images')
                    .upload(fileName, file);

                if (uploadError) throw uploadError;

                const { data: { publicUrl } } = supabase.storage
                    .from('ad-images')
                    .getPublicUrl(fileName);

                newUploadedUrls.push(publicUrl);
            }

            // Combine existing images (that weren't removed) with new uploads
            // For simplicity in this logic, we assume previews contains only valid URLs (old public ones or new blobs)
            // But actually we have 'images' (File[]) for new ones and initialData?.image_urls for old ones.
            // Let's filter initialData?.image_urls to only those still in previews.
            const existingUrls = (initialData?.image_urls || []).filter(url => previews.includes(url));
            const finalImageUrls = [...existingUrls, ...newUploadedUrls];

            // 2. Map Location (Directly from form now)
            const city = data.city;
            const neighborhood = data.neighborhood || null;

            if (mode === 'edit' && initialData?.id) {
                // UPDATE
                const { error: updateError } = await supabase
                    .from('ads')
                    .update({
                        title: data.title,
                        description: data.description,
                        price: data.price,
                        city: city,
                        neighborhood: neighborhood,
                        phone: data.phone,
                        category: data.category,
                        image_urls: finalImageUrls,
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', initialData.id)
                    .eq('seller_id', user.id);

                if (updateError) throw updateError;
            } else {
                // INSERT
                // Generate Slug only on creation
                const baseSlug = data.title
                    .toLowerCase()
                    .trim()
                    .replace(/[^\w\s-]/g, '')
                    .replace(/[\s_-]+/g, '-')
                    .replace(/^-+|-+$/g, '');
                const uniqueId = Math.random().toString(36).substring(2, 7);
                const slug = `${baseSlug}-${uniqueId}`;

                const { error: insertError } = await supabase
                    .from('ads')
                    .insert({
                        seller_id: user.id,
                        title: data.title,
                        slug: slug,
                        description: data.description,
                        price: data.price,
                        currency: 'MAD',
                        city: city,
                        neighborhood: neighborhood,
                        phone: data.phone,
                        category: data.category,
                        image_urls: finalImageUrls,
                        status: 'pending'
                    })
                    .select('id')
                    .single();

                if (insertError) throw insertError;
            }

            setIsSuccess(true);
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error("Ad Publication Error:", error);
            alert(`Échec: ${error.message || "Une erreur inconnue est survenue"}`);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="max-w-2xl mx-auto text-center py-20 px-4 animate-in fade-in zoom-in duration-500">
                <div className="w-24 h-24 bg-orange-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-orange-200">
                    <CheckCircle2 className="w-12 h-12 text-white" />
                </div>
                <h2 className="text-4xl font-black text-zinc-900 mb-4 tracking-tight uppercase">Annonce publiée !</h2>
                <p className="text-zinc-500 text-lg mb-10 max-w-md mx-auto">
                    Votre annonce est en cours de révision par notre équipe. Elle sera visible sur le site très prochainement.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button onClick={() => window.location.href = '/dashboard/ads'} variant="outline" className="h-12 px-8 rounded-xl font-bold">
                        Gérer mes annonces
                    </Button>
                    <Button onClick={() => window.location.href = '/'} className="h-12 px-8 rounded-xl font-bold bg-orange-600 hover:bg-orange-700">
                        Retour à l'accueil
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-12 px-4">
                <div className="flex justify-between items-center relative">
                    {/* Line behind steps */}
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-zinc-100 -translate-y-1/2 z-0" />
                    <div
                        className="absolute top-1/2 left-0 h-0.5 bg-orange-500 -translate-y-1/2 z-0 transition-all duration-500 ease-in-out"
                        style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                    />

                    {STEPS.map((step, idx) => {
                        const isCompleted = currentStep > idx;
                        const isActive = currentStep === idx;
                        const StepIcon = step.icon;

                        return (
                            <div key={idx} className="relative z-10 flex flex-col items-center gap-3">
                                <div className={cn(
                                    "w-10 h-10 rounded-2xl flex items-center justify-center transition-all duration-500 border-[3px]",
                                    isCompleted ? "bg-orange-500 border-orange-50 text-white" :
                                        isActive ? "bg-white border-orange-500 text-orange-500 shadow-xl shadow-orange-100" :
                                            "bg-white border-zinc-100 text-zinc-300"
                                )}>
                                    {isCompleted ? <CheckCircle2 className="w-5 h-5" /> : <StepIcon className="w-4 h-4" />}
                                </div>
                                <span className={cn(
                                    "text-[10px] font-black uppercase tracking-widest transition-colors duration-300",
                                    isActive ? "text-orange-500" : "text-zinc-400"
                                )}>
                                    {step.label}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="relative min-h-[500px]">
                {/* Step 1: Category */}
                {currentStep === 0 && (
                    <div className="animate-in slide-in-from-right-8 fade-in duration-500">
                        <div className="bg-white/80 backdrop-blur-2xl border border-white shadow-2xl shadow-zinc-200/50 rounded-[2.5rem] p-8 md:p-12 text-center">
                            <div className="w-14 h-14 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 mx-auto mb-6">
                                <Tag className="w-6 h-6" />
                            </div>
                            <h2 className="text-3xl font-black text-zinc-900 mb-2 uppercase tracking-tight">Choisissez une catégorie</h2>
                            <p className="text-zinc-500 mb-10 font-medium">Sélectionnez le type d'article que vous souhaitez vendre</p>

                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                                {CATEGORIES.map((cat) => {
                                    const Icon = cat.icon;
                                    const isSelected = selectedCategory === cat.id;
                                    return (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setValue('category', cat.id, { shouldValidate: true })}
                                            className={cn(
                                                "relative flex flex-col items-center justify-center gap-3 p-4 rounded-2xl border-2 transition-all duration-300 group hover:scale-[1.03]",
                                                isSelected
                                                    ? "border-orange-500 bg-orange-50/50 shadow-xl shadow-orange-100/50"
                                                    : "border-zinc-50 bg-zinc-50/50 hover:bg-white hover:border-orange-100 hover:shadow-xl hover:shadow-zinc-100"
                                            )}
                                        >
                                            <div className={cn("p-3 rounded-xl transition-all duration-300 group-hover:scale-110", cat.bg)}>
                                                <Icon className={cn("h-5 w-5", cat.color)} />
                                            </div>
                                            <span className={cn("text-xs font-black uppercase tracking-widest", isSelected ? "text-orange-700" : "text-zinc-500 group-hover:text-zinc-900")}>
                                                {cat.label}
                                            </span>
                                            {isSelected && (
                                                <div className="absolute top-4 right-4 text-orange-500">
                                                    <CheckCircle2 className="h-5 w-5" />
                                                </div>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                            {errors.category && <p className="text-red-500 text-xs font-bold mt-6 uppercase tracking-widest">{errors.category.message}</p>}

                            <div className="mt-12 flex justify-center">
                                <Button
                                    type="button"
                                    onClick={handleNext}
                                    className="h-11 px-8 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-sm shadow-xl shadow-orange-200 active:scale-95 transition-all flex items-center gap-3"
                                >
                                    Suivant
                                    <ChevronRight className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 2: Details */}
                {currentStep === 1 && (
                    <div className="animate-in slide-in-from-right-8 fade-in duration-500">
                        <div className="bg-white/80 backdrop-blur-2xl border border-white shadow-xl shadow-zinc-200/50 rounded-3xl p-6 md:p-8">
                            <div className="flex items-center gap-6 mb-10">
                                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 shrink-0">
                                    <FileText className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Détails de l'article</h2>
                                    <p className="text-zinc-500 font-medium">Décrivez votre produit pour attirer plus d'acheteurs</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Titre de l'annonce</label>
                                    <Input
                                        {...register('title')}
                                        placeholder="ex: iPhone 15 Pro Max - Comme neuf"
                                        className="h-12 px-6 text-base rounded-xl border-zinc-100 bg-white focus:ring-4 focus:ring-orange-50 focus:border-orange-500 transition-all"
                                    />
                                    {errors.title && <p className="text-red-500 text-xs font-bold uppercase tracking-widest ml-1">{errors.title.message}</p>}
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">État du produit</label>
                                    <div className="grid grid-cols-2 gap-4">
                                        <label className={cn(
                                            "flex items-center justify-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                                            watch('condition') === 'new'
                                                ? "border-orange-600 bg-orange-50 text-orange-700 font-bold"
                                                : "border-zinc-100 bg-white text-zinc-600 hover:border-orange-200"
                                        )}>
                                            <input type="radio" value="new" {...register('condition')} className="hidden" />
                                            <Sparkles className={cn("w-5 h-5", watch('condition') === 'new' ? "text-orange-600 fill-orange-600/20" : "text-zinc-400")} />
                                            <span>Neuf</span>
                                        </label>
                                        <label className={cn(
                                            "flex items-center justify-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all",
                                            watch('condition') === 'used'
                                                ? "border-amber-500 bg-amber-50 text-amber-700 font-bold"
                                                : "border-zinc-100 bg-white text-zinc-600 hover:border-amber-200"
                                        )}>
                                            <input type="radio" value="used" {...register('condition')} className="hidden" />
                                            <Tag className={cn("w-5 h-5", watch('condition') === 'used' ? "text-amber-500 fill-amber-500/20" : "text-zinc-400")} />
                                            <span>Occasion</span>
                                        </label>
                                    </div>
                                    {errors.condition && <p className="text-red-500 text-xs font-bold uppercase tracking-widest ml-1">{errors.condition.message}</p>}
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Description détaillée</label>
                                    <textarea
                                        {...register('description')}
                                        className="w-full min-h-[220px] p-6 text-lg rounded-[2rem] border border-zinc-100 bg-white focus:ring-4 focus:ring-orange-50 focus:border-orange-500 outline-none transition-all placeholder:text-zinc-300"
                                        placeholder="Décrivez l'état de l'objet, ses fonctionnalités, les accessoires fournis, la raison de la vente..."
                                    />
                                    <div className="flex items-center gap-2 text-zinc-400 bg-zinc-50 p-3 rounded-xl">
                                        <Info size={14} className="text-orange-500" />
                                        <p className="text-[10px] font-bold uppercase tracking-widest">Une description riche augmente vos chances de vente de 40%</p>
                                    </div>
                                    {errors.description && <p className="text-red-500 text-xs font-bold uppercase tracking-widest ml-1">{errors.description.message}</p>}
                                </div>
                            </div>

                            <div className="mt-12 flex items-center justify-between">
                                <Button type="button" variant="ghost" onClick={handleBack} className="h-11 px-6 rounded-xl font-black text-zinc-400 hover:text-zinc-900 transition-all flex items-center gap-2">
                                    <ChevronLeft className="w-5 h-5" />
                                    Retour
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleNext}
                                    className="h-11 px-8 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-sm shadow-xl shadow-orange-200 active:scale-95 transition-all flex items-center gap-3"
                                >
                                    Suivant
                                    <ChevronRight className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 3: Media */}
                {currentStep === 2 && (
                    <div className="animate-in slide-in-from-right-8 fade-in duration-500">
                        <div className="bg-white/80 backdrop-blur-2xl border border-white shadow-xl shadow-zinc-200/50 rounded-3xl p-6 md:p-8">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                                <div className="flex items-center gap-6">
                                    <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 shrink-0">
                                        <ImageIcon className="w-5 h-5" />
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Ajoutez des photos</h2>
                                        <p className="text-zinc-500 font-medium">Glissez vos plus belles photos ici (max 10)</p>
                                    </div>
                                </div>
                                <div className="bg-amber-50 text-amber-700 px-4 py-2 rounded-xl border border-amber-100 flex items-center gap-2 text-[10px] font-black uppercase tracking-widest">
                                    <Sparkles size={14} />
                                    Mode Pro Activé
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="group relative flex flex-col items-center justify-center w-full min-h-[300px] rounded-[2.5rem] border-4 border-dashed border-zinc-100 bg-white cursor-pointer hover:border-orange-200 hover:bg-orange-50/20 transition-all duration-500 overflow-hidden"
                                >
                                    <div className="flex flex-col items-center justify-center p-12 text-center transition-transform group-hover:scale-105 duration-500">
                                        <div className="w-16 h-16 rounded-3xl bg-orange-50 flex items-center justify-center mb-6 shadow-lg shadow-orange-100/50 group-hover:bg-orange-500 group-hover:text-white transition-all duration-500">
                                            <Upload className="w-8 h-8" />
                                        </div>
                                        <p className="text-xl font-black text-zinc-900 uppercase tracking-tight">Cliquez ou déposez vos images</p>
                                        <p className="text-sm text-zinc-400 mt-2 font-medium">Optimisation automatique des images HD</p>
                                    </div>
                                    <input
                                        type="file"
                                        ref={fileInputRef}
                                        className="hidden"
                                        multiple
                                        accept="image/*"
                                        onChange={handleImageChange}
                                    />
                                </div>

                                {previews.length > 0 && (
                                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-8">
                                        {previews.map((src, idx) => (
                                            <div key={idx} className="relative aspect-square rounded-[1.5rem] overflow-hidden group shadow-md border border-zinc-100 animate-in zoom-in duration-300">
                                                <Image src={src} alt="preview" fill className="object-cover transition-transform group-hover:scale-110 duration-500" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                    <button
                                                        type="button"
                                                        onClick={(e) => { e.stopPropagation(); removeImage(idx); }}
                                                        className="bg-white/20 backdrop-blur-md text-white rounded-full p-2.5 hover:bg-red-500 transition-colors"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                </div>
                                                {idx === 0 && (
                                                    <div className="absolute bottom-2 left-2 right-2 bg-orange-600 text-white text-[8px] font-black uppercase text-center py-1 rounded-lg tracking-widest">
                                                        Photo principale
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="mt-12 flex items-center justify-between">
                                <Button type="button" variant="ghost" onClick={handleBack} className="h-11 px-6 rounded-xl font-black text-zinc-400 hover:text-zinc-900 transition-all flex items-center gap-2">
                                    <ChevronLeft className="w-5 h-5" />
                                    Retour
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleNext}
                                    className="h-11 px-8 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-black text-sm shadow-xl shadow-orange-200 active:scale-95 transition-all flex items-center gap-3"
                                >
                                    Suivant
                                    <ChevronRight className="w-5 h-5" />
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Step 4: Final */}
                {currentStep === 3 && (
                    <div className="animate-in slide-in-from-right-8 fade-in duration-500">
                        <div className="bg-white/80 backdrop-blur-2xl border border-white shadow-xl shadow-zinc-200/50 rounded-3xl p-6 md:p-8">
                            <div className="flex items-center gap-6 mb-12 text-center md:text-left">
                                <div className="w-12 h-12 bg-orange-50 rounded-2xl flex items-center justify-center text-orange-600 shrink-0 mx-auto md:mx-0">
                                    <MapPin className="w-5 h-5" />
                                </div>
                                <div>
                                    <h2 className="text-xl font-black text-zinc-900 uppercase tracking-tight">Prix & Localisation</h2>
                                    <p className="text-zinc-500 font-medium">Dernière étape avant de publier</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                {/* Price Row - Professional Box */}
                                <div className="space-y-4">
                                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Prix de vente (MAD)</label>
                                    <div className="relative group">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-black text-zinc-300 group-focus-within:text-orange-500 transition-colors">MAD</div>
                                        <Input
                                            type="number"
                                            {...register('price')}
                                            className="h-12 md:h-14 pl-20 pr-8 text-xl font-black rounded-xl border-zinc-100 bg-zinc-50/50 focus:bg-white focus:ring-4 focus:ring-orange-50 focus:border-orange-500 transition-all shadow-sm"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    {errors.price && <p className="text-red-500 text-xs font-bold uppercase tracking-widest ml-1">{errors.price.message}</p>}
                                </div>

                                {/* Location Row: City and Neighborhood side-by-side */}
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Ville</label>
                                        <div className="relative group">
                                            <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-300 group-focus-within:text-orange-600 transition-colors pointer-events-none" />
                                            <select
                                                {...register('city')}
                                                className="h-12 w-full pl-16 pr-12 text-base font-bold rounded-xl border-zinc-100 bg-zinc-50/50 focus:bg-white focus:ring-4 focus:ring-orange-50 focus:border-orange-600 transition-all appearance-none cursor-pointer shadow-sm"
                                            >
                                                <option value="">Sélectionnez votre ville</option>
                                                {MOROCCAN_CITIES.map((region) => (
                                                    <optgroup key={region.region} label={region.region}>
                                                        {region.cities.map((city) => (
                                                            <option key={city} value={city}>
                                                                {city}
                                                            </option>
                                                        ))}
                                                    </optgroup>
                                                ))}
                                            </select>
                                            <div className="absolute right-6 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-300">
                                                <ChevronRight className="w-5 h-5 rotate-90" />
                                            </div>
                                        </div>
                                        {errors.city && <p className="text-red-500 text-xs font-bold uppercase tracking-widest ml-1">{errors.city.message}</p>}
                                    </div>

                                    <div className="space-y-4">
                                        <label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Quartier (Optionnel)</label>
                                        <div className="relative group">
                                            <Input
                                                {...register('neighborhood')}
                                                placeholder="ex: Maarif, Agdal, Guéliz..."
                                                className="h-12 px-6 text-base font-bold rounded-xl border-zinc-100 bg-zinc-50/50 focus:bg-white focus:ring-4 focus:ring-orange-50 focus:border-orange-600 transition-all shadow-sm"
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Phone Row: Under everything else */}
                                <div className="space-y-4">
                                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Numéro WhatsApp</label>
                                    <div className="relative group">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2">
                                            <svg viewBox="0 0 24 24" className="w-6 h-6 fill-[#25D366]" xmlns="http://www.w3.org/2000/svg"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.008-.57-.008-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" /></svg>
                                        </div>
                                        <Input
                                            {...register('phone')}
                                            placeholder="ex: 0612345678"
                                            className="h-16 pl-16 pr-6 text-xl font-bold rounded-3xl border-zinc-100 bg-zinc-50/50 focus:bg-white focus:ring-4 focus:ring-orange-50 focus:border-orange-600 transition-all shadow-sm"
                                        />
                                    </div>
                                    {errors.phone && <p className="text-red-500 text-xs font-bold uppercase tracking-widest ml-1">{errors.phone.message}</p>}
                                </div>

                                <div className="mt-16 bg-orange-50 p-8 rounded-[2rem] border border-orange-100">
                                    <div className="flex items-start gap-4">
                                        <CheckCircle2 className="w-6 h-6 text-orange-600 mt-1" />
                                        <div>
                                            <h4 className="font-black text-orange-900 uppercase tracking-tight">Récapitulatif & Confirmation</h4>
                                            <p className="text-sm text-orange-700 mt-1">En cliquant sur publier, vous acceptez nos conditions générales de vente. Votre annonce sera vérifiée sous 2h.</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="mt-12 flex items-center justify-between">
                                    <Button type="button" variant="ghost" onClick={handleBack} className="h-11 px-6 rounded-xl font-black text-zinc-400 hover:text-zinc-900 transition-all flex items-center gap-2">
                                        <ChevronLeft className="w-5 h-5" />
                                        Retour
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSubmitting}
                                        className="h-12 px-12 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-black text-base shadow-2xl shadow-orange-200 active:scale-95 transition-all flex items-center gap-4"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-6 h-6 animate-spin" />
                                                Publication...
                                            </>
                                        ) : (
                                            <>
                                                Publier maintenant
                                                <Sparkles className="w-6 h-6 fill-white/20" />
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </form>
        </div>
    );
}
