// src/middleware.ts
// CareerOS — Auth Middleware (Supabase SSR)
// Fix: request.cookies.set() hanya menerima (name, value), tidak support options.
// Response cookies yang set options sudah cukup untuk refresh session.

import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          // ✅ FIX: request.cookies.set hanya menerima (name, value)
          // options tidak didukung di NextRequest.cookies.set
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          )

          // Rebuild response agar cookies ikut di-forward ke browser
          response = NextResponse.next({ request })

          // ✅ Response cookies boleh dapat options (HttpOnly, SameSite, dll)
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // Refresh session — wajib dipanggil di middleware agar token tidak expire
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // ── Route protection ───────────────────────────────────────────────────

  // Belum login → redirect ke /login jika mencoba buka /dashboard
  if (!user && request.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Sudah login → redirect ke /dashboard jika membuka /login atau /register
  if (
    user &&
    (request.nextUrl.pathname === '/login' ||
      request.nextUrl.pathname === '/register')
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return response
}

export const config = {
  matcher: ['/dashboard/:path*', '/login', '/register', '/forgot-password', '/reset-password'],
}