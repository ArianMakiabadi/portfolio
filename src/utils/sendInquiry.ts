import type { Inquiry } from "@/types/inquiry";

export async function sendInquiry(inquiry: Inquiry): Promise<void> {
  const response = await fetch("/api/inquiries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(inquiry),
  });
  if (!response.ok) {
    throw new Error(`Inquiry failed with status ${response.status}`);
  }
}
