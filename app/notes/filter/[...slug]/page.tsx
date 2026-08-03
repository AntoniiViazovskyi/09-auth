import { fetchNotes } from '@/lib/api'
import {
  dehydrate,
  HydrationBoundary,
  QueryClient
} from '@tanstack/react-query'
import NotesClient from './Notes.client'
import { Metadata } from 'next'

interface NotesPageProps {
  params: Promise<{ slug: string[] }>
}

export async function generateMetadata({
  params
}: NotesPageProps): Promise<Metadata> {
  const { slug } = await params
  const filter = slug[0]
  const filterLabel = filter === 'all' ? 'all categories' : filter
  const title = `Notes: ${filterLabel} | NoteHub`
  const description = `Browse notes filtered by ${filterLabel}. NoteHub helps you find and organize notes by category.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${process.env.NEXT_PUBLIC_APP_URL}/notes/filter/${filter}`,
      images: [
        {
          url: 'https://ac.goit.global/fullstack/react/notehub-og-meta.jpg',
          width: 1200,
          height: 630,
          alt: 'NoteHub Logo'
        }
      ]
    }
  }
}

export default async function Notes({ params }: NotesPageProps) {
  const { slug } = await params
  const selectedTag = slug[0] === 'all' ? undefined : slug[0]

  const queryClient = new QueryClient()

  await queryClient.prefetchQuery({
    queryKey: ['notes', '', 1, selectedTag],
    queryFn: () => fetchNotes('', 1, selectedTag)
  })

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <NotesClient tag={selectedTag} />
    </HydrationBoundary>
  )
}
