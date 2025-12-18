import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar.jsx';
import Hero from '../components/Hero.jsx';
import Features from '../components/Features.jsx';
import Stats from '../components/Stats.jsx';
import Footer from '../components/Footer.jsx';

export default function HomePage() {
  useEffect(() => {
    document.documentElement.classList.add('scroll-smooth');
  }, []);

  return (
    <div className="bg-gray-50">
      <Navbar />
      <main>
        <Hero />
        <Features />
        {/* <Stats /> */}
      </main>
      <Footer />
    </div>
  );
}