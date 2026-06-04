interface VideoThumbnailProps {
  cfUid: string
  alt?: string
  className?: string
  time?: string
}

export function VideoThumbnail({
  cfUid,
  alt = 'Video thumbnail',
  className = '',
  time = '1s',
}: VideoThumbnailProps) {
  const src = `https://customer-${process.env.NEXT_PUBLIC_CF_ACCOUNT_ID}.cloudflarestream.com/${cfUid}/thumbnails/thumbnail.jpg?time=${time}&width=480`

  return (
    <img
      src={src}
      alt={alt}
      loading="lazy"
      className={`object-cover ${className}`}
      width={480}
      height={270}
    />
  )
}
