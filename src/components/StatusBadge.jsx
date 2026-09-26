const statusLabels = {
  pending: 'Em análise',
  approved: 'Aprovado',
  rejected: 'Recusado',
}

export default function StatusBadge({ status = 'pending' }) {
  const knownStatus = statusLabels[status] ? status : 'pending'

  return <span className={`status-badge status-${knownStatus}`}>{statusLabels[knownStatus]}</span>
}