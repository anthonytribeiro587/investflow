export type UserRole =
  | "admin"
  | "solicitante"
  | "diretoria"
  | "patrimonio"
  | "projetos"
  | "orcamentos"
  | "realizacoes";

export type DemoUser = {
  nome: string;
  email: string;
  perfil: UserRole;
  perfilLabel: string;
  vinculo: string;
  status: string;
};

export type UserScope = {
  perfil: UserRole;
  email?: string | null;
  filialId?: string | null;
  diretoriaId?: string | null;
  diretoriaNome?: string | null;
};

export const demoDiretorias = [
  {
    id: "9cdf2089-1296-4d09-a68e-625abdd6568a",
    nome: "Diretoria Operacional",
    diretor: "Diretor Operacional",
    email: "diretor1@investflowdemo.com",
  },
  {
    id: "b146f1af-8e16-4534-b51e-1b3389beaf4b",
    nome: "Diretoria Expansão",
    diretor: "Diretor Expansão",
    email: "diretor2@investflowdemo.com",
  },
  {
    id: "383b2a8a-47d9-4da2-980d-7fc6269d3715",
    nome: "Diretoria Administrativa",
    diretor: "Diretor Administrativo",
    email: "diretor3@investflowdemo.com",
  },
  {
    id: "2af079c3-9a1b-478a-a138-d4aac4f0de72",
    nome: "Diretoria Financeira",
    diretor: "Diretor Financeiro",
    email: "diretor4@investflowdemo.com",
  },
] as const;

const demoDiretoriaByEmail = Object.fromEntries(
  demoDiretorias.map((diretoria) => [diretoria.email, diretoria])
);

const demoDiretoriaById = Object.fromEntries(
  demoDiretorias.map((diretoria) => [diretoria.id, diretoria])
);

export function getDemoDirectorScopeByEmail(email?: string | null) {
  const normalizado = String(email ?? "").toLowerCase().trim();
  return demoDiretoriaByEmail[normalizado] ?? null;
}

export function getDemoDirectorScopeById(id?: string | null) {
  const normalizado = String(id ?? "").trim();
  return demoDiretoriaById[normalizado] ?? null;
}

export const demoUsers: DemoUser[] = [
  {
    nome: "Anthony Ribeiro",
    email: "admin@investflowdemo.com",
    perfil: "admin",
    perfilLabel: "Administrador",
    vinculo: "Todas as áreas",
    status: "Ativo",
  },
  {
    nome: "Solicitante 01",
    email: "solicitante1@investflowdemo.com",
    perfil: "solicitante",
    perfilLabel: "Solicitante",
    vinculo: "Unidade 01 — Centro",
    status: "Ativo",
  },
  ...demoDiretorias.map((diretoria) => ({
    nome: diretoria.diretor,
    email: diretoria.email,
    perfil: "diretoria" as UserRole,
    perfilLabel: "Diretoria",
    vinculo: diretoria.nome,
    status: "Ativo",
  })),
  {
    nome: "Patrimônio 01",
    email: "patrimonio1@investflowdemo.com",
    perfil: "patrimonio",
    perfilLabel: "Patrimônio",
    vinculo: "Corporativo",
    status: "Ativo",
  },
  {
    nome: "Projetos 01",
    email: "projetos1@investflowdemo.com",
    perfil: "projetos",
    perfilLabel: "Projetos",
    vinculo: "Corporativo",
    status: "Ativo",
  },
  {
    nome: "Compras/Realizações 01",
    email: "compras1@investflowdemo.com",
    perfil: "orcamentos",
    perfilLabel: "Orçamentos e Realizações",
    vinculo: "Compras/Orçamentos/Execução",
    status: "Ativo",
  },
];

const emailRoleAliases: Record<string, UserRole> = {
  "admin@investflowdemo.com": "admin",
  "admin@investflow.com": "admin",
  "admin@empresa.com": "admin",

  "solicitante1@investflowdemo.com": "solicitante",
  "gerente01@investflowdemo.com": "solicitante",
  "gerente01@investflow.com": "solicitante",
  "gerente01@empresa.com": "solicitante",
  "solicitante@investflow.com": "solicitante",
  "solicitante@investflowdemo.com": "solicitante",

  "diretor1@investflowdemo.com": "diretoria",
  "diretor2@investflowdemo.com": "diretoria",
  "diretor3@investflowdemo.com": "diretoria",
  "diretor4@investflowdemo.com": "diretoria",
  "diretor01@investflowdemo.com": "diretoria",
  "diretor@investflow.com": "diretoria",
  "diretor.a@empresa.com": "diretoria",
  "diretoria@investflow.com": "diretoria",
  "diretoria@investflowdemo.com": "diretoria",

  "patrimonio1@investflowdemo.com": "patrimonio",
  "patrimonio@investflowdemo.com": "patrimonio",
  "patrimonio@investflow.com": "patrimonio",
  "patrimonio@empresa.com": "patrimonio",

  "projetos1@investflowdemo.com": "projetos",
  "projetos@investflowdemo.com": "projetos",
  "projetos@investflow.com": "projetos",

  "compras1@investflowdemo.com": "orcamentos",
  "compras@investflowdemo.com": "orcamentos",
  "orcamento@empresa.com": "orcamentos",
  "orcamentos@investflow.com": "orcamentos",
  "orcamentos@investflowdemo.com": "orcamentos",

  "realizacoes@investflow.com": "realizacoes",
  "realizacoes@investflowdemo.com": "realizacoes",
};

export function normalizeRole(role?: string | null): UserRole {
  const valor = String(role ?? "").toLowerCase().trim();

  if (["admin", "administrador"].includes(valor)) return "admin";
  if (["solicitante", "gerente", "gerente_loja", "loja"].includes(valor)) return "solicitante";
  if (["diretoria", "diretor"].includes(valor)) return "diretoria";
  if (["patrimonio", "patrimônio"].includes(valor)) return "patrimonio";
  if (["projetos", "projeto"].includes(valor)) return "projetos";
  if (["orcamentos", "orçamentos", "orcamento", "orçamento", "orcamento_compras", "compras"].includes(valor)) return "orcamentos";
  if (["realizacoes", "realizações", "realizacao", "realização", "execucao", "execução"].includes(valor)) return "realizacoes";

  return "solicitante";
}

export function roleLabel(role?: string | null) {
  const mapa: Record<UserRole, string> = {
    admin: "Administrador",
    solicitante: "Solicitante",
    diretoria: "Diretoria",
    patrimonio: "Patrimônio",
    projetos: "Projetos",
    orcamentos: "Orçamentos/Cotações",
    realizacoes: "Realizações",
  };

  return mapa[normalizeRole(role)];
}

export function knownRoleFromEmail(email?: string | null): UserRole | null {
  const normalizado = String(email ?? "").toLowerCase().trim();
  return emailRoleAliases[normalizado] ?? null;
}

export function roleFromEmail(email?: string | null): UserRole {
  return knownRoleFromEmail(email) ?? "solicitante";
}

export function getDemoUserByEmail(email?: string | null) {
  const normalizado = String(email ?? "").toLowerCase().trim();
  const user = demoUsers.find((item) => item.email.toLowerCase() === normalizado);

  if (user) return user;

  const perfil = knownRoleFromEmail(normalizado);
  if (!perfil) return null;

  const diretoria = getDemoDirectorScopeByEmail(normalizado);

  return {
    nome: diretoria?.diretor || roleLabel(perfil),
    email: normalizado,
    perfil,
    perfilLabel: roleLabel(perfil),
    vinculo: diretoria?.nome || (perfil === "admin" ? "Todas as áreas" : "Fluxo operacional"),
    status: "Ativo",
  } satisfies DemoUser;
}

type UsuarioPerfilRow = {
  nome: string | null;
  email: string | null;
  perfil: string | null;
  ativo: boolean | null;
  filial_id: string | null;
  diretoria_id: string | null;
};

async function buscarPerfilPorCampo(
  supabaseClient: any,
  campo: "auth_user_id" | "email",
  valor: string
): Promise<UsuarioPerfilRow | null> {
  const { data, error } = await supabaseClient
    .from("usuarios")
    .select("nome, email, perfil, ativo, filial_id, diretoria_id")
    .eq(campo, valor)
    .limit(1);

  if (error || !Array.isArray(data) || data.length === 0) return null;
  return data[0] as UsuarioPerfilRow;
}

export async function getProfileForAuthUser(
  supabaseClient: any,
  authUser: { id?: string; email?: string | null }
) {
  const email = String(authUser.email ?? "").toLowerCase().trim();
  let perfilBanco: UsuarioPerfilRow | null = null;

  if (authUser.id) {
    perfilBanco = await buscarPerfilPorCampo(supabaseClient, "auth_user_id", authUser.id);
  }

  if (!perfilBanco && email) {
    perfilBanco = await buscarPerfilPorCampo(supabaseClient, "email", email);
  }

  if (perfilBanco?.ativo === false) {
    return null;
  }

  const perfilConhecido = perfilBanco?.perfil ? normalizeRole(perfilBanco.perfil) : knownRoleFromEmail(email);

  if (!perfilConhecido) {
    return null;
  }

  const demoDiretoria = getDemoDirectorScopeByEmail(email) || getDemoDirectorScopeById(perfilBanco?.diretoria_id);

  return {
    nome: perfilBanco?.nome || demoDiretoria?.diretor || email || roleLabel(perfilConhecido),
    email: perfilBanco?.email || email,
    perfil: perfilConhecido,
    filial_id: perfilBanco?.filial_id ?? null,
    diretoria_id: perfilBanco?.diretoria_id || demoDiretoria?.id || null,
    diretoria_nome: demoDiretoria?.nome || null,
  };
}

export function rowMatchesUserScope(row: any, scope: UserScope) {
  const perfil = normalizeRole(scope.perfil);

  if (perfil === "admin") return true;

  if (perfil === "diretoria") {
    const diretoriaId = String(scope.diretoriaId ?? "").trim();
    const diretoriaNome = String(scope.diretoriaNome ?? "").trim();
    const rowDiretoriaId = String(row?.diretoria_id ?? row?.diretoriaId ?? "").trim();
    const rowDiretoriaNome = String(row?.diretoria_nome ?? row?.diretoriaNome ?? row?.area ?? "").trim();

    if (diretoriaId && rowDiretoriaId) return rowDiretoriaId === diretoriaId;
    if (diretoriaNome && rowDiretoriaNome) return rowDiretoriaNome === diretoriaNome;
    return false;
  }

  if (perfil === "solicitante") {
    const filialId = String(scope.filialId ?? "").trim();
    const rowFilialId = String(row?.filial_id ?? row?.filialId ?? "").trim();
    if (filialId && rowFilialId) return rowFilialId === filialId;
  }

  return true;
}

const allowedPrefixes: Record<UserRole, string[]> = {
  admin: ["/dashboard", "/solicitacoes", "/diretor", "/patrimonio", "/projetos", "/orcamentos", "/execucao", "/relatorios", "/aprovacao-final", "/cadastros"],
  solicitante: ["/dashboard", "/solicitacoes", "/relatorios"],
  diretoria: ["/dashboard", "/diretor", "/relatorios"],
  patrimonio: ["/dashboard", "/patrimonio", "/relatorios"],
  projetos: ["/dashboard", "/projetos", "/relatorios"],
  orcamentos: ["/dashboard", "/orcamentos", "/execucao", "/relatorios"],
  realizacoes: ["/dashboard", "/execucao", "/relatorios"],
};

export function canAccessPath(role: UserRole | string | null | undefined, pathname: string) {
  const perfil = normalizeRole(role);
  const permitidas = allowedPrefixes[perfil] ?? allowedPrefixes.solicitante;
  return permitidas.some((rota) => pathname === rota || pathname.startsWith(`${rota}/`));
}

export function defaultReportForRole(role: UserRole | string | null | undefined) {
  const perfil = normalizeRole(role);
  if (perfil === "admin") return "geral";
  if (perfil === "solicitante") return "solicitante";
  if (perfil === "diretoria") return "diretoria";
  if (perfil === "patrimonio") return "patrimonio";
  if (perfil === "projetos") return "projetos";
  return "orcamentos_realizacoes";
}
