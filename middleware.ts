import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const rotasProtegidas = [
  "/dashboard",
  "/solicitacoes",
  "/diretor",
  "/patrimonio",
  "/projetos",
  "/orcamentos",
  "/aprovacao-final",
  "/execucao",
  "/relatorios",
  "/cadastros"
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const rotaProtegida = rotasProtegidas.some((rota) =>
    pathname.startsWith(rota)
  );

  if (!rotaProtegida) {
    return NextResponse.next();
  }

  const temTokenSupabase =
    request.cookies.get("investflow-auth")?.value === "true";

  if (!temTokenSupabase) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/solicitacoes/:path*",
    "/diretor/:path*",
    "/patrimonio/:path*",
    "/projetos/:path*",
    "/orcamentos/:path*",
    "/aprovacao-final/:path*",
    "/execucao/:path*",
    "/relatorios/:path*",
    "/cadastros/:path*"
  ]
};
