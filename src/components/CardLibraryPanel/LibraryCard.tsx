/** Static visual presentation of a card thumbnail in the library list (no drag behavior). */

interface LibraryCardProps {
  imageUrl: string;
  fileName: string;
}

export function LibraryCard({ imageUrl, fileName }: LibraryCardProps) {
  return (
    <div className="library-card">
      <img src={imageUrl} alt={fileName} className="library-card__image" />
    </div>
  );
}
