export function FavoriteButton({ type, id }: { type: "area" | "course" | "spot" | "story"; id: string }) {
  return <button className="favorite" type="button" data-favorite-key={`${type}:${id}`} aria-pressed="false"><span aria-hidden="true">☆</span> お気に入りに追加</button>;
}
