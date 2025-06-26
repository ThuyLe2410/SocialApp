import { clerkMiddleware } from '@clerk/nextjs/server'

console.log('Middleware is loading!')


export default clerkMiddleware((auth, req) => {
  // This ensures the middleware actually runs
  console.log('Clerk middleware running for:', req.url)
})

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}