export function mapExternalUrl(query: string) {
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(query)}`;
}

export function mapDirectionsUrl(queries: string[]) {
  const [origin, ...rest] = queries;
  const destination = rest.pop();
  if (!origin || !destination) return mapExternalUrl(origin ?? destination ?? "");
  const params = new URLSearchParams({ api: "1", origin, destination, travelmode: "walking" });
  if (rest.length) params.set("waypoints", rest.join("|"));
  return `https://www.google.com/maps/dir/?${params}`;
}
