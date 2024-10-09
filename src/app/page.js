  "use client"
  import Image from "next/image";
  import styles from "./page.module.css";
  import { FaEnvelope, FaFacebook, FaInstagram, FaPhone, FaTiktok } from "react-icons/fa6";
  import { FaSearch } from "react-icons/fa"
  import { MdSmartphone } from "react-icons/md";
  import { useRef } from "react";

  import { Swiper, SwiperSlide } from 'swiper/react'
  import { Autoplay, Pagination, Navigation } from 'swiper/modules';


  import 'swiper/css';
  import 'swiper/css/pagination';
  import 'swiper/css/navigation';

  export default function Home() {



    return (
      <>
      <header className="firstHeader">
        <div className="firstHeader_item"><FaPhone /> 0777777777</div>
        <div className="firstHeader_item"><FaEnvelope/> email@email.com</div>
      </header>
      
      <header className="secondHeader">
        <section className="secondHeader_img">
          <img src="/royalDesignLogoDesktop.svg"/>
        </section>

        <section className="secondHeader_rest">
          <div className="secondHeader_rest_search">
              <input type="text" name="search" autoComplete="off" placeholder="Cautare" />
              <button><FaSearch /></button>
          </div>

          <div>
            <MdSmartphone /> 0777777777
          </div>
        </section>
        
      </header>
      
      <div className="separator"></div>
      
      <section className="landingPageHrefs">
        <div>
          <a href="">Garduri</a>
        </div>
        <div>
          <a href="">Porti</a>
        </div>
        <div>
          <a href="">Depozitare</a>
        </div>
        <div>
          <a href="">Sablare</a>
        </div>
        <div>
          <a href="">Vopsire</a>
        </div>
        <div>
          <a href="">Restaurare Jante</a>
        </div>
      </section>

      <Swiper
        spaceBetween={30}
        centeredSlides={true}
        autoplay={{
          delay: 4500,
          disableOnInteraction: false,
        }}
        pagination={{
          clickable: true,
        }}
        navigation={true}
        modules={[Autoplay, Pagination, Navigation]}
        className="mySwiper"
        >
        <SwiperSlide><img src="/royalDesignPoza.jpg"/></SwiperSlide>
        <SwiperSlide><img src="/royalDesignPoza2.jpg"/></SwiperSlide>
        <SwiperSlide><img src="/royalDesignPoza3.jpg"/></SwiperSlide>
        <SwiperSlide><img src="/royalDesignPoza4.jpg"/></SwiperSlide>
        <SwiperSlide><img src="/royalDesignPoza5.jpg"/></SwiperSlide>
      </Swiper>

      
      <footer>
        <section>
          <div className="firstOfThreeFlex">
            <img src="/royalDesignLogoMobile.svg" height={150}/>
          </div>

          <div className="secondOfThreeFlex">
            <div className="footerNav">
              <div>
                <a href="">Acasa</a>
              </div>  
              <div>
                <a href="">Despre noi</a>
              </div>  
              <div>
                <a href="">Servicii</a>        
              </div>  
              <div>
                <a href="">Portofoliu</a>
              </div>  
            </div>

            <div>
              <button type="button">Configurator Gard</button>
            </div>
          </div>

          <div className="thirdOfThreeFlex">
            <div>
              <p>Contacteaza-ne</p>
            </div>

            <div className="thirdOfThreeFlex_address">
              <p>Adresa:</p>

              <div>
                Arges,Topoloveni
              </div>
              
              <div>
                Goranesti Nr.86  
              </div>
              <div>
                115503
              </div>

              <div style={{marginTop:'10px'}}>
                <a href="tel:+40"><span style={{fontWeight: 'bolder'}}>Telefon:</span> <span>0777777777</span></a>
              </div>

              <div>
                <a href="mailto:email@email.com"><span style={{fontWeight: 'bold'}}>Email:</span> <span>email@email.com</span></a>
              </div>

              <div className="thirdOfThreeFlex_socials">
                <a href="https://www.google.com" target="_blank"><FaInstagram /></a>
                <a href="https://www.google.com" target="_blank"><FaFacebook /></a>
                <a href="https://www.google.com" target="_blank"><FaTiktok /></a>
              </div>
            </div>
          </div>
          </section>

          <section>
            <p>© 2024 Royal Design All Rights Reserved. Nicio parte a acestei publicații nu poate fi reprodusă, stocată într-un sistem de recuperare sau transmisă sub nicio formă sau prin orice mijloc, electronic, mecanic sau fotocopiere, înregistrare sau în alt mod fără permisiunea prealabilă a editorului.</p>
          </section>
      </footer>

      </>
    )
  }
