import type { ResearchReport, ResearchCategory } from "@/server/naver-market";
import { getResearchPdf } from "@/lib/market-fns";
import { buildResearchExecutiveSummary } from "@/lib/research-utils";

export type ResearchDeep = {
  pdfUrl?: string;
  pageUrl: string;
  rating?: string;
  targetPrice?: number;
  previewExtra?: string;
};

/** Deep-fetch rating / TP / PDF / longer body when user opens detail or PDF. */
export async function fetchResearchDeepDetail(
  report: Pick<ResearchReport, "researchId" | "category">,
): Promise<ResearchDeep> {
  return getResearchPdf({
    data: {
      researchId: report.researchId,
      category: report.category as ResearchCategory,
    },
  });
}

export function mergeResearchDeep(
  report: ResearchReport,
  deep: ResearchDeep,
): ResearchReport {
  const preview =
    deep.previewExtra &&
    (!report.preview || deep.previewExtra.length > report.preview.length)
      ? deep.previewExtra
      : report.preview;
  const rating = deep.rating ?? report.rating;
  const targetPrice =
    deep.targetPrice != null && deep.targetPrice > 0
      ? deep.targetPrice
      : report.targetPrice;
  return {
    ...report,
    pdfUrl: deep.pdfUrl || report.pdfUrl,
    pageUrl: deep.pageUrl || report.pageUrl,
    rating,
    targetPrice,
    preview,
    summary: buildResearchExecutiveSummary(
      preview || report.summary || report.title,
      report.title,
    ),
    hasInvestmentView: Boolean(rating || (targetPrice != null && targetPrice > 0)),
  };
}

export function openResearchPdfUrl(url: string) {
  window.open(url, "_blank", "noopener,noreferrer");
}
