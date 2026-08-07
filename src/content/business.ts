export type BusinessServiceId = "store-page" | "map-guidance" | "website" | "support";

export type BusinessService = {
  id: BusinessServiceId;
  title: string;
  shortTitle: string;
  description: string;
  price: string;
  priceNote: string;
  deliverables: string[];
  href: string;
};

export const businessContactEnabled = true;
export const businessContactFormUrl = "https://docs.google.com/forms/d/e/1FAIpQLSfjBa3cxGBrjEUSLEDY8ZkcvFs4xU5PXzNW6CbpZ_0MQgGYyw/viewform?usp=dialog";
export const businessContactEmail = "osanpo.contact.tokyo@gmail.com";
export const businessListingApplicationEnabled = false;

export const businessAudience = ["飲食店", "カフェ", "美容室", "整体院", "教室", "小売店", "地域サービス事業者"];
export const businessChallenges = [
  "地図で見つけても、お店らしさまで伝えきれていない",
  "営業時間やサービス案内が複数の場所に分かれている",
  "駅からの行き方や来店前の注意点をまとめたい",
  "公開後の情報更新を無理なく続けたい",
];
export const businessFaqs = [
  { question: "相談前に何を用意すればよいですか？", answer: "まずは現在ある情報、写真、公式サイトやSNSの有無を確認します。必要な内容と優先順位は相談しながら整理します。" },
  { question: "料金だけで依頼できますか？", answer: "参考価格は目安です。掲載内容、写真や原稿の準備状況、確認範囲を確認してから個別に見積もります。" },
  { question: "集客や売上は保証されますか？", answer: "保証しません。情報を分かりやすく整理する制作・更新支援であり、検索順位、来店数、売上などの成果を約束するものではありません。" },
  { question: "無料掲載は今すぐ申請できますか？", answer: "無料掲載の開始時期は未定です。店舗掲載に関する相談はGoogleフォームで受け付け、個人情報をこの静的サイトに保存しません。" },
];

export const businessListingFields = [
  { key: "storeName", label: "店舗名", personalData: false },
  { key: "category", label: "店舗種別", personalData: false },
  { key: "area", label: "エリア", personalData: false },
  { key: "address", label: "住所", personalData: false },
  { key: "officialUrl", label: "公式URL", personalData: false },
  { key: "mapUrl", label: "GoogleマップURL", personalData: false },
  { key: "businessHours", label: "営業時間", personalData: false },
  { key: "description", label: "紹介文", personalData: false },
  { key: "images", label: "掲載画像", personalData: false },
  { key: "publicationPermission", label: "掲載許可", personalData: false },
  { key: "contact", label: "担当者連絡先", personalData: true },
];

export const businessServices: BusinessService[] = [
  {
    id: "store-page",
    title: "店舗紹介ページ制作",
    shortTitle: "店舗紹介ページ",
    description: "地図で見つけた人に、お店の魅力・基本情報・来店前の判断材料を伝える1ページを整えます。",
    price: "30,000円〜",
    priceNote: "内容により個別見積もりです。地図と徒歩導線を含む構成は50,000円〜の参考価格です。",
    deliverables: ["店舗紹介と写真", "基本情報・営業時間・注意事項", "Googleマップと駅からの徒歩導線", "公式サイト・SNSへの案内", "情報確認日の表示"],
    href: "/business/store-page/",
  },
  {
    id: "map-guidance",
    title: "Googleマップ・徒歩導線の整備",
    shortTitle: "地図・徒歩導線",
    description: "来店前に迷いやすい場所・駅からの歩き方・公式情報への導線を、店舗紹介ページ内で整理します。",
    price: "50,000円〜",
    priceNote: "店舗紹介ページに地図と徒歩導線を含める場合の参考価格です。内容により個別見積もりです。",
    deliverables: ["Googleマップへの案内", "駅からの徒歩導線", "来店前の注意事項", "公式情報へのリンク整理"],
    href: "/business/store-page/",
  },
  {
    id: "website",
    title: "Webサイト・LP制作",
    shortTitle: "Webサイト・LP",
    description: "お店やサービスの内容を、初めて訪れた人にも分かる順番で伝えるWebサイトを制作します。",
    price: "80,000円〜",
    priceNote: "LPは80,000円〜、複数ページのWebサイトは120,000円〜の参考価格です。",
    deliverables: ["スマホ対応", "Googleマップと問い合わせ導線", "基本SEOとアクセス解析の初期設定", "営業時間・サービス案内", "更新しやすい構成"],
    href: "/business/website/",
  },
  {
    id: "support",
    title: "更新・運用サポート",
    shortTitle: "更新・運用サポート",
    description: "公開後の小さな更新や、情報整理の相談を続けやすい形で支えます。",
    price: "月額5,000円〜",
    priceNote: "月額5,000円・10,000円・15,000円の目安をもとに、対応範囲は事前の相談で決めます。",
    deliverables: ["軽微な情報更新", "更新内容の整理", "簡易レポートの相談", "継続改善の優先順位整理", "対応範囲の事前合意"],
    href: "/business/support/",
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

export const contactSubjects = {
  general: "おさんぽクラブ東京への問い合わせ",
  listing: "店舗掲載についての相談",
  website: "Web・LP制作についての相談",
  support: "サイト更新支援についての相談",
} as const;

export type ContactSubjectKey = keyof typeof contactSubjects;

export function emailContactHref(subjectKey: ContactSubjectKey) {
  if (!isPublicEmail(businessContactEmail)) return "";
  return `mailto:${businessContactEmail}?subject=${encodeURIComponent(contactSubjects[subjectKey])}`;
}
