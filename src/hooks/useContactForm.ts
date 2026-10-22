import { useState } from "react";
import type { Inquiry, InquiryFieldErrors } from "@/types/inquiry";
import { sendInquiry } from "@/utils/sendInquiry";

const EMPTY_INQUIRY: Inquiry = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

// Mirrors the server's message rule (server/src/inquiry.ts), which stays the backstop.
// Checked here so an over-long message never leaves the browser.
const MESSAGE_MAX_LENGTH = 1000;
const MESSAGE_TOO_LONG = `Message must be ${MESSAGE_MAX_LENGTH} characters or fewer.`;

export function useContactForm() {
  const [fields, setFields] = useState<Inquiry>(EMPTY_INQUIRY);
  const [fieldErrors, setFieldErrors] = useState<InquiryFieldErrors>({});
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  function setField(field: keyof Inquiry, value: string) {
    setFields((current) => ({ ...current, [field]: value }));
  }

  async function submit() {
    if (isSending) return;
    // Trimmed like the server does, so both sides count the same characters.
    if (fields.message.trim().length > MESSAGE_MAX_LENGTH) {
      setFieldErrors({ message: MESSAGE_TOO_LONG });
      return;
    }
    setIsSending(true);
    try {
      const result = await sendInquiry(fields);
      // Errors are replaced per response, so a fixed field's error clears on resend.
      if (result.ok) {
        setFieldErrors({});
        setIsSent(true);
      } else {
        setFieldErrors(result.fieldErrors);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsSending(false);
    }
  }

  return {
    state: { fields, fieldErrors, isSending, isSent },
    actions: { setField, submit },
  };
}

export type ContactFormHook = ReturnType<typeof useContactForm>;
