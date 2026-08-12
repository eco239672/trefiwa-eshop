import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  // 1. Získame token z cookies
  const token = request.cookies.get("trefiwa_session")?.value;

  // 2. Kontrolujeme len cesty, ktoré začínajú na "/ucet"
  if (request.nextUrl.pathname.startsWith("/ucet")) {
    
    // Ak neexistuje žiadna cookie (používateľ nie je prihlásený) -> presmerovať na domov
    if (!token) {
      return NextResponse.redirect(new URL("/", request.url));
    }

    // Ak cookie existuje, musíme overiť, či je to pravý, platný JWT token
    try {
      const secretKey = process.env.JWT_SECRET || "nahradny-tajny-kluc";
      const encodedKey = new TextEncoder().encode(secretKey);
      
      await jwtVerify(token, encodedKey);
      
      // Token je platný, pustíme používateľa na stránku
      return NextResponse.next();
    } catch (error) {
      // Ak je token starý, expirovaný alebo sfalšovaný -> presmerovať na domov
      return NextResponse.redirect(new URL("/", request.url));
    }
  }

  // Pre všetky ostatné stránky (/, /caje, /kosik atď.) nerobíme nič, pustíme ich normálne
  return NextResponse.next();
}

// Pridáme matcher, aby middleware zbytočne nebežal pri každom obrázku alebo CSS súbore,
// ale iba vtedy, keď sa niekto snaží dostať do sekcie /ucet
export const config = {
  matcher: ["/ucet/:path*"],
};