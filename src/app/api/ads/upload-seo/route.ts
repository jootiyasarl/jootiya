import { NextResponse } from 'next/server';
import { processImageForSEO } from '@/lib/imageUtils';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function POST(request: Request) {
    try {
        const formData = await request.formData();
        const file = formData.get('file') as File;
        const adId = formData.get('adId') as string;

        if (!file || !adId) {
            return NextResponse.json({ error: 'Missing file or adId' }, { status: 400 });
        }

        const supabase = await createSupabaseServerClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Convert File to Buffer for Sharp
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);

        // Process Image: WebP + Quality 80% + Metadata Preservation
        const processedBuffer = await processImageForSEO(buffer);

        // Upload to Supabase Storage
        const fileName = `${user.id}/${adId}/${Date.now()}.webp`;
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('ad-images')
            .upload(fileName, processedBuffer, {
                contentType: 'image/webp',
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
            .from('ad-images')
            .getPublicUrl(fileName);

        return NextResponse.json({ url: publicUrl });
    } catch (error: any) {
        console.error('Image SEO Processing Route Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
