/**
 * "Add from URL" control: a text input + submit button that hands the URL
 * off to a shared submit handler (also used by drag-and-drop of a URL onto
 * the panel — see CardLibraryPanel), so both entry points share one
 * loading/error display.
 */

import { useState, type FormEvent } from 'react';

interface UrlImportFormProps {
  onSubmit: (url: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function UrlImportForm({ onSubmit, isLoading, error }: UrlImportFormProps) {
  const [url, setUrl] = useState('');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!url.trim() || isLoading) return;
    await onSubmit(url.trim());
    setUrl('');
  }

  return (
    <form className="url-import-form" onSubmit={handleSubmit}>
      <input
        type="url"
        placeholder="https://example.com/card.jpg"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        disabled={isLoading}
      />
      <button type="submit" disabled={isLoading || !url.trim()}>
        {isLoading ? 'Adding…' : 'Add from URL'}
      </button>
      {error && <span className="url-import-form__error">{error}</span>}
    </form>
  );
}
