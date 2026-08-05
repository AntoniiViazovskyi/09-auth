import type { Note, NoteTag } from '@/types/note'
import type { User } from '@/types/user'
import { isAxiosError } from 'axios'
import { api } from './api'

export interface FetchNotesResponse {
  notes: Note[]
  totalPages: number
}

export interface CreateNoteRequest {
  title: string
  content: string
  tag: NoteTag
}

interface AuthRequest {
  email: string
  password: string
}

interface SessionResponse {
  success: boolean
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

  const error = data as {
    error?: string
    response?: { message?: string; error?: string }
  }
  throw new Error(
    error.response?.message ??
      error.response?.error ??
      error.error ??
      'The server returned an invalid user response.'
  )
}

function getRequestError(error: unknown): Error {
  if (isAxiosError(error)) {
    const data = error.response?.data as
      | { error?: string; response?: { message?: string; error?: string } }
      | undefined

    return new Error(
      data?.response?.message ??
        data?.response?.error ??
        data?.error ??
        error.message
    )
  }

  return error instanceof Error ? error : new Error('Request failed.')
}

export async function fetchNotes(
  search = '',
  page = 1,
  tag?: string
): Promise<FetchNotesResponse> {
  const response = await api.get<FetchNotesResponse>('/notes', {
    params: { search, page, perPage: 12, tag }
  })
  return response.data
}

export async function fetchNoteById(id: string): Promise<Note> {
  const response = await api.get<Note>(`/notes/${id}`)
  return response.data
}

export async function createNote(data: CreateNoteRequest): Promise<Note> {
  const response = await api.post<Note>('/notes', data)
  return response.data
}

export async function deleteNote(id: string): Promise<Note> {
  const response = await api.delete<Note>(`/notes/${id}`)
  return response.data
}

export async function register(data: AuthRequest): Promise<User> {
  try {
    const response = await api.post<unknown>('/auth/register', data)
    return getUser(response.data)
  } catch (error) {
    throw getRequestError(error)
  }
}

export async function login(data: AuthRequest): Promise<User> {
  try {
    const response = await api.post<unknown>('/auth/login', data)
    return getUser(response.data)
  } catch (error) {
    throw getRequestError(error)
  }
}

export async function logout(): Promise<void> {
  await api.post('/auth/logout')
}

export async function checkSession(): Promise<boolean> {
  const response = await api.get<SessionResponse>('/auth/session')
  return response.data.success
}

export async function getMe(): Promise<User> {
  const response = await api.get<unknown>('/users/me')
  return getUser(response.data)
}

export async function updateMe(data: Pick<User, 'username'>): Promise<User> {
  const response = await api.patch<unknown>('/users/me', data)
  return getUser(response.data)
}
