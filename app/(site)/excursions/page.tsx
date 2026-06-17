import { redirect } from "next/navigation";

export default function ExcursionsPage() {
  redirect("/map?filter=guided");
}
