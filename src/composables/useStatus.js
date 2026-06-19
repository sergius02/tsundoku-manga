import { useI18n } from 'vue-i18n'

const statusConfig = {
  unread: {
    color: 'var(--text-secondary)',
    bgColor: 'var(--bg-secondary)',
    icon: 'circle'
  },
  reading: {
    color: '#c77c02',
    bgColor: 'rgba(244, 162, 97, 0.2)',
    icon: 'clock'
  },
  read: {
    color: 'var(--success)',
    bgColor: 'rgba(45, 106, 79, 0.15)',
    icon: 'check'
  },
  no_volumes: {
    color: 'var(--text-secondary)',
    bgColor: 'var(--bg-secondary)',
    icon: 'minus'
  }
}

export function useStatus() {
  const { t } = useI18n()

  const statusLabel = (status) => {
    const labels = {
      unread: t('status.unread'),
      reading: t('status.reading'),
      read: t('status.read'),
      no_volumes: t('status.noVolumes')
    }
    return labels[status] || status
  }

  const getStatusConfig = (status) => {
    return statusConfig[status] || statusConfig.unread
  }

  const getStatusColor = (status) => {
    return getStatusConfig(status).color
  }

  const getStatusBgColor = (status) => {
    return getStatusConfig(status).bgColor
  }

  const getStatusIcon = (status) => {
    return getStatusConfig(status).icon
  }

  return {
    statusLabel,
    getStatusConfig,
    getStatusColor,
    getStatusBgColor,
    getStatusIcon
  }
}
