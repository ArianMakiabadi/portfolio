import Window from "./Window";
import ContactForm from "@/components/contact/ContactForm";
import MessageBox from "@/components/shared/MessageBox";
import { contactMeIcon } from "@/data/startMenuIcons";
import infoIcon from "@/assets/window/message-box/info.png";
import errorIcon from "@/assets/window/message-box/error.png";
import { useContactForm } from "@/hooks/useContactForm";
import type { SendError } from "@/types/inquiry";
import { useProgressCursor } from "@/hooks/useProgressCursor";
import sendIcon from "@/assets/window/contact/send-icon.webp";
import cutIcon from "@/assets/window/contact/cut-icon.webp";
import copyIcon from "@/assets/window/contact/copy-icon.webp";
import pasteIcon from "@/assets/window/contact/paste-icon.webp";
import undoIcon from "@/assets/window/contact/undo-icon.webp";
import checkIcon from "@/assets/window/contact/check-icon.webp";
import spellingIcon from "@/assets/window/contact/spelling-icon.webp";
import attachIcon from "@/assets/window/contact/attach-icon.webp";
import priorityIcon from "@/assets/window/contact/priority-icon.webp";
import signIcon from "@/assets/window/contact/sign-icon.webp";
import type { MenuBarMenu } from "@/types/menuBar";
import type { WindowHeaderBarConfig } from "@/types/windowHeaderBar";

type ContactWindowProps = {
  onClose: () => void;
};

// Display name only: the Owner's email address lives on the server, never here.
const OWNER_DISPLAY_NAME = "Arian Makiabadi";

const SEND_ERROR_MESSAGES: Record<SendError, string> = {
  rate_limited: "Too many messages, try again later.",
  failed: "Your message could not be sent. Please try again later.",
};

// Outlook Express "New Message" dressing: every menu is disabled (greyed out,
// never opens).
const MENUS: MenuBarMenu[] = [
  "File",
  "Edit",
  "View",
  "Insert",
  "Format",
  "Tools",
  "Message",
  "Help",
].map((label) => ({ label, items: [], disabled: true }));

function ContactWindow({ onClose }: ContactWindowProps) {
  const contactForm = useContactForm();
  const { isSending, isSent, sendError } = contactForm.state;

  useProgressCursor(isSending);

  // Only Send is wired; the rest is decorative.
  const headerBar: WindowHeaderBarConfig = {
    tools: {
      stacked: true,
      groups: [
        [
          {
            icon: sendIcon,
            label: "Send",
            disabled: isSending,
            onSelect: contactForm.actions.submit,
          },
        ],
        [
          { icon: cutIcon, label: "Cut" },
          { icon: copyIcon, label: "Copy" },
          { icon: pasteIcon, label: "Paste" },
          { icon: undoIcon, label: "Undo" },
        ],
        [
          { icon: checkIcon, label: "Check" },
          { icon: spellingIcon, label: "Spelling" },
        ],
        [
          { icon: attachIcon, label: "Attach" },
          { icon: priorityIcon, label: "Priority" },
        ],
        [{ icon: signIcon, label: "Sign" }],
      ],
    },
  };

  return (
    <Window
      id="contact"
      iconSrc={contactMeIcon}
      title="New Message"
      menus={MENUS}
      headerBar={headerBar}
      initialSize={{ width: 560, height: 460 }}
      initialPosition={{ x: 260, y: 90 }}
      minSize={{ width: 420, height: 340 }}
      onClose={onClose}
    >
      <ContactForm {...contactForm} recipientName={OWNER_DISPLAY_NAME} />
      {isSent && (
        <MessageBox
          title="Message sent"
          icon={infoIcon}
          message="Your message has been sent. Thanks for getting in touch!"
          onOk={onClose}
        />
      )}
      {sendError && (
        <MessageBox
          title="Message not sent"
          icon={errorIcon}
          message={SEND_ERROR_MESSAGES[sendError]}
          onOk={contactForm.actions.dismissSendError}
        />
      )}
    </Window>
  );
}

export default ContactWindow;
