import React, { useState } from 'react';
import '../css/Home.css';
import aquagym from '../assets/aquagym.jpg';
import natacionAdultos from '../assets/natacion-adultos.jpeg';
import natacionNinos from '../assets/natacion-ninos.jpeg';
import rehabilitacion from '../assets/rehabilitacion.jpeg';
import tea from '../assets/natacion-tea.jpeg';
import Noticias from '../components/Noticias';
import logo from '../assets/logo.jpeg';

const Home = () => {
  const clases = [
    {
      imagen: aquagym,
      formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSdLp9Hjs6Xw6MsnQzEf1WbKJQjjMPXr2CSekTmxKuS_eZEZWw/viewform',
      alt: 'Clase de Aquagym',
      titulo: 'Aquagym',
      horarios: [
        { dias: 'Lunes y Miércoles', horas: '10:00 - 11:00' },
        { dias: 'Martes y Jueves', horas: '18:00 - 19:00' }
      ]
    },
    {
      imagen: natacionAdultos,
      formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSesrnwlyjFobXlb9ypQSkDuUsrFUicKesPEJypQjzFJqCy0Hw/viewform',
      alt: 'Clase de natación para jóvenes y adultos',
      titulo: 'Jóvenes y Adultos',
      horarios: [
        { dias: 'Lunes y Miércoles', horas: '19:00 - 20:00' },
        { dias: 'Martes y Jueves', horas: '20:00 - 21:00' }
      ]
    },
    {
      imagen: natacionNinos,
      formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSdevB50WXnqPiXVQ0v3hOxNmWUMMVGJuheAM6M19ZsKgXi6Fg/viewform',
      alt: 'Clase de natación para niños',
      titulo: 'Natación para Niños',
      horarios: [
        { dias: 'Lunes y Miércoles', horas: '15:00 - 16:00' },
        { dias: 'Martes y Jueves', horas: '16:00 - 17:00' },
        { dias: 'Sábados', horas: '10:00 - 11:00' }
      ]
    },
    {
      imagen: rehabilitacion,
      alt: 'Clase de rehabilitación acuática',
      titulo: 'Rehabilitación',
      proximamente: true,
      horarios: [
        { dias: 'Lunes y Miércoles', horas: '11:00 - 12:00' },
        { dias: 'Martes y Jueves', horas: '17:00 - 18:00' }
      ]
    },
    {
      imagen: tea,
      formUrl: 'https://docs.google.com/forms/d/e/1FAIpQLSeoZ48yDN2Bom2ZOF4FzdKNBxotek8jdrpYwwuGtAMi3LxelA/viewform',
      alt: 'Clase de natación para personas con TEA',
      titulo: 'Natación TEA',
      horarios: [
        { dias: 'Viernes', horas: '16:00 - 17:00' },
        { dias: 'Sábados', horas: '11:00 - 12:00' }
      ]
    }
  ];

  const [showNoticias, setShowNoticias] = useState(false);

  const toggleNoticias = () => {
    setShowNoticias(!showNoticias);
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <main className="home-main">
      <section className="hero">
        <div className="container">
          <img src={logo} alt="Logo Mundo Acuático" className="hero-logo" />
          <h1>La Mejor Escuela De Natación En Tucumán</h1>
          <p>Descubre el placer de las actividades acuáticas para todas las edades</p>
          <a onClick={toggleNoticias} className="c-button c-button--gooey">
            Noticias
            <div className="c-button__blobs">
              <div></div>
              <div></div>
              <div></div>
            </div>
          </a>
        </div>
      </section>

      <Noticias 
        isVisible={showNoticias} 
        onClose={() => setShowNoticias(false)} 
      />

      <section id="clases" className="clases-section">
        <div className="container">
          <h2 className="section-title">Nuestras Clases</h2>
          <div className="clases-grid">
            {clases.map((clase, index) => (
              <article className="clase-card" key={index}>
                <div className="clase-content">
                  <img 
                    src={clase.imagen} 
                    alt={clase.alt}
                    loading="lazy"
                    className="clase-imagen"
                  />
                  <h3 className="clase-titulo">{clase.titulo}</h3>
                  <div className="clase-horarios">
                    {clase.horarios && clase.horarios.map((horario, idx) => (
                      <div key={idx} className="horario-item">
                        <p className="dias">{horario.dias}</p>
                        <p className="horas">{horario.horas}</p>
                      </div>
                    ))}
                  </div>
                  {clase.proximamente ? (
                    <button className="buton type1" disabled>
                      <span className="btn-txt">Muy Pronto</span>
                    </button>
                  ) : clase.formUrl && (
                    <button
                      onClick={() => window.open(clase.formUrl, '_blank', 'noopener noreferrer')}
                      className="buton type1"
                    >
                      <span className="btn-txt">Inscribirse</span>
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
          <div className="scroll-top-container">
            <button 
              className="scroll-to-top"
              onClick={scrollToTop}
              aria-label="Volver al principio"
            >
              Volver al principio
            </button>
          </div>
        </div>
      </section>

      <svg xmlns="http://www.w3.org/2000/svg" version="1.1" style={{ display: 'none' }}>
        <defs>
          <filter id="goo">
            <feGaussianBlur in="SourceGraphic" stdDeviation="10" result="blur" />
            <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 18 -7" result="goo" />
            <feBlend in="SourceGraphic" in2="goo" />
          </filter>
        </defs>
      </svg>
    </main>
  );
};

export default Home;