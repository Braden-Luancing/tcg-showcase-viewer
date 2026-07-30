/**
 * "Select from device" control: a visible button that proxies to a hidden
 * native file input, since styling a raw file input consistently is
 * unreliable across browsers/mobile.
 */

import { useRef } from 'react';

interface UploadButtonProps {
  onFilesSelected: (files: FileList) => void;
}

export function UploadButton({ onFilesSelected }: UploadButtonProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  return (
    <>
      <button type="button" onClick={() => inputRef.current?.click()}>
        Select from device
      </button>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        hidden
        onChange={(e) => {
          if (e.target.files && e.target.files.length > 0) {
            onFilesSelected(e.target.files);
          }
          // Reset so selecting the same file(s) again still fires onChange.
          e.target.value = '';
        }}
      />
    </>
  );
}
