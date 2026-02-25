import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";

const isPublicRoute = createRouteMatcher([
  "/sign-in",
  "/sign-in(.*)",
  "/sign-up",
  "/sign-up(.*)",
]);

export default clerkMiddleware((auth, req) => {
  if (!isPublicRoute(req)) {
    auth().protect();
  }
});

export const config = {
  matcher: [
    // Protect all routes except static files & _next
    "/((?!_next|.*\\..*).*)",
    "/(api|trpc)(.*)",
  ],
};