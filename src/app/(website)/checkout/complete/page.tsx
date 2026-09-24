import { SalesWalkthrough } from "@/components/sales-walkthrough";
import {
  readPreviewSelection,
  type PreviewQuery,
} from "@/lib/sales-walkthrough";

export default async function PreviewComplete({
  searchParams,
}: {
  searchParams: Promise<PreviewQuery>;
}) {
  return (
    <SalesWalkthrough
      step="complete"
      selection={readPreviewSelection(await searchParams)}
    />
  );
}
