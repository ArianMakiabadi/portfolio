import type { InquiryFieldErrors, InquiryRequest } from "@/types/inquiry";

type SendInquiryResult =
  | { status: "sent" }
  | { status: "invalid"; fieldErrors: InquiryFieldErrors }
  | { status: "rate_limited" };

// 400 and 429 are expected outcomes the window explains; anything else throws.
export async function sendInquiry(
  request: InquiryRequest,
): Promise<SendInquiryResult> {
  const response = await fetch("/api/inquiries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(request),
  });
  if (response.status === 400) {
    const body: { errors?: InquiryFieldErrors } = await response.json();
    return { status: "invalid", fieldErrors: body.errors ?? {} };
  }
  if (response.status === 429) {
    return { status: "rate_limited" };
  }
  if (!response.ok) {
    throw new Error(`Inquiry failed with status ${response.status}`);
  }
  return { status: "sent" };
}
