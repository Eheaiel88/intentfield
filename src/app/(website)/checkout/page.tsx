import { SalesWalkthrough } from "@/components/sales-walkthrough";

export default function Checkout() {
  return (
    <SalesWalkthrough step="book" selection={{ course: false, audio: false }} />
  );
}
