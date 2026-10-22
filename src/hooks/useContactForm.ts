import { useState } from "react";
import type { Inquiry } from "@/types/inquiry";
import { sendInquiry } from "@/utils/sendInquiry";

const EMPTY_INQUIRY: Inquiry = {
  name: "",
  email: "",
  subject: "",
  message: "",
};

export function useContactForm() {
  const [fields, setFields] = useState<Inquiry>(EMPTY_INQUIRY);
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);

  function setField(field: keyof Inquiry, value: string) {
    setFields((current) => ({ ...current, [field]: value }));
  }

  async function submit() {
    if (isSending) return;
    setIsSending(true);
    try {
      await sendInquiry(fields);
      setIsSent(true);
    } catch (error) {
      // Error message boxes come in a later ticket; the draft is kept either way.
      console.error(error);
    } finally {
      setIsSending(false);
    }
  }

  return {
    state: { fields, isSending, isSent },
    actions: { setField, submit },
  };
}

export type ContactFormHook = ReturnType<typeof useContactForm>;
