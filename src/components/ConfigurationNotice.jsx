export default function ConfigurationNotice() {
  return (
    <div className="notice notice-warning" role="alert">
      A conexão com o Supabase ainda não foi configurada. Preencha as variáveis do arquivo <code>.env</code> e reinicie o servidor.
    </div>
  )
}