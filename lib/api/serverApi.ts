import 'server-only'

import { cookies } from 'next/headers'
import type { Note } from '@/types/note'
import type { User } from '@/types/user'
import { api } from './api'

interface FetchNotesResponse {
  notes: Note[]
  totalPages: number
}

interface SessionResult {
  success: boolean
  setCookie: string[]
}

function getUser(data: unknown): User {
  if (
    typeof data === 'object' &&
    data !== null &&
    typeof (data as User).email === 'string' &&
    typeof (data as User).username === 'string' &&
    typeof (data as User).avatar === 'string'
  ) {
    return data as User
  }

  const error = data as { error?: string }
  throw new Error(error.error ?? 'The server returned an invalid user response.')
}

async function getCookieHeader(cookieHeader?: string): Promise<string> {
  return cookieHeader ?? (await cookies()).toString()
}

export async function fetchNotes(
  search = '',
  page = 1,
  tag?: string
): Promise<FetchNotesResponse> {
  const response = await api.get<FetchNotesResponse>('/notes', {
    params: { search, page, perPage: 12, tag },
    headers: { Cookie: await getCookieHeader() }
  })
  return response.data
}

export async function fetchNoteById(id: string): Promise<Note> {
  const response = await api.get<Note>(`/notes/${id}`, {
    headers: { Cookie: await getCookieHeader() }
  })
  return response.data
}

export async function getMe(): Promise<User> {
  const response = await api.get<unknown>('/users/me', {
    headers: { Cookie: await getCookieHeader() }
  })
  return getUser(response.data)
}

export async function checkSession(cookieHeader?: string): Promise<SessionResult> {
  const response = await api.get<{ success: boolean }>('/auth/session', {
    headers: { Cookie: await getCookieHeader(cookieHeader) }
  })
  const setCookie = response.headers['set-cookie']

  return {
    success: response.data.success,
    setCookie: setCookie
      ? Array.isArray(setCookie)
        ? setCookie
        : [setCookie]
      : []
  }
}
