import type { ContactFormHook } from "@/hooks/useContactForm";
import type { Inquiry } from "@/types/inquiry";

type ContactFormProps = ContactFormHook & {
  recipientName: string;
};

type FieldRowProps = {
  label: string;
  error?: string;
  errorId?: string;
  children: React.ReactNode;
};

type FieldErrorProps = {
  id: string;
  message?: string;
  className?: string;
};

const INPUT_CLASS =
  "min-w-0 flex-1 border border-[#7f9db9] bg-white px-1 py-0.5 outline-none select-text read-only:bg-[#f4f3ee] read-only:text-[#6f6f6f] aria-[invalid=true]:border-[#cc0000]";

function errorIdFor(field: keyof Inquiry) {
  return `contact-${field}-error`;
}

function FieldError({ id, message, className = "" }: FieldErrorProps) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className={`text-[#cc0000] ${className}`}>
      {message}
    </p>
  );
}

function FieldRow({ label, error, errorId, children }: FieldRowProps) {
  return (
    <div className="flex flex-col gap-[3px]">
      <label className="flex items-center gap-2">
        <span className="w-16 shrink-0 text-right">{label}</span>
        {children}
      </label>
      {/* Indented past the label column (w-16 + gap-2) to sit under the input. */}
      {errorId && (
        <FieldError id={errorId} message={error} className="ml-[72px]" />
      )}
    </div>
  );
}

function ContactForm({ state, actions, recipientName }: ContactFormProps) {
  const { fields, fieldErrors, isSending } = state;

  function bind(field: keyof Inquiry) {
    const hasError = Boolean(fieldErrors[field]);
    return {
      value: fields[field],
      "aria-invalid": hasError || undefined,
      "aria-describedby": hasError ? errorIdFor(field) : undefined,
      onChange: (
        event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
      ) => actions.setField(field, event.target.value),
    };
  }

  return (
    // noValidate: no native validation popups. Errors (server fields, plus the
    // client-side message length check) render inline after submit.
    <form
      noValidate
      className="flex h-full flex-col gap-1.5 bg-[#ece9d8] p-2 xp-text"
      onSubmit={(event) => {
        event.preventDefault();
        actions.submit();
      }}
    >
      <FieldRow label="To:">
        <input className={INPUT_CLASS} value={recipientName} readOnly />
      </FieldRow>
      <FieldRow
        label="Name:"
        error={fieldErrors.name}
        errorId={errorIdFor("name")}
      >
        <input
          className={INPUT_CLASS}
          required
          maxLength={200}
          autoComplete="name"
          {...bind("name")}
        />
      </FieldRow>
      <FieldRow
        label="Email:"
        error={fieldErrors.email}
        errorId={errorIdFor("email")}
      >
        <input
          className={INPUT_CLASS}
          type="email"
          required
          maxLength={200}
          autoComplete="email"
          {...bind("email")}
        />
      </FieldRow>
      <FieldRow
        label="Subject:"
        error={fieldErrors.subject}
        errorId={errorIdFor("subject")}
      >
        <input className={INPUT_CLASS} maxLength={200} {...bind("subject")} />
      </FieldRow>
      <div className="flex min-h-0 flex-1 flex-col gap-[3px]">
        <textarea
          className={`${INPUT_CLASS} resize-none`}
          aria-label="Message"
          required
          {...bind("message")}
        />
        <FieldError id={errorIdFor("message")} message={fieldErrors.message} />
      </div>
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
