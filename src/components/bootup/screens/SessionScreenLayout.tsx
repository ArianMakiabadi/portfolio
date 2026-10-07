import type { ReactNode } from "react";

// Shared shell for the full-screen blue XP session screens (welcome, login,
// log off / shutdown): gradient background with the dark top and bottom bars.
// Screens supply only their own content — don't re-create the bars per screen.
//
//   <SessionScreenLayout footer={<p>hint text</p>}>
//     <h1>welcome</h1>
//   </SessionScreenLayout>
type SessionScreenLayoutProps = {
  // Centered horizontally and vertically in the full viewport.
  children: ReactNode;
  // Rendered inside the bottom bar, below the gold line. Brings its own
  // padding/alignment.
  footer?: ReactNode;
};

function SessionScreenLayout({ children, footer }: SessionScreenLayoutProps) {
  return (
    <div className="welcome-bg-gradient min-h-screen relative">
      {/* Top bar */}
      <div className="absolute top-0 h-28 w-full bg-welcome-header">
        <div className="absolute bottom-0 h-0.5 w-full welcome-top-line" />
      </div>
      {/* Content */}
      <div className="flex items-center justify-center min-h-screen">
        {children}
      </div>
      {/* Bottom bar */}
      <div className="absolute bottom-0 h-28 w-full bg-welcome-header">
        <div className="welcome-gold-line h-0.5 w-full" />
        {footer}
      </div>
    </div>
  );
}
export default SessionScreenLayout;
