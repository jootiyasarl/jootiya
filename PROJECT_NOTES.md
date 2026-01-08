# دفتر ملاحظات المشروع (Notebook)

## حالة المشروع الحالية

- **إطار العمل**
  - Next.js (App Router) مع TypeScript.
  - استخدام Supabase كخلفية (قاعدة بيانات / Auth) عبر `src/lib/supabaseClient.ts`.

## متغيرات البيئة (Supabase)

- `NEXT_PUBLIC_SUPABASE_URL`:
  `https://ssfcfvuosxxmvsdoktws.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`:
  `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNzZmNmdnVvc3h4bXZzZG9rdHdzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxMzQ0NTAsImV4cCI6MjA4MTcxMDQ1MH0.yapozcOEBlZ6kLtNs5nwt-CusuDQfojYq1nUZtH2AoE`

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

## أفكار / خطوات قادمة محتملة

- **تحسين تجربة المستخدم**
  - مراجعة تصميم صفحات `login` و `register` و `marketplace` وتوحيد الـ UI.
- **إدارة الحالة (State) والـ Auth**
  - توثيق تدفّق تسجيل الدخول والتسجيل مع Supabase.
  - إضافة توثيق حول كيف يعمل `middleware.ts` مع الـ Auth.
- **الـ Dashboard**
  - توثيق ما هو موجود وما المخطط له في `dashboard/profile` و `dashboard/subscription`.

> يمكنك تعديل هذا الملف في أي وقت لإضافة ملاحظات جديدة عن التقدم، أو المهام المتبقية، أو أي أفكار تصميمية.
