import css from '@/app/Home.module.css'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 - Page not found | NoteHub',
  description: 'This page does not exist or has been moved.',
  openGraph: {
    title: '404 - Page not found | NoteHub',
    description: 'This page does not exist or has been moved.',
    url: `${process.env.NEXT_PUBLIC_APP_URL}`,
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

export default function NotFound() {
  return (
    <>
      <h1 className={css.title}>404 - Page not found</h1>
      <p className={css.description}>
        Sorry, the page you are looking for does not exist.
      </p>
    </>
  )
}
