import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import StatusBadge from '../components/StatusBadge'
import { useAuth } from '../AuthContext'
import { supabase } from '../lib/supabaseClient'

const statusContent = {
  pending: {
    title: 'Seu cadastro está em análise',
    description: 'Vamos revisar seus dados profissionais. O acesso às próximas etapas será liberado assim que a análise for concluída.',
    color: 'orange',
  },
  approved: {
    title: 'Seu acesso está liberado',
    description: 'Seu registro profissional foi aprovado. Esta área será seu ponto de partida para acompanhar sua prática na Glycare.',
    color: 'green',
  },
  rejected: {
    title: 'Cadastro não aprovado',
    description: 'Não foi possível aprovar seus dados profissionais. Entre em contato com a equipe Glycare para entender os próximos passos.',
    color: 'red',
  },
}

export default function Painel() {
  const { user, profile, loading, profileError } = useAuth()
  const [signingOut, setSigningOut] = useState(false)

  if (!loading && !user) return <Navigate to="/login" replace />

  async function handleSignOut() {
    setSigningOut(true)
    await supabase.auth.signOut()
    setSigningOut(false)
  }

  const currentStatus = profile?.status ?? 'pending'
  const content = statusContent[currentStatus] ?? statusContent.pending

  return (
    <main className="dashboard-shell">
      <header className="topbar">
        <a className="topbar-brand" href="/painel" aria-label="Glycare, painel"><span className="brand-mark brand-mark-small">g</span><span>glycare <i>profissional</i></span></a>
        <button className="button button-destructive" type="button" onClick={handleSignOut} disabled={signingOut}>
          <span className="logout-icon" aria-hidden="true">↗</span>{signingOut ? 'Saindo...' : 'Sair'}
        </button>
      </header>

      <div className="dashboard-content">
        <header className="page-heading dashboard-heading">
          <span className="section-label">ÁREA PROFISSIONAL</span>
          <h1>Seu espaço de cuidado.</h1>
          <p>Olá{profile?.full_name ? `, ${profile.full_name.split(' ')[0]}` : ''}. Aqui começa sua experiência Glycare.</p>
        </header>

        {loading ? (
          <div className="loading-state" role="status">Carregando seu perfil...</div>
        ) : profileError ? (
          <div className="notice notice-error" role="alert">{profileError} Confira se o schema do Supabase foi aplicado.</div>
        ) : !profile ? (
          <div className="notice notice-warning" role="status">Seu perfil ainda não está disponível. Se você acabou de se cadastrar, confirme seu e-mail e aguarde a sincronização.</div>
        ) : (
          <>
            <section className={`review-banner review-${content.color}`}>
              <div className="review-indicator" aria-hidden="true"><span /></div>
              <div className="review-copy"><span className="section-label">STATUS DO CADASTRO</span><h2>{content.title}</h2><p>{content.description}</p></div>
              <StatusBadge status={currentStatus} />
            </section>

            <section className="profile-section">
              <div className="section-heading"><span className="section-label">SEU PERFIL</span><span className="profile-lock" title="Dados protegidos">● Dados protegidos</span></div>
              <div className="profile-card">
                <div className="profile-avatar" aria-hidden="true">{profile.full_name?.trim().charAt(0)?.toUpperCase() || 'P'}</div>
                <div className="profile-main"><h2>{profile.full_name}</h2><p>{profile.profession}</p></div>
                <div className="profile-registration"><span className="section-label">REGISTRO PROFISSIONAL</span><strong>{profile.registration_type} {profile.registration_number} <span>/ {profile.registration_state}</span></strong></div>
              </div>
            </section>

            <p className="dashboard-note">As medições compartilhadas pelos seus pacientes estarão disponíveis aqui após a liberação do acesso.</p>
          </>
        )}
      </div>
    </main>
  )
}