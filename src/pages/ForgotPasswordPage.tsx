import React, { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/update-password`,
    })
    setLoading(false)

    if (error) setMessage('Erreur : ' + error.message)
    else setMessage('Un lien de réinitialisation a été envoyé à votre adresse e-mail.')
  }

  return (
    <div style={{ maxWidth: 400, margin: '60px auto', textAlign: 'center' }}>
      <h2>Mot de passe oublié</h2>
      <p>Entrez votre adresse e-mail pour recevoir un lien de réinitialisation.</p>

      <form onSubmit={handleResetPassword}>
        <input
          type="email"
          placeholder="Votre adresse e-mail"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          style={{ width: '100%', padding: '10px', marginBottom: '10px' }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{ width: '100%', padding: '10px', background: '#3b82f6', color: 'white', border: 'none', borderRadius: '5px' }}
        >
          {loading ? 'Envoi...' : 'Envoyer le lien'}
        </button>
      </form>

      {message && <p style={{ marginTop: '15px', color: '#16a34a' }}>{message}</p>}
    </div>
  )
}
