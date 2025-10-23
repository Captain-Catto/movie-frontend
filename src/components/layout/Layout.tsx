import Header from "./Header";
import Footer from "./Footer";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout = ({ children }: LayoutProps) => {
  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      <main>{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
