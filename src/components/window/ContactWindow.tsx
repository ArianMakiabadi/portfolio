import Window from "./Window";
import ContactForm from "@/components/contact/ContactForm";
import MessageBox from "@/components/shared/MessageBox";
import { contactMeIcon } from "@/data/startMenuIcons";
import infoIcon from "@/assets/window/message-box/info.png";
import { useContactForm } from "@/hooks/useContactForm";
import { useProgressCursor } from "@/hooks/useProgressCursor";

type ContactWindowProps = {
  onClose: () => void;
};

// Display name only: the Owner's email address lives on the server, never here.
const OWNER_DISPLAY_NAME = "Arian Makiabadi";

function ContactWindow({ onClose }: ContactWindowProps) {
  const contactForm = useContactForm();
  const { isSending, isSent } = contactForm.state;

  useProgressCursor(isSending);

  return (
    <Window
      id="contact"
      iconSrc={contactMeIcon}
      title="New Message"
      initialSize={{ width: 480, height: 400 }}
      initialPosition={{ x: 260, y: 90 }}
      minSize={{ width: 320, height: 280 }}
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
    </Window>
  );
}

export default ContactWindow;
