import NoteDetailsClient from '@/app/notes/[id]/NoteDetails.client'
import { fetchNoteById } from '@/lib/api'
import {
  QueryClient,
  HydrationBoundary,
  dehydrate
} from '@tanstack/react-query'
import { Metadata } from 'next'

interface NoteProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({
  params
}: NoteProps): Promise<Metadata> {
  const { id } = await params
  const note = await fetchNoteById(id)
  return {
    title: `${note.title}`,
    description: `${note.content.slice(0, 50)}`,
    openGraph: {
      title: `${note.title}`,
      description: `${note.content.slice(0, 50)}`,
      url: `${process.env.NEXT_PUBLIC_APP_URL}/notes/${note.id}`,
      images: [
        {
          url: 'https://ac.goit.global/fullstack/react/notehub-og-meta.jpg',
          width: 1200,
          height: 630,
          alt: `${note.title}`
        }
      ]
    }
  }
}

export default async function NoteDetails({ params }: NoteProps) {
  const { id } = await params

  const queryClient = new QueryClient()
  await queryClient.prefetchQuery({
    queryKey: ['note', id],
    queryFn: () => fetchNoteById(id)
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NoteDetailsClient />
    </HydrationBoundary>
  )
}
