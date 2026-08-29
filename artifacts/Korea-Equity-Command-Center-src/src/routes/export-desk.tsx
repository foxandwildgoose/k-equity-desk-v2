import { createFileRoute } from "@tanstack/react-router";
import { ExportDesk } from "@/components/export-desk/ExportDesk";

export const Route = createFileRoute("/export-desk")({
  component: ExportDesk,
  head: () => ({
    meta: [{ title: "Export × KOSPI · Korea Equity Command Center" }],
  }),
});
