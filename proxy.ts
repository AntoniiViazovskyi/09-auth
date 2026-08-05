import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { parseSetCookie } from 'cookie'
import { checkSession } from '@/lib/api/serverApi'

const privateRoutes = ['/notes', '/profile']
const publicRoutes = ['/sign-in', '/sign-up']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const isPrivateRoute = privateRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  )
  const isPublicRoute = publicRoutes.includes(pathname)

  let isAuthenticated = false
  let refreshedCookies: string[] = []
  try {
    const session = await checkSession(request.headers.get('cookie') ?? '')
    isAuthenticated = session.success
    refreshedCookies = session.setCookie
  } catch {
    isAuthenticated = false
  }

  let response: NextResponse
  if (isPrivateRoute && !isAuthenticated) {
    response = NextResponse.redirect(new URL('/sign-in', request.url))
  } else if (isPublicRoute && isAuthenticated) {
    response = NextResponse.redirect(new URL('/profile', request.url))
  } else {
    response = NextResponse.next()
  }

  for (const cookieString of refreshedCookies) {
    const parsed = parseSetCookie(cookieString)
    if (parsed.value) {
      response.cookies.set(parsed.name, parsed.value, parsed)
    }
  }

  return response
}

export const config = {
  matcher: ['/notes/:path*', '/profile/:path*', '/sign-in', '/sign-up']
}
