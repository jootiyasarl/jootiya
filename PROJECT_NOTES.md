# دفتر ملاحظات المشروع (Notebook)

## حالة المشروع الحالية

- **إطار العمل**
  - Next.js (App Router) مع TypeScript.
  - استخدام Supabase كخلفية (قاعدة بيانات / Auth) عبر `src/lib/supabaseClient.ts`.

## متغيرات البيئة (Supabase)

> القيم الحقيقية موجودة في ملف `.env.local` (غير مرفوع للـ git). لا تضع المفاتيح هنا.

- `NEXT_PUBLIC_SUPABASE_URL` → انظر `.env.local`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` → انظر `.env.local`
- `OPENAI_API_KEY` → انظر `.env.local`
- `VAPID_PUBLIC_KEY` / `VAPID_PRIVATE_KEY` → انظر `.env.local`

- **الصفحات الموجودة (Routes)**
  - `/` → الصفحة الرئيسية (`src/app/page.tsx`).
  - `/login` → صفحة تسجيل الدخول (`src/app/login/page.tsx`).
  - `/register` → صفحة إنشاء حساب (`src/app/register/page.tsx`).
  - `/marketplace` → صفحة السوق / الإعلانات (`src/app/marketplace/page.tsx`).
  - `/dashboard/profile` → صفحة البروفايل في لوحة التحكم (`src/app/dashboard/profile/page.tsx`).
  - `/dashboard/subscription` → صفحة الاشتراك في لوحة التحكم (`src/app/dashboard/subscription/page.tsx`).
  - `/post-ad/success` → صفحة نجاح نشر الإعلان (`src/app/post-ad/success/page.tsx`).

- **الهيكل العام للمشروع**
  - `src/app`
    - `layout.tsx` → الـ Layout الأساسي لكل الصفحات.
    - `globals.css` → أنماط CSS عامة للمشروع.
  - `src/components`
    - مكوّنات واجهة المستخدم (UI) ومكوّنات خاصة بالـ marketplace، والـ profile، والاشتراكات، والـ feedback.
  - `src/lib`
    - `supabaseClient.ts` → إعداد عميل Supabase.
    - `utils.ts` → دوال مساعدة عامة.
  - `src/config`
    - إعدادات عامة للمشروع.
  - `src/types`
    - أنواع (Types) لـ TypeScript للمكوّنات وباقي أجزاء المشروع.
  - `middleware.ts`
    - منطق يشتغل قبل الطلبات (غالبًا للحماية/التحقق من تسجيل الدخول).

## تقدم 2025-12-23

- **لوحة موافقة الإعلانات للمشرفين (Moderator ads approval)**
  - إنشاء واجهة مراجعة سريعة للإعلانات ذات الحالة `pending`.
  - المسار الأساسي للمشرفين: `/moderator/ads`.
  - تعيد استخدام المكوّن `ModeratorAdsPage` الموجود في `src/app/admin/moderation/ads/page.tsx`.
  - دعم سير عمل سريع مع اختصارات لوحة المفاتيح: A للموافقة، R للرفض، الأسهم ↑/↓ للتنقل بين الإعلانات.

- **لوحة تحليلات الأدمن (Admin analytics dashboard)**
  - إضافة المكوّن `AnalyticsDashboard` في `src/components/analytics/AnalyticsDashboard.tsx`.
  - صفحة الأدمن: `/admin/analytics`.
  - تعرض مؤشرات عالية المستوى:
    - عدد الإعلانات النشطة حسب المدينة (Ads per city).
    - أهم التصنيفات (Top categories) مع Pie chart.
    - نمو المستخدمين عبر الزمن (User growth) مع Line chart.
    - إيرادات كـ placeholder حالياً بانتظار ربط نظام الفوترة.

- **إعدادات الموقع (Site settings)**
  - إضافة المكوّن `SettingsManager` في `src/components/settings/SettingsManager.tsx`.
  - صفحة الأدمن: `/admin/settings`.
  - أقسام الإعدادات:
    - General information (الاسم، الـ tagline، الدومين الأساسي).
    - SEO defaults (العنوان والوصف الافتراضي وصورة الـ OG).
    - Legal pages (روابط الشروط وسياسة الخصوصية).
    - Contact information (الإيميل، الهاتف، العنوان).
  - تخزين الإعدادات في جدول `site_settings` في Supabase عبر صف واحد بالمعرّف `id = "site"`.

## تقدم 2026-06-01

- **تحسين الصفحة الرئيسية - المرحلة الأولى**
  - إعادة ترتيب أقسام الصفحة الرئيسية بدون لمس باقي الصفحات.
  - إضافة قسم `Arrivés récemment` لعرض أحدث الإعلانات.
  - إضافة قسم `Annonces proches` عند توفر بيانات المسافة من البحث القريب.
  - تحسين عناوين الأقسام بأيقونات وروابط `Voir tout` موحدة.
  - جعل كروت الكاروسيل أقل ازدحاماً على الهواتف الصغيرة جداً.
  - تنظيف أنواع `HomeClient.tsx` وفحصه عبر ESLint بنجاح.

## تقدم 2026-06-11

- **إصلاح مشكلة عدم ظهور بعض صور الإعلانات**
  - السبب الجذري: بعض الإعلانات تشير إلى ملفات صور غير موجودة في تخزين Supabase (تعطي 404)، غالباً بيانات تجريبية/مُدخلة يدوياً.
  - السبب المُفاقم: مكوّن `src/components/AdCard.tsx` (المستخدم في الصفحة الرئيسية وصفحات أخرى) كان **بدون معالج `onError`**، فيظهر رمز الصورة المكسور بدل بديل أنيق.
  - الإصلاح: تحويل `AdCard` إلى مكوّن عميل (`"use client"`) وإضافة `onError` يعرض البديل الموجود "No Image" عند فشل تحميل الصورة.
  - إصلاح إضافي مهم: حذف دالة `ensureFullUrl` التي كانت تحوّل أي مسار صورة نسبي إلى دومين الموقع `jootiya.com` بدل Supabase، وترك `getOptimizedImageUrl` تتولى تحويل مسارات التخزين النسبية إلى روابط Supabase صحيحة.
  - ملاحظة: لا يوجد ملف `placeholder-ad.png/.jpg` في `public/` (الـ fallback المرجعي في `ensureFullUrl`/`getOptimizedImageUrl` كود ميّت لأن البديل الفعلي هو div الـ "No Image").
  - لمعالجة جذرية كاملة: يُنصح بفحص قيم `image_urls` للإعلانات المعطوبة في قاعدة البيانات وحذف/تصحيح الروابط المفقودة.

## أفكار / خطوات قادمة محتملة

- **تحسين تجربة المستخدم**
  - مراجعة تصميم صفحات `login` و `register` و `marketplace` وتوحيد الـ UI.
- **إدارة الحالة (State) والـ Auth**
  - توثيق تدفّق تسجيل الدخول والتسجيل مع Supabase.
  - إضافة توثيق حول كيف يعمل `middleware.ts` مع الـ Auth.
- **الـ Dashboard**
  - توثيق ما هو موجود وما المخطط له في `dashboard/profile` و `dashboard/subscription`.

> يمكنك تعديل هذا الملف في أي وقت لإضافة ملاحظات جديدة عن التقدم، أو المهام المتبقية، أو أي أفكار تصميمية.
