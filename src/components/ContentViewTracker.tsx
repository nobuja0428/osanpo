"use client";

import { useEffect, useRef } from "react";
import { trackEvent } from "@/components/Analytics";
import type { ContentType } from "@/lib/verification";

export function ContentViewTracker({ type, id, areaId = "" }: { type: ContentType; id: string; areaId?: string }) {
  const sent = useRef(false);
  useEffect(() => { if (!sent.current) { sent.current = true; trackEvent(`${type}_view`, { content_id: id, area_id: areaId }); } }, [areaId, id, type]);
  return null;
}
