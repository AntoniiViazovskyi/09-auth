'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import css from '@/components/NoteForm/NoteForm.module.css'
import { useNoteDraftStore } from '@/lib/store/noteStore'
import { NoteTag } from '@/types/note'
import { createNote } from '@/lib/api'
import Loader from '../Loader/Loader'
import { useRouter } from 'next/navigation'

interface NoteFormValues {
  title: string
  content: string
  tag: NoteTag
}

const TITLE_MIN_LENGTH = 3
const TITLE_MAX_LENGTH = 50
const CONTENT_MAX_LENGTH = 500

export default function NoteForm() {
  const router = useRouter()
  const { draft, setDraft, clearDraft } = useNoteDraftStore()
  const handleChange = (
    event: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setDraft({
      ...draft,
      [event.target.name]: event.target.value
    })
  }

  const handleCancel = () => router.back()

  const queryClient = useQueryClient()
  const { mutateAsync, isPending, isError } = useMutation({
    mutationFn: (values: NoteFormValues) =>
      createNote({
        title: values.title,
        content: values.content,
        tag: values.tag
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notes'] })
      clearDraft()
      router.push('/notes/filter/all')
    }
  })

  async function formAction(formData: FormData) {
    const values: NoteFormValues = {
      title: formData.get('title') as string,
      content: formData.get('content') as string,
      tag: formData.get('tag') as NoteTag
    }

    try {
      await mutateAsync(values)
    } catch {
      return
    }
  }

  return (
    <form action={formAction} className={css.form}>
      <div className={css.formGroup}>
        <label htmlFor="title">Title</label>
        <input
          id="title"
          type="text"
          name="title"
          minLength={TITLE_MIN_LENGTH}
          maxLength={TITLE_MAX_LENGTH}
          required
          className={css.input}
          defaultValue={draft.title}
          onChange={handleChange}
        />
      </div>

      <div className={css.formGroup}>
        <label htmlFor="content">Content</label>
        <textarea
          id="content"
          name="content"
          rows={8}
          maxLength={CONTENT_MAX_LENGTH}
          className={css.textarea}
          defaultValue={draft.content}
          onChange={handleChange}
        />
      </div>

      <div className={css.formGroup}>
        <label htmlFor="tag">Tag</label>
        <select
          id="tag"
          name="tag"
          required
          className={css.select}
          defaultValue={draft.tag}
          onChange={handleChange}>
          <option value="Todo">Todo</option>
          <option value="Work">Work</option>
          <option value="Personal">Personal</option>
          <option value="Meeting">Meeting</option>
          <option value="Shopping">Shopping</option>
        </select>
      </div>

      <div className={css.actions}>
        <button
          type="button"
          onClick={handleCancel}
          className={css.cancelButton}>
          Cancel
        </button>
        <button type="submit" className={css.submitButton} disabled={isPending}>
          Create note
        </button>
        {isPending && <Loader />}
      </div>
      {isError && (
        <p className={css.error}>Failed to create note. Please try again.</p>
      )}
    </form>
  )
}
