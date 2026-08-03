export type BusinessServiceId = "store-page" | "website" | "support";

export type BusinessService = {
  id: BusinessServiceId;
  title: string;
  shortTitle: string;
  description: string;
  price: string;
  priceNote: string;
  deliverables: string[];
};

export const businessContactEnabled = false;
export const businessContactFormUrl = "";
export const businessContactEmail = "";
export const businessListingApplicationEnabled = false;

export const businessServices: BusinessService[] = [
  {
    id: "store-page",
    title: "店舗紹介ページ制作",
    shortTitle: "店舗紹介ページ",
    description: "地図で見つけた人に、お店の魅力・基本情報・来店前の判断材料を伝える1ページを整えます。",
    price: "30,000円〜",
    priceNote: "内容により個別見積もりです。地図と徒歩導線を含む構成は50,000円〜の参考価格です。",
    deliverables: ["掲載する情報の整理", "読みやすい店舗紹介ページ", "地図・徒歩導線への案内", "公開前の表示確認"],
  },
  {
    id: "website",
    title: "Webサイト・LP制作",
    shortTitle: "Webサイト・LP",
    description: "お店やサービスの内容を、初めて訪れた人にも分かる順番で伝えるWebサイトを制作します。",
    price: "80,000円〜",
    priceNote: "LPは80,000円〜、複数ページのWebサイトは120,000円〜の参考価格です。",
    deliverables: ["目的と掲載情報の整理", "ページ構成・原稿のたたき台", "スマホで読みやすいデザイン", "公開前の基本動作確認"],
  },
  {
    id: "support",
    title: "更新・運用サポート",
    shortTitle: "更新・運用サポート",
    description: "公開後の小さな更新や、情報整理の相談を続けやすい形で支えます。",
    price: "月額5,000円〜",
    priceNote: "月額5,000円・10,000円・15,000円の目安をもとに、対応範囲は事前の相談で決めます。",
    deliverables: ["基本情報の更新相談", "掲載内容の見直し", "優先順位の整理", "対応範囲の事前合意"],
  },
];

export function businessServiceById(id: BusinessServiceId) {
  return businessServices.find((service) => service.id === id)!;
}

export type BusinessContactConfig = {
  enabled: boolean;
  formUrl: string;
  email: string;
};

export type BusinessContactTarget = { kind: "form" | "email"; href: string } | null;

function isPublicGoogleForm(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && (url.hostname === "forms.gle" || (url.hostname === "docs.google.com" && url.pathname.startsWith("/forms/")));
  } catch {
    return false;
  }
}

function isPublicEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function resolveBusinessContact(config: BusinessContactConfig): BusinessContactTarget {
  if (!config.enabled) return null;
  if (isPublicGoogleForm(config.formUrl)) return { kind: "form", href: config.formUrl };
  if (isPublicEmail(config.email)) return { kind: "email", href: `mailto:${config.email}` };
  return null;
}

export const businessContact = resolveBusinessContact({
  enabled: businessContactEnabled,
  formUrl: businessContactFormUrl,
  email: businessContactEmail,
});
