"use client"

import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
    Upload, X, Loader2, Smartphone, Car, Shirt,
    CheckCircle2, Star,
    Image as ImageIcon, MapPin, Tag,
    Sparkles, Package, Armchair, Hammer, Gamepad2, PawPrint, BookOpen
} from 'lucide-react';
import Image from 'next/image';
import dynamic from "next/dynamic";

const AdLocationPicker = dynamic(
    () => import('./AdLocationPicker').then((mod) => mod.AdLocationPicker),
    { 
        ssr: false, 
        loading: () => <div className="h-[300px] w-full bg-zinc-100 animate-pulse rounded-2xl flex items-center justify-center text-zinc-400 text-xs font-bold uppercase tracking-widest">Chargement de la carte...</div> 
    }
);

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { supabase } from '@/lib/supabaseClient';
import { MOROCCAN_CITIES } from '@/lib/constants/cities';
import { toast } from 'sonner';
import { createAdAction, updateAdAction } from '@/app/dashboard/ads/ad-actions';

const adSchema = z.object({
    title: z.string().min(5, "Le titre doit contenir au moins 5 caractères"),
    price: z.coerce.number().min(1, "Le prix doit être supérieur à 0"),
    category: z.string().min(1, "Veuillez sélectionner une catégorie"),
    description: z.string().min(20, "La description doit être détaillée (min 20 caractères)"),
    city: z.string().min(1, "La ville est requise"),
    neighborhood: z.string().optional(),
    phone: z.string().min(10, "Le numéro de téléphone est requis (min 10 chiffres)"),
    condition: z.enum(['new', 'used'], { message: "L'état du produit est requis" }),
    latitude: z.number().nullable().optional(),
    longitude: z.number().nullable().optional(),
});

type AdFormValues = z.infer<typeof adSchema>;

const CATEGORIES = [
    { id: 'electronics', label: 'Électronique', icon: Smartphone, color: 'text-orange-500', bg: 'bg-orange-50/50', border: 'border-orange-100' },
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

interface AdPostFormProps {
    mode?: 'create' | 'edit';
    initialData?: Partial<AdFormValues> & { id?: string; image_urls?: string[] };
    onSuccess?: () => void;
}

export default function AdPostForm({ mode = 'create', initialData, onSuccess }: AdPostFormProps) {
    const [images, setImages] = useState<File[]>([]);
    const [previews, setPreviews] = useState<string[]>(initialData?.image_urls || []);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const { register, handleSubmit, setValue, watch, formState: { errors } } = useForm<AdFormValues>({
        resolver: zodResolver(adSchema) as any,
        defaultValues: {
            category: initialData?.category || '',
            title: initialData?.title || '',
            description: initialData?.description || '',
            city: (initialData as any)?.city || '',
            neighborhood: (initialData as any)?.neighborhood || '',
            phone: (initialData as any)?.phone || '',
            price: initialData?.price ? Number(initialData.price) : 0,
            condition: (initialData as any)?.condition || 'used',
            latitude: (initialData as any)?.latitude || null,
            longitude: (initialData as any)?.longitude || null
        }
    });

    const selectedCategory = watch('category');

    useEffect(() => {
        const fetchUserData = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data: profile } = await supabase
                    .from('profiles')
                    .select('phone, city')
                    .eq('id', user.id)
                    .single();

                if (profile) {
                    if (profile.phone && !watch('phone')) setValue('phone', profile.phone);
                    if (profile.city && !watch('city')) setValue('city', profile.city);
                }
            }
        };
        fetchUserData();
    }, [setValue, watch]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        const newFiles = Array.from(files);
        const remainingSlots = 10 - previews.length;
        const filesToAdd = newFiles.slice(0, remainingSlots);

        if (filesToAdd.length < newFiles.length) toast.error("Max 10 photos.");
        if (filesToAdd.length > 0) {
            setImages(prev => [...prev, ...filesToAdd]);
            const newPreviews = filesToAdd.map(file => URL.createObjectURL(file));
            setPreviews(prev => [...prev, ...newPreviews]);
        }
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const removeImage = (index: number) => {
        const previewToRemove = previews[index];
        if (previewToRemove.startsWith('blob:')) {
            const blobIndex = previews.slice(0, index).filter(p => p.startsWith('blob:')).length;
            setImages(prev => prev.filter((_, i) => i !== blobIndex));
        }
        setPreviews(prev => prev.filter((_, i) => i !== index));
    };

    const setMainImage = (index: number) => {
        if (index === 0) return;
        const newPreviews = [...previews];
        const [movedPreview] = newPreviews.splice(index, 1);
        newPreviews.unshift(movedPreview);
        setPreviews(newPreviews);

        const previewToMove = previews[index];
        if (previewToMove.startsWith('blob:')) {
            const blobIndex = previews.slice(0, index).filter(p => p.startsWith('blob:')).length;
            const newImages = [...images];
            const [movedFile] = newImages.splice(blobIndex, 1);
            newImages.unshift(movedFile);
            setImages(newImages);
        }
    };

    const onSubmit = async (data: AdFormValues) => {
        if (previews.length === 0) {
            toast.error("Veuillez ajouter au moins une photo");
            return;
        }
        setIsSubmitting(true);
        try {
            const newUploadedUrls = [];
            const tempAdId = initialData?.id || `temp-${Math.random().toString(36).substring(2, 7)}`;
            
            for (const file of images) {
                const formData = new FormData();
                formData.append('file', file);
                formData.append('adId', tempAdId);
                const response = await fetch('/api/ads/upload-seo', { method: 'POST', body: formData });
                if (!response.ok) throw new Error("Échec du traitement de l'image");
                const { url } = await response.json();
                newUploadedUrls.push(url);
            }

            const existingUrls = (initialData?.image_urls || []).filter(url => previews.includes(url));
            const finalImageUrls = [...existingUrls, ...newUploadedUrls];

            const adPayload = {
                ...data,
                image_urls: finalImageUrls,
                price: Number(data.price)
            } as any;

            let result;
            if (mode === 'edit' && initialData?.id) {
                result = await updateAdAction(initialData.id, adPayload);
            } else {
                result = await createAdAction(adPayload);
            }

            if (!result.success) throw new Error(result.error);

            setIsSuccess(true);
            window.scrollTo({ top: 0, behavior: 'smooth' });
            window.dispatchEvent(new CustomEvent('trigger-push-prompt'));
            if (onSuccess) onSuccess();
        } catch (error: any) {
            console.error("Ad Publication Error:", error);
            toast.error(`Échec: ${error.message || "Une erreur inconnue"}`);
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
                <p className="text-zinc-500 text-lg mb-10 max-w-md mx-auto leading-relaxed">
                    تم نشر إعلانك بنجاح. سيتم مراجعته من قبل فريقنا قريباً.
                </p>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button onClick={() => window.location.href = '/dashboard/ads'} variant="outline" className="h-14 px-8 rounded-2xl font-bold border-zinc-200 hover:bg-zinc-50 transition-all">
                        Voir mes annonces
                    </Button>
                    <Button onClick={() => { setIsSuccess(false); setImages([]); setPreviews([]); }} className="h-14 px-8 rounded-2xl font-bold bg-orange-600 hover:bg-orange-700 shadow-xl shadow-orange-200 transition-all text-white">
                        Publier une autre
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit(onSubmit as any)} className="max-w-5xl mx-auto space-y-8 pb-20">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 text-left" dir="ltr">
                {/* Left Column: Media & Price */}
                <div className="lg:col-span-1 space-y-8">
                    {/* Photos Section */}
                    <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-6 shadow-sm border border-zinc-100 space-y-6">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center text-orange-600">
                                <ImageIcon size={20} />
                            </div>
                            <h3 className="font-black uppercase text-xs tracking-widest text-zinc-900">Photos (Max 10)</h3>
                        </div>

                        <div 
                            onClick={() => fileInputRef.current?.click()}
                            className="aspect-square rounded-3xl border-4 border-dashed border-zinc-50 bg-zinc-50/50 flex flex-col items-center justify-center cursor-pointer hover:bg-orange-50/30 hover:border-orange-100 transition-all group"
                        >
                            <Upload className="w-10 h-10 text-zinc-300 group-hover:text-orange-500 transition-colors mb-2" />
                            <p className="text-[10px] font-black uppercase text-zinc-400 group-hover:text-orange-600">Ajouter des photos</p>
                            <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" onChange={handleImageChange} />
                        </div>

                        {previews.length > 0 && (
                            <div className="grid grid-cols-3 gap-2">
                                {previews.map((src, idx) => (
                                    <div key={idx} className="relative aspect-square rounded-xl overflow-hidden border border-zinc-100 group">
                                        <Image src={src} alt="Preview" fill className="object-cover" />
                                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                            <button type="button" onClick={(e) => { e.stopPropagation(); setMainImage(idx); }} className="p-1.5 bg-white text-orange-600 rounded-lg hover:bg-orange-600 hover:text-white transition-colors">
                                                <Star size={12} fill={idx === 0 ? "currentColor" : "none"} />
                                            </button>
                                            <button type="button" onClick={(e) => { e.stopPropagation(); removeImage(idx); }} className="p-1.5 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors">
                                                <X size={12} />
                                            </button>
                                        </div>
                                        {idx === 0 && <div className="absolute top-1 left-1 bg-orange-600 text-[8px] font-black text-white px-1.5 py-0.5 rounded-md">Principal</div>}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Price & Condition */}
                    <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-6 shadow-sm border border-zinc-100 space-y-6">
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Prix (MAD)</Label>
                            <div className="relative">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-zinc-300">MAD</span>
                                <Input {...register('price')} type="number" className="pl-14 h-12 rounded-xl border-zinc-100 bg-zinc-50/50 font-black text-lg" placeholder="0.00" />
                            </div>
                            {errors.price && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.price.message}</p>}
                        </div>

                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400">État</Label>
                            <div className="grid grid-cols-2 gap-2">
                                {(['new', 'used'] as const).map((cond) => (
                                    <button
                                        key={cond}
                                        type="button"
                                        onClick={() => setValue('condition', cond)}
                                        className={cn(
                                            "h-12 rounded-xl border-2 font-bold text-xs uppercase tracking-widest transition-all",
                                            watch('condition') === cond ? "border-orange-600 bg-orange-50 text-orange-700" : "border-zinc-50 bg-zinc-50/50 text-zinc-400"
                                        )}
                                    >
                                        {cond === 'new' ? 'Neuf' : 'Occasion'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Main Info */}
                <div className="lg:col-span-2 space-y-8">
                    {/* Details Section */}
                    <div className="bg-white dark:bg-zinc-900 rounded-[2.5rem] p-8 md:p-10 shadow-sm border border-zinc-100 space-y-8">
                        <div className="space-y-6">
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Catégorie</Label>
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                                    {CATEGORIES.map((cat) => (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => setValue('category', cat.id)}
                                            className={cn(
                                                "flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all",
                                                selectedCategory === cat.id ? "border-orange-500 bg-orange-50/30 scale-105 shadow-sm" : "border-zinc-50 bg-zinc-50/30 hover:border-orange-100"
                                            )}
                                        >
                                            <div className={cn("p-2 rounded-xl", cat.bg)}>
                                                <cat.icon className={cn("w-4 h-4", cat.color)} />
                                            </div>
                                            <span className={cn("text-[9px] font-black uppercase text-center", selectedCategory === cat.id ? "text-orange-700" : "text-zinc-500")}>{cat.label}</span>
                                        </button>
                                    ))}
                                </div>
                                {errors.category && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.category.message}</p>}
                            </div>

                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Titre de l'annonce</Label>
                                <Input {...register('title')} className="h-14 px-6 text-base rounded-2xl border-zinc-100 bg-zinc-50/30 focus:bg-white transition-all" placeholder="ex: iPhone 15 Pro Max 256GB..." />
                                {errors.title && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.title.message}</p>}
                            </div>

                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Description détaillée</Label>
                                <Textarea {...register('description')} className="min-h-[200px] p-6 text-base rounded-[2rem] border-zinc-100 bg-zinc-50/30 focus:bg-white resize-none transition-all" placeholder="Décrivez votre article (état, accessoires, raison de vente...)" />
                                {errors.description && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.description.message}</p>}
                            </div>
                        </div>

                        <div className="grid md:grid-cols-3 gap-6">
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Ville</Label>
                                <select {...register('city')} className="w-full h-14 px-6 rounded-2xl border-2 border-zinc-100 bg-zinc-50/30 font-bold focus:border-orange-500 transition-all appearance-none cursor-pointer text-sm">
                                    <option value="">Sélectionnez une ville</option>
                                    {MOROCCAN_CITIES.map(region => (
                                        <optgroup key={region.region} label={region.region}>
                                            {region.cities.map(city => <option key={city} value={city}>{city}</option>)}
                                        </optgroup>
                                    ))}
                                </select>
                                {errors.city && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.city.message}</p>}
                            </div>
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Quartier / الحي</Label>
                                <Input {...register('neighborhood')} className="h-14 px-6 rounded-2xl border-zinc-100 bg-zinc-50/30 font-bold" placeholder="Ex: Maarif, Agdal..." />
                                {errors.neighborhood && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.neighborhood.message}</p>}
                            </div>
                            <div className="space-y-4">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Téléphone</Label>
                                <Input {...register('phone')} className="h-14 px-6 rounded-2xl border-zinc-100 bg-zinc-50/30 font-bold" placeholder="06XXXXXXXX" />
                                {errors.phone && <p className="text-red-500 text-[10px] font-bold uppercase">{errors.phone.message}</p>}
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 text-left">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1 flex items-center gap-2">
                                <MapPin size={14} className="text-orange-500" /> Localisation sur la carte (Optionnel)
                            </Label>
                            <AdLocationPicker 
                                latitude={watch('latitude') || null}
                                longitude={watch('longitude') || null}
                                onChange={(lat, lng) => {
                                    setValue('latitude', lat);
                                    setValue('longitude', lng);
                                }}
                                onAddressSelect={(address) => {
                                    if (address.city) {
                                        const cityExists = MOROCCAN_CITIES.some(region => 
                                            region.cities.some(c => c.toLowerCase() === address.city.toLowerCase())
                                        );
                                        if (cityExists) {
                                            const normalizedCity = MOROCCAN_CITIES
                                                .flatMap(r => r.cities)
                                                .find(c => c.toLowerCase() === address.city.toLowerCase());
                                            if (normalizedCity) setValue('city', normalizedCity, { shouldValidate: true });
                                        }
                                    }
                                    if (address.neighborhood) {
                                        setValue('neighborhood', address.neighborhood, { shouldValidate: true });
                                    }
                                }}
                            />
                        </div>

                        <div className="pt-8">
                            <Button 
                                type="submit" 
                                disabled={isSubmitting} 
                                className="w-full h-16 rounded-[1.5rem] bg-orange-600 hover:bg-orange-700 text-white font-black text-lg uppercase tracking-widest shadow-xl shadow-orange-200 transition-all active:scale-[0.98]"
                            >
                                {isSubmitting ? <Loader2 className="w-6 h-6 animate-spin" /> : mode === 'create' ? "Publier l'annonce maintenant" : "Enregistrer les modifications"}
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </form>
    );
}
