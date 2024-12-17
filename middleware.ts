import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs";
import { NextRequest, NextResponse } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();

  // Crée une instance du middleware client Supabase
  const supabase = createMiddlewareClient({ req, res });

  // Récupère la session de l'utilisateur
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  // **1. Exclure les routes publiques**
  if (pathname.startsWith("/login") || pathname.startsWith("/signup")) {
    return res; // Ne pas vérifier la session sur ces routes
  }

  // **2. Si la session est absente, rediriger vers /login**
  if (!session) {
    const redirectUrl = new URL("/login", req.url);
    redirectUrl.searchParams.set("redirectedFrom", pathname); // Ajouter un paramètre pour la redirection
    return NextResponse.redirect(redirectUrl);
  }

  // **3. Retourner la réponse par défaut si l'utilisateur est authentifié**
  return res;
}

// **4. Matcher les routes protégées uniquement**
export const config = {
  matcher: [
    // Protège toutes les routes sauf les statiques, API et publiques
    "/((?!api|_next/static|_next/image|favicon.ico|login|signup).*)",
  ],
};
