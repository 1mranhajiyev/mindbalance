import { getApiErrorMessage, getApiErrorMessages } from '@/lib/apiErrors'

type Props = {
  error?: unknown
  message?: string
  fallback?: string
}

export default function ApiErrorAlert({ error, message, fallback }: Props) {
  const messages = message
    ? [message]
    : error
      ? getApiErrorMessages(error, fallback)
      : []

  if (messages.length === 0) return null

  if (messages.length === 1) {
    return <div className="alert-error">{messages[0]}</div>
  }

  return (
    <div className="alert-error">
      <ul className="list-disc list-inside space-y-1">
        {messages.map((msg, index) => (
          <li key={`${index}-${msg}`}>{msg}</li>
        ))}
      </ul>
    </div>
  )
}

export { getApiErrorMessage, getApiErrorMessages }
