import type { ContactFormHook } from "@/hooks/useContactForm";
import type { Inquiry } from "@/types/inquiry";

type ContactFormProps = ContactFormHook & {
  recipientName: string;
};

type FieldRowProps = {
  label: string;
  children: React.ReactNode;
};

const INPUT_CLASS =
  "min-w-0 flex-1 border border-[#7f9db9] bg-white px-1 py-0.5 outline-none select-text read-only:bg-[#f4f3ee] read-only:text-[#6f6f6f]";

function FieldRow({ label, children }: FieldRowProps) {
  return (
    <label className="flex items-center gap-2">
      <span className="w-16 shrink-0 text-right">{label}</span>
      {children}
    </label>
  );
}

function ContactForm({ state, actions, recipientName }: ContactFormProps) {
  const { fields, isSending } = state;

  function bind(field: keyof Inquiry) {
    return {
      value: fields[field],
      onChange: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      ) => actions.setField(field, event.target.value),
    };
  }

  return (
    <form
      className="flex h-full flex-col gap-1.5 bg-[#ece9d8] p-2 xp-text"
      onSubmit={(event) => {
        event.preventDefault();
        actions.submit();
      }}
    >
      <FieldRow label="To:">
        <input className={INPUT_CLASS} value={recipientName} readOnly />
      </FieldRow>
      <FieldRow label="Name:">
        <input
          className={INPUT_CLASS}
          required
          maxLength={200}
          autoComplete="name"
          {...bind("name")}
        />
      </FieldRow>
      <FieldRow label="Email:">
        <input
          className={INPUT_CLASS}
          type="email"
          required
          maxLength={200}
          autoComplete="email"
          {...bind("email")}
        />
      </FieldRow>
      <FieldRow label="Subject:">
        <input className={INPUT_CLASS} maxLength={200} {...bind("subject")} />
      </FieldRow>
      <textarea
        className={`${INPUT_CLASS} resize-none`}
        aria-label="Message"
        required
        maxLength={5000}
        {...bind("message")}
      />
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={isSending}
          className="xp-button pointer disabled:pointer-events-none disabled:text-[#a19f92]"
        >
          Send
        </button>
      </div>
    </form>
  );
}

export default ContactForm;
