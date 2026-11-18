interface DownloadJsonButtonProps {
  data: unknown
  fileName: string
  children: string
}

/** Offers a JSON object from memory as a file download. */
export function DownloadJsonButton({ data, fileName, children }: DownloadJsonButtonProps) {
  function handleClick() {
    // The blob only exists for the moment of the download; revoking the URL frees the memory again.
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    link.click()
    URL.revokeObjectURL(url)
  }

  return <button className="button" type="button" onClick={handleClick}>{children}</button>
}
