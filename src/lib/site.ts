export const BASE_PATH = "/osanpo";
export const SITE_URL = "https://nobuja0428.github.io/osanpo/";
export const SITE_NAME = "おさんぽクラブ東京";

export function sitePath(path = "") {
  const normalized = path.replace(/^\/+|\/+$/g, "");
  return normalized ? `${BASE_PATH}/${normalized}/` : `${BASE_PATH}/`;
}

export function absoluteUrl(path = "") {
  return new URL(path.replace(/^\/+/, ""), SITE_URL).toString();
}

export function assetUrl(path: string) {
  return `${BASE_PATH}/${path.replace(/^\/+/, "")}`;
}
