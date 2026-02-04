"use client"

import { useState, useRef } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Upload, X, Loader2, Smartphone, Car, Shirt,
    Home, CheckCircle2, ChevronRight, ChevronLeft,
    Image as ImageIcon, MapPin, Tag, FileText,
    Sparkles, Info, Star, Laptop, Package
} from 'lucide-react';
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
    { id: 'electronics', label: 'Électronique', icon: Laptop, color: 'text-blue-500', bg: 'bg-blue-50/50', border: 'border-blue-100' },
    { id: 'vehicles', label: 'Véhicules', icon: Car, color: 'text-orange-500', bg: 'bg-orange-50/50', border: 'border-orange-100' },
    { id: 'home', label: 'Maison', icon: Home, color: 'text-emerald-500', bg: 'bg-emerald-50/50', border: 'border-emerald-100' },
    { id: 'fashion', label: 'Mode', icon: Shirt, color: 'text-pink-500', bg: 'bg-pink-50/50', border: 'border-pink-100' },
    { id: 'luxury', label: 'Luxe', icon: Star, color: 'text-amber-500', bg: 'bg-amber-50/50', border: 'border-amber-100' },
    { id: 'other', label: 'Autres', icon: Package, color: 'text-zinc-500', bg: 'bg-zinc-50/50', border: 'border-zinc-100' },
];

const STEPS = [
    { id: 'category', label: 'Catégorie', icon: Tag },
    { id: 'details', label: 'Détails', icon: FileText },
    { id: 'media', label: 'Photos', icon: ImageIcon },
    { id: 'final', label: 'Prix & Lieu', icon: MapPin },
];

export default function AdPostForm() {
    const [currentStep, setCurrentStep] = useState(0);
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>([]);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { register, handleSubmit, setValue, watch, trigger, formState: { errors } } = useForm<AdFormValues>({
        resolver: zodResolver(adSchema) as any,
        defaultValues: {
            category: '',
            title: '',
            description: '',
            location: '',
            price: ''
        }
    });

    const selectedCategory = watch('category');

    const handleNext = async () => {
        let fieldsToValidate: (keyof AdFormValues)[] = [];

        if (currentStep === 0) fieldsToValidate = ['category'];
        if (currentStep === 1) fieldsToValidate = ['title', 'description'];
        if (currentStep === 3) fieldsToValidate = ['price', 'location'];

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
        setImages(prev => prev.filter((_, i) => i !== index));
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const onSubmit = async (data: AdFormValues) => {
        setIsSubmitting(true);
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) throw new Error("Vous devez être connecté pour publier une annonce.");

            // 1. Upload Images
            const uploadedUrls = [];
            for (const file of images) {
                // Sanitize filename: remove special chars and spaces
                const cleanName = file.name.replace(/[^\w.-]/g, '_');
                const fileName = `${user.id}/${Date.now()}-${cleanName}`;

                const { error: uploadError } = await supabase.storage
                    .from('ad-images')
                    .upload(fileName, file);

                if (uploadError) {
                    // Check if bucket exists error or permission
                    if (uploadError.message.includes('bucket not found')) {
                        throw new Error("Le compartiment de stockage 'ad-images' n'existe pas. Veuillez le créer dans le tableau de bord Supabase.");
                    }
                    throw uploadError;
                }

                const { data: { publicUrl } } = supabase.storage
                    .from('ad-images')
                    .getPublicUrl(fileName);

                uploadedUrls.push(publicUrl);
            }

            // 2. Generate Slug (to match our database unique constraint)
            const baseSlug = data.title
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '')
                .replace(/[\s_-]+/g, '-')
                .replace(/^-+|-+$/g, '');
            const uniqueId = Math.random().toString(36).substring(2, 7);
            const slug = `${baseSlug}-${uniqueId}`;

            // 3. Map Location
            // We'll split location into city and neighborhood if possible
            const locParts = data.location.split(',').map(s => s.trim());
            const city = locParts[0] || data.location;
            const neighborhood = locParts[1] || null;

            // 4. Insert Ad Record
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
                    category: data.category,
                    image_urls: uploadedUrls,
                    status: 'pending'
                })
                .select('id')
                .single();

            if (insertError) throw insertError;
            setIsSuccess(true);
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
                <div className="w-24 h-24 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-blue-200">
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
                    <Button onClick={() => window.location.href = '/'} className="h-12 px-8 rounded-xl font-bold bg-blue-600">
                        Retour à l'accueil
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Progress Bar */}
            <div className="mb-12 px-4">
                <div className="flex justify-between items-center relative">
                    {/* Line behind steps */}
                    <div className="absolute top-1/2 left-0 w-full h-0.5 bg-zinc-100 -translate-y-1/2 z-0" />
                    <div
                        className="absolute top-1/2 left-0 h-0.5 bg-blue-600 -translate-y-1/2 z-0 transition-all duration-500 ease-in-out"
                        style={{ width: `${(currentStep / (STEPS.length - 1)) * 100}%` }}
                    />

                    {STEPS.map((step, idx) => {
                        const isCompleted = currentStep > idx;
                        const isActive = currentStep === idx;
                        const StepIcon = step.icon;

                        return (
                            <div key={idx} className="relative z-10 flex flex-col items-center gap-3">
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500 border-4",
                                    isCompleted ? "bg-blue-600 border-blue-50 text-white" :
                                        isActive ? "bg-white border-blue-600 text-blue-600 shadow-xl shadow-blue-100" :
                                            "bg-white border-zinc-100 text-zinc-300"
                                )}>
                                    {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : <StepIcon className="w-5 h-5" />}
                                </div>
                                <span className={cn(
                                    "text-[10px] font-black uppercase tracking-widest transition-colors duration-300",
                                    isActive ? "text-blue-600" : "text-zinc-400"
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
                            <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 mx-auto mb-6">
                                <Tag className="w-8 h-8" />
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
                                                "relative flex flex-col items-center justify-center gap-4 p-6 rounded-3xl border-2 transition-all duration-300 group hover:scale-[1.03]",
                                                isSelected
                                                    ? "border-blue-600 bg-blue-50/50 shadow-xl shadow-blue-100/50"
                                                    : "border-zinc-50 bg-zinc-50/50 hover:bg-white hover:border-blue-100 hover:shadow-xl hover:shadow-zinc-100"
                                            )}
                                        >
                                            <div className={cn("p-4 rounded-2xl transition-all duration-300 group-hover:scale-110", cat.bg)}>
                                                <Icon className={cn("h-8 w-8", cat.color)} />
                                            </div>
                                            <span className={cn("text-xs font-black uppercase tracking-widest", isSelected ? "text-blue-700" : "text-zinc-500 group-hover:text-zinc-900")}>
                                                {cat.label}
                                            </span>
                                            {isSelected && (
                                                <div className="absolute top-4 right-4 text-blue-600">
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
                                    className="h-14 px-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg shadow-xl shadow-blue-200 active:scale-95 transition-all flex items-center gap-3"
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
                        <div className="bg-white/80 backdrop-blur-2xl border border-white shadow-2xl shadow-zinc-200/50 rounded-[2.5rem] p-8 md:p-12">
                            <div className="flex items-center gap-6 mb-10">
                                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                                    <FileText className="w-7 h-7" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-zinc-900 uppercase tracking-tight">Détails de l'article</h2>
                                    <p className="text-zinc-500 font-medium">Décrivez votre produit pour attirer plus d'acheteurs</p>
                                </div>
                            </div>

                            <div className="space-y-8">
                                <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Titre de l'annonce</label>
                                    <Input
                                        {...register('title')}
                                        placeholder="ex: iPhone 15 Pro Max - Comme neuf"
                                        className="h-14 md:h-16 px-6 text-lg rounded-2xl border-zinc-100 bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all"
                                    />
                                    {errors.title && <p className="text-red-500 text-xs font-bold uppercase tracking-widest ml-1">{errors.title.message}</p>}
                                </div>

                                <div className="space-y-3">
                                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Description détaillée</label>
                                    <textarea
                                        {...register('description')}
                                        className="w-full min-h-[220px] p-6 text-lg rounded-[2rem] border border-zinc-100 bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 outline-none transition-all placeholder:text-zinc-300"
                                        placeholder="Décrivez l'état de l'objet, ses fonctionnalités, les accessoires fournis, la raison de la vente..."
                                    />
                                    <div className="flex items-center gap-2 text-zinc-400 bg-zinc-50 p-3 rounded-xl">
                                        <Info size={14} className="text-blue-500" />
                                        <p className="text-[10px] font-bold uppercase tracking-widest">Une description riche augmente vos chances de vente de 40%</p>
                                    </div>
                                    {errors.description && <p className="text-red-500 text-xs font-bold uppercase tracking-widest ml-1">{errors.description.message}</p>}
                                </div>
                            </div>

                            <div className="mt-12 flex items-center justify-between">
                                <Button type="button" variant="ghost" onClick={handleBack} className="h-14 px-8 rounded-2xl font-black text-zinc-400 hover:text-zinc-900 transition-all flex items-center gap-2">
                                    <ChevronLeft className="w-5 h-5" />
                                    Retour
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleNext}
                                    className="h-14 px-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg shadow-xl shadow-blue-200 active:scale-95 transition-all flex items-center gap-3"
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
                        <div className="bg-white/80 backdrop-blur-2xl border border-white shadow-2xl shadow-zinc-200/50 rounded-[2.5rem] p-8 md:p-12">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0">
                                        <ImageIcon className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h2 className="text-3xl font-black text-zinc-900 uppercase tracking-tight">Ajoutez des photos</h2>
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
                                    className="group relative flex flex-col items-center justify-center w-full min-h-[300px] rounded-[2.5rem] border-4 border-dashed border-zinc-100 bg-white cursor-pointer hover:border-blue-200 hover:bg-blue-50/20 transition-all duration-500 overflow-hidden"
                                >
                                    <div className="flex flex-col items-center justify-center p-12 text-center transition-transform group-hover:scale-105 duration-500">
                                        <div className="w-20 h-20 rounded-3xl bg-blue-50 flex items-center justify-center mb-6 shadow-lg shadow-blue-100/50 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                                            <Upload className="w-10 h-10" />
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
                                                    <div className="absolute bottom-2 left-2 right-2 bg-blue-600 text-white text-[8px] font-black uppercase text-center py-1 rounded-lg tracking-widest">
                                                        Photo principale
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="mt-12 flex items-center justify-between">
                                <Button type="button" variant="ghost" onClick={handleBack} className="h-14 px-8 rounded-2xl font-black text-zinc-400 hover:text-zinc-900 transition-all flex items-center gap-2">
                                    <ChevronLeft className="w-5 h-5" />
                                    Retour
                                </Button>
                                <Button
                                    type="button"
                                    onClick={handleNext}
                                    className="h-14 px-12 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-lg shadow-xl shadow-blue-200 active:scale-95 transition-all flex items-center gap-3"
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
                        <div className="bg-white/80 backdrop-blur-2xl border border-white shadow-2xl shadow-zinc-200/50 rounded-[2.5rem] p-8 md:p-12">
                            <div className="flex items-center gap-6 mb-12 text-center md:text-left">
                                <div className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 shrink-0 mx-auto md:mx-0">
                                    <MapPin className="w-7 h-7" />
                                </div>
                                <div>
                                    <h2 className="text-3xl font-black text-zinc-900 uppercase tracking-tight">Prix & Localisation</h2>
                                    <p className="text-zinc-500 font-medium">Dernière étape avant de publier</p>
                                </div>
                            </div>

                            <div className="grid md:grid-cols-2 gap-8 md:gap-12">
                                <div className="space-y-4">
                                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Prix de vente (MAD)</label>
                                    <div className="relative group">
                                        <div className="absolute left-6 top-1/2 -translate-y-1/2 text-xl font-black text-zinc-400 group-focus-within:text-blue-600 transition-colors">MAD</div>
                                        <Input
                                            type="number"
                                            {...register('price')}
                                            className="h-16 md:h-20 pl-20 pr-8 text-2xl font-black rounded-3xl border-zinc-100 bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all"
                                            placeholder="0.00"
                                        />
                                    </div>
                                    <div className="bg-emerald-50 p-4 rounded-2xl border border-emerald-100 text-[10px] font-bold text-emerald-700 uppercase tracking-widest text-center">
                                        Prix conseillé : Entre 500 et 800 MAD
                                    </div>
                                    {errors.price && <p className="text-red-500 text-xs font-bold uppercase tracking-widest ml-1">{errors.price.message}</p>}
                                </div>

                                <div className="space-y-4">
                                    <label className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1">Ville & Quartier</label>
                                    <div className="relative group">
                                        <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-zinc-400 group-focus-within:text-blue-600 transition-colors" />
                                        <Input
                                            {...register('location')}
                                            placeholder="ex: Casablanca, Maarif"
                                            className="h-16 md:h-20 pl-16 pr-8 text-lg font-bold rounded-3xl border-zinc-100 bg-white focus:ring-4 focus:ring-blue-50 focus:border-blue-600 transition-all"
                                        />
                                    </div>
                                    <p className="text-[10px] text-zinc-400 font-bold uppercase tracking-widest ml-1">Précisez le quartier pour plus de pertinence</p>
                                    {errors.location && <p className="text-red-500 text-xs font-bold uppercase tracking-widest ml-1">{errors.location.message}</p>}
                                </div>
                            </div>

                            <div className="mt-16 bg-blue-50 p-8 rounded-[2rem] border border-blue-100">
                                <div className="flex items-start gap-4">
                                    <CheckCircle2 className="w-6 h-6 text-blue-600 mt-1" />
                                    <div>
                                        <h4 className="font-black text-blue-900 uppercase tracking-tight">Récapitulatif & Confirmation</h4>
                                        <p className="text-sm text-blue-700 mt-1">En cliquant sur publier, vous acceptez nos conditions générales de vente. Votre annonce sera vérifiée sous 2h.</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 flex items-center justify-between">
                                <Button type="button" variant="ghost" onClick={handleBack} className="h-14 px-8 rounded-2xl font-black text-zinc-400 hover:text-zinc-900 transition-all flex items-center gap-2">
                                    <ChevronLeft className="w-5 h-5" />
                                    Retour
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="h-16 px-16 rounded-[1.8rem] bg-blue-600 hover:bg-blue-700 text-white font-black text-xl shadow-2xl shadow-blue-200 active:scale-95 transition-all flex items-center gap-4"
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
                )}
            </form>
        </div>
    );
}
