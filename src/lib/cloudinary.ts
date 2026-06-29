export type PhotoStyle = 'original' | 'blurred' | 'illustrated'

// Inject a Cloudinary transform into an upload URL for the chosen style.
// Square, face-aware crop; blurred for privacy; illustrated = cartoon look.
export function styledCloudinaryUrl(baseUrl: string | null | undefined, style: string | null | undefined): string | null {
  if (!baseUrl) return baseUrl ?? null
  if (!baseUrl.includes('/upload/')) return baseUrl
  const transforms: Record<string, string> = {
    original: 'c_fill,g_face,w_400,h_400,q_auto,f_auto',
    blurred: 'c_fill,g_face,w_400,h_400,e_blur:1500,q_auto,f_auto',
    illustrated: 'c_fill,g_face,w_400,h_400,e_cartoonify,e_saturation:40,q_auto,f_auto',
  }
  const t = transforms[style ?? 'original'] ?? transforms.original
  return baseUrl.replace('/upload/', `/upload/${t}/`)
}
