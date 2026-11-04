import type { ContactFormHook } from "@/hooks/useContactForm";
import type { Inquiry } from "@/types/inquiry";
import mailtoIcon from "@/assets/window/contact/mailto-icon.webp";

type ContactFormProps = ContactFormHook & {
  recipientName: string;
};

type FieldRowProps = {
  label: string;
  icon?: string;
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

function FieldRow({ label, icon, error, errorId, children }: FieldRowProps) {
  return (
    <div className="flex flex-col gap-[3px]">
      <label className="flex items-center gap-2">
        <span className="flex w-16 shrink-0 items-center justify-end gap-1">
          {icon && <img src={icon} alt="" className="h-4 w-4" />}
          {label}
        </span>
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
  const { fields, fieldErrors, honeypot } = state;

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
    // client-side message length check) render inline after submit. Submitted
    // from the window's toolbar Send button (Outlook Express has no form button).
    <form
      noValidate
      className="relative flex h-full flex-col bg-[#ece9d8] xp-text"
      onSubmit={(event) => {
        event.preventDefault();
        actions.submit();
      }}
    >
      {/* Honeypot: clipped to 1px by sr-only (not display:none, which some bots
          skip), out of the tab order and the accessibility tree, never autofilled. */}
      <div aria-hidden="true" className="sr-only">
        <label>
          Website
          <input
            name="website"
            tabIndex={-1}
            autoComplete="off"
            value={honeypot}
            onChange={(event) => actions.setHoneypot(event.target.value)}
          />
        </label>
      </div>
      <div className="flex flex-col gap-1.5 border-t border-[#aca899] p-2">
        <FieldRow label="To:" icon={mailtoIcon}>
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
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-[3px] border-t border-[#aca899]">
        <textarea
          className={`${INPUT_CLASS} resize-none p-2`}
          aria-label="Message"
          required
          {...bind("message")}
        />
        <FieldError
          id={errorIdFor("message")}
          message={fieldErrors.message}
          className="px-2 pb-1"
        />
      </div>
      {/* Enter in a field submits: implicit submission needs a submit button.
          The visible Send is the window toolbar's. */}
      <button
        type="submit"
        tabIndex={-1}
        aria-hidden="true"
        className="sr-only"
      >
        Send
      </button>
    </form>
  );
}

export default ContactForm;
