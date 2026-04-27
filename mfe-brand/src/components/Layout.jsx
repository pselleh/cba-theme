import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }) {
  return (
    <div className="cba-layout">
      <Header />
      <main className="cba-layout__content">{children}</main>
      <Footer />
    </div>
  );
}
