# InvestFlow — versão demo segura

Esta versão foi ajustada para apresentação com dados fictícios e menor exposição de informação interna.

## O que foi alterado

- Dashboard passou a exibir uma amostra reduzida: 24 registros carregados e 10 exibidos na tabela.
- KPIs agora são calculados a partir da amostra demo, não da base completa.
- Textos do dashboard indicam claramente que é ambiente demonstrativo.
- Menu "Execução e SAP" foi renomeado para "Evolução futura".
- Página de execução virou um roadmap, sem prometer integração SAP no MVP.
- Limites de consultas em telas operacionais foram reduzidos de 300 para 60 registros.
- `.env.local` foi removido do pacote. Use `.env.example` como modelo.
- Adicionados headers básicos de segurança no `next.config.js`.
- Cookie de login recebeu `SameSite=Lax` e `Secure`.
- Supabase client recebeu configuração explícita de autenticação.

## Variáveis necessárias no Vercel

```env
NEXT_PUBLIC_SUPABASE_URL=https://SEU-PROJETO.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=sua_anon_public_key
NEXT_PUBLIC_DEMO_MODE=true
```

## Observação importante

Esta versão ainda usa autenticação simplificada por cookie local para proteger rotas no middleware. Para produção real, o ideal é evoluir para autenticação SSR com validação da sessão Supabase no servidor e políticas RLS mais restritivas no banco.
