import React from 'react';
import '../css/Footer.css';

const Footer = () => {
  return (
    <footer className="bg-dark text-white py-4">
      <div className="container">
        <div className="row">
          <div className="col-md-4">
            <h5>Contacto</h5>
            <a
              href="mailto:mundoacuaticotuc@gmail.com?subject=Consulta%20Mundo%20Acuático&body=Hola,%20me%20gustaría%20realizar%20la%20siguiente%20consulta:%0A%0A"
              className="link-mail"
              target="_blank"
              rel="noopener noreferrer"
            >
              <p>Email: mundoacuaticotuc@gmail.com</p>
            </a>
            <a
              className="link-wsp"
              href="https://api.whatsapp.com/send/?phone=5493815032401&text&type=phone_number&app_absent=0"
              target="_blank"
              rel="noopener noreferrer"
            >
              <p>Teléfono: +54 9 3815 09-2401</p>
            </a>
          </div>
          <div className="col-md-4">
            <h5>Redes Sociales</h5>
            <a
              href="https://www.instagram.com/mundoacuatico0326?utm_source=qr&igsh=bmhqMnZjeWtnMjhk"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="Btninsta">
                <svg xmlns="http://www.w3.org/2000/svg" height="1.5em" viewBox="0 0 448 512" className="svgIcon">
                  <path d="M224.1 141c-63.6 0-114.9 51.3-114.9 114.9s51.3 114.9 114.9 114.9S339 319.5 339 255.9 287.7 141 224.1 141zm0 189.6c-41.1 0-74.7-33.5-74.7-74.7s33.5-74.7 74.7-74.7 74.7 33.5 74.7 74.7-33.6 74.7-74.7 74.7zm146.4-194.3c0 14.9-12 26.8-26.8 26.8-14.9 0-26.8-12-26.8-26.8s12-26.8 26.8-26.8 26.8 12 26.8 26.8zm76.1 27.2c-1.7-35.9-9.9-67.7-36.2-93.9-26.2-26.2-58-34.4-93.9-36.2-37-2.1-147.9-2.1-184.9 0-35.8 1.7-67.6 9.9-93.9 36.1s-34.4 58-36.2 93.9c-2.1 37-2.1 147.9 0 184.9 1.7 35.9 9.9 67.7 36.2 93.9s58 34.4 93.9 36.2c37 2.1 147.9 2.1 184.9 0 35.9-1.7 67.7-9.9 93.9-36.2 26.2-26.2 34.4-58 36.2-93.9 2.1-37 2.1-147.8 0-184.8zM398.8 388c-7.8 19.6-22.9 34.7-42.6 42.6-29.5 11.7-99.5 9-132.1 9s-102.7 2.6-132.1-9c-19.6-7.8-34.7-22.9-42.6-42.6-11.7-29.5-9-99.5-9-132.1s-2.6-102.7 9-132.1c7.8-19.6 22.9-34.7 42.6-42.6 29.5-11.7 99.5-9 132.1-9s102.7-2.6 132.1 9c19.6 7.8 34.7 22.9 42.6 42.6 11.7 29.5 9 99.5 9 132.1s2.7 102.7-9 132.1z"></path>
                </svg>
                <span className="text-insta">Instagram</span>
              </button>
            </a>
            
            <a
              href="#"
              target="_blank"
              rel="noopener noreferrer"
            >
              <button className="button-face">
                <span className="text-face"></span>
              </button>
            </a>
          </div>
          <div className="col-md-4">
            <h5>Ubicación</h5>
            <p>Viamonte 69, T4000 San Miguel de Tucumán, Tucumán</p>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3560.5579722046914!2d-65.2433550248906!3d-26.82219988942744!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94225cf67b6d6e83%3A0xbf6fa07749d8f23e!2sLDA%2C%20Viamonte%2069%2C%20T4000%20San%20Miguel%20de%20Tucum%C3%A1n%2C%20Provincia%20de%20Tucum%C3%A1n!5e0!3m2!1ses-419!2sar!4v1733687249128!5m2!1ses-419!2sar"
              width="290"
              height="150"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="ubicacion"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;