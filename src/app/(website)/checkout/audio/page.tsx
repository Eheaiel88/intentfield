import { SalesWalkthrough } from "@/components/sales-walkthrough";
import {
  readPreviewSelection,
  type PreviewQuery,
} from "@/lib/sales-walkthrough";

export default async function AudioOffer({
  searchParams,
}: {
  searchParams: Promise<PreviewQuery>;
}) {
  return (
    <SalesWalkthrough
      step="audio"
      selection={readPreviewSelection(await searchParams)}
    />
  );
}
