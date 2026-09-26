# Glycare | Área profissional

Painel profissional em React + Vite para cadastro e autenticação de profissionais de saúde, com perfil criado pelo Supabase e liberação manual de acesso.

## Configuração local

1. Instale as dependências com `npm install`.
2. Copie `.env.example` para `.env` e informe `VITE_SUPABASE_URL` e `VITE_SUPABASE_ANON_KEY` do projeto Supabase.
3. Execute `supabase/schema.sql` no SQL Editor do Supabase.
4. Em Authentication > URL Configuration, configure a URL local `http://localhost:5173` e o redirecionamento de confirmação de e-mail para `http://localhost:5173/painel`.
5. Inicie com `npm run dev`.

O cadastro requer confirmação de e-mail se essa opção estiver habilitada no Supabase. Todos os perfis começam como `pending`; um administrador aprova ou recusa o registro pelo SQL Editor. A tabela só concede leitura do próprio perfil a usuários autenticados. Nenhuma política de escrita de perfil é concedida ao cliente.

## Segurança e escopo

O CPF é validado no formulário e novamente no trigger do banco, e é armazenado na tabela privada por RLS. A chave `anon` é a única chave usada no frontend; nunca exponha uma chave `service_role` no cliente. Login por CPF, 2FA e módulos de pacientes/medições não fazem parte desta versão.