// WhatsApp floating button — replaces the AI chat bubble
// Opens wa.me link: works on mobile (opens WhatsApp app) and desktop (opens WhatsApp Web)

const WHATSAPP_NUMBER = "8613426056438"; // +86 13426056438, no + or spaces
const WHATSAPP_MESSAGE = encodeURIComponent(
  "Hi! I'm interested in booking a home dining experience in Shanghai with +1 Chopsticks."
);
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`;

export function WhatsAppButton() {
  return (
    <a
      href={WHATSAPP_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full shadow-lg transition-transform hover:scale-110 active:scale-95"
      style={{ backgroundColor: "#25D366" }}
    >
      {/* Official WhatsApp icon SVG */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 32 32"
        className="w-8 h-8"
        fill="white"
      >
        <path d="M16.003 2.667C8.637 2.667 2.667 8.637 2.667 16c0 2.347.637 4.637 1.847 6.637L2.667 29.333l6.88-1.813A13.28 13.28 0 0 0 16.003 29.333c7.363 0 13.33-5.97 13.33-13.333S23.366 2.667 16.003 2.667zm0 24.267a11.04 11.04 0 0 1-5.627-1.547l-.4-.24-4.08 1.08 1.093-4-.267-.413A11.04 11.04 0 0 1 4.96 16c0-6.08 4.96-11.04 11.043-11.04S27.043 9.92 27.043 16 22.083 26.934 16.003 26.934zm6.08-8.267c-.333-.16-1.973-.973-2.28-1.08-.307-.107-.533-.16-.76.16-.227.32-.867 1.08-1.067 1.307-.2.227-.4.24-.733.08-.333-.16-1.413-.52-2.693-1.653-.997-.893-1.667-1.987-1.867-2.32-.2-.333-.02-.507.147-.667.16-.147.333-.373.5-.56.167-.187.213-.32.32-.533.107-.213.053-.4-.027-.56-.08-.16-.76-1.827-1.04-2.507-.267-.64-.547-.56-.76-.573h-.64c-.213 0-.56.08-.853.4-.293.32-1.12 1.093-1.12 2.667s1.147 3.093 1.307 3.307c.16.213 2.253 3.44 5.467 4.827.763.333 1.36.533 1.827.68.76.24 1.453.213 2 .133.613-.093 1.973-.8 2.253-1.573.28-.773.28-1.44.2-1.573-.08-.133-.293-.213-.627-.373z" />
      </svg>
    </a>
  );
}
