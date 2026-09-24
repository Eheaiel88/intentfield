import { SalesWalkthrough } from "@/components/sales-walkthrough";
import {
  readPreviewSelection,
  type PreviewQuery,
} from "@/lib/sales-walkthrough";

export default async function CourseOffer({
  searchParams,
}: {
  searchParams: Promise<PreviewQuery>;
}) {
  return (
    <SalesWalkthrough
      step="course"
      selection={readPreviewSelection(await searchParams)}
    />
  );
}
