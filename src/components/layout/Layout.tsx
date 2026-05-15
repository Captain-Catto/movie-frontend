import Header from "./Header";
import Footer from "./Footer";
import ChatWidget from "@/components/chat/ChatWidget";

interface LayoutProps {
  children: React.ReactNode;
  hideHeaderOnPlay?: boolean;
  isPlaying?: boolean;
}

const Layout = ({
  children,
  hideHeaderOnPlay = false,
  isPlaying = false
}: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header
        hideOnPlay={hideHeaderOnPlay}
        isPlaying={isPlaying}
      />
      <main>{children}</main>
      <Footer />
      <ChatWidget />
    </div>
  );
};

export default Layout;
