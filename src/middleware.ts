// 1. Admin Protection Logic
if (url.pathname.startsWith('/admin')) {
  // جلب جميع الكوكيز للبحث عن التوكن الصحيح
  const allCookies = request.cookies.getAll();
  const supabaseToken = allCookies.find(c => c.name.includes('-auth-token'))?.value;

  if (!supabaseToken) {
    console.log('Middleware: No Supabase token found');
    return NextResponse.redirect(new URL('/master-access', request.url));
  }

  const supabaseAdmin = getSupabaseAdmin();
  if (supabaseAdmin) {
    try {
      // استخدام getUser يضمن أن التوكن صحيح وغير مزور
      const { data: { user }, error } = await supabaseAdmin.auth.getUser(supabaseToken);
      
      if (error || !user) {
        return NextResponse.redirect(new URL('/master-access', request.url));
      }

      // التحقق الصارم من الإيميل
      if (user.email === 'jootiyasarl@gmail.com') {
        return NextResponse.next();
      }

      return NextResponse.redirect(new URL('/', request.url));
    } catch (e) {
      return NextResponse.redirect(new URL('/master-access', request.url));
    }
  }
}