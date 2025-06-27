import dynamic from 'next/dynamic'

// Lazy load heavy components
export const RichTextEditor = dynamic(
  () => import('./rich-text-editor').then(mod => ({ default: mod.RichTextEditor })),
  {
    loading: () => <div className="h-64 bg-vintage-paper-dark/10 animate-pulse rounded-md" />,
    ssr: false
  }
)

export const MediaPlayer = dynamic(
  () => import('./media-player').then(mod => ({ default: mod.MediaPlayer })),
  {
    loading: () => <div className="h-32 bg-vintage-paper-dark/10 animate-pulse rounded-md" />,
    ssr: false
  }
)

export const YouMightAlsoLike = dynamic(
  () => import('./you-might-also-like').then(mod => ({ default: mod.YouMightAlsoLike })),
  {
    loading: () => <div className="h-96 bg-vintage-paper-dark/10 animate-pulse rounded-md" />
  }
)

export const RelatedContent = dynamic(
  () => import('./related-content').then(mod => ({ default: mod.RelatedContent })),
  {
    loading: () => <div className="h-96 bg-vintage-paper-dark/10 animate-pulse rounded-md" />
  }
)

export const AdminDashboard = dynamic(
  () => import('../app/admin/dashboard/page').then(mod => ({ default: mod.default })),
  {
    loading: () => <div className="h-screen bg-vintage-paper-dark/10 animate-pulse" />
  }
) 