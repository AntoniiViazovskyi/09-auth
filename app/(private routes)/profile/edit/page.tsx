'use client'

import Image from 'next/image'
import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { updateMe } from '@/lib/api/clientApi'
import { useAuthStore } from '@/lib/store/authStore'
import type { User } from '@/types/user'
import css from '@/components/EditProfilePage/EditProfilePage.module.css'

function EditProfileForm({ user }: { user: User }) {
  const router = useRouter()
  const setUser = useAuthStore((state) => state.setUser)
  const [username, setUsername] = useState(user.username)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    try {
      const updatedUser = await updateMe({ username: username.trim() })
      setUser(updatedUser)
      router.push('/profile')
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : 'Failed to update profile.'
      )
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <main className={css.mainContent}>
      <div className={css.profileCard}>
        <h1 className={css.formTitle}>Edit Profile</h1>

        <Image
          src={user.avatar}
          alt="User Avatar"
          width={120}
          height={120}
          className={css.avatar}
        />

        <form className={css.profileInfo} onSubmit={handleSubmit}>
          <div className={css.usernameWrapper}>
            <label htmlFor="username">Username:</label>
            <input
              id="username"
              name="username"
              type="text"
              className={css.input}
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              required
            />
          </div>

          <p>Email: {user.email}</p>
          {error && <p className={css.error}>{error}</p>}

          <div className={css.actions}>
            <button
              type="submit"
              className={css.saveButton}
              disabled={isSubmitting || !username.trim()}>
              Save
            </button>
            <button
              type="button"
              className={css.cancelButton}
              onClick={() => router.push('/profile')}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </main>
  )
}

export default function EditProfilePage() {
  const user = useAuthStore((state) => state.user)

  if (!user) {
    return <main className={css.mainContent}>Loading profile...</main>
  }

  return <EditProfileForm user={user} />
}
