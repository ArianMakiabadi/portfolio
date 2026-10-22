import type { Inquiry, InquiryFieldErrors } from "@/types/inquiry";

type SendInquiryResult =
  { ok: true } | { ok: false; fieldErrors: InquiryFieldErrors };

// A 400 is an expected outcome (the Visitor fixes the fields); anything else throws.
export async function sendInquiry(
  inquiry: Inquiry,
): Promise<SendInquiryResult> {
  const response = await fetch("/api/inquiries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(inquiry),
  });
  if (response.status === 400) {
    const body: { errors?: InquiryFieldErrors } = await response.json();
    return { ok: false, fieldErrors: body.errors ?? {} };
  }
  if (!response.ok) {
    throw new Error(`Inquiry failed with status ${response.status}`);
  }
  return { ok: true };
}
