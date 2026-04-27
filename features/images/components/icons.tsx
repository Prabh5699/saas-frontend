export function ImageIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      aria-hidden
    >
      <rect width="18" height="18" x="3" y="3" rx="2" />
      <circle cx="8.5" cy="8.5" r="1.5" />
      <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
    </svg>
  );
}

export function WandIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
    >
      <path d="M11 4c0-1.66 1.34-3 3-3s3 1.34 3 3-1.34 3-3 3-3-1.34-3-3zm7.5 15.5-2.39-2.39c-.5-.5-1.31-.5-1.81 0L14 18.09l-1.09-1.09c-.5-.5-1.31-.5-1.81 0l-2.39 2.39c-.5.5-.5 1.31 0 1.81l2.39 2.39c.5.5 1.31.5 1.81 0L14 21.91l1.09 1.09c.5.5 1.31.5 1.81 0l2.39-2.39c.5-.5.5-1.31 0-1.81zM3 21h6v-2H3v2z" />
    </svg>
  );
}
