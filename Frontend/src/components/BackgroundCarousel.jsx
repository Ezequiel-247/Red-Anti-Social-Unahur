import { useState, useEffect } from "react";
import "../style/carousel.css";
import fondo1 from "../public/img/fondo_1.jpg";
import fondo2 from "../public/img/fondo_2.jpg";
import fondo3 from "../public/img/fondo_3.jpg";

const images = [
    fondo1,
    fondo2,
    fondo3
];

    const BackgroundCarousel = () => {
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        // Cambiar imagen cada 5 segundos (5000ms)
        const interval = setInterval(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
        }, 5000);

        return () => clearInterval(interval);
    }, []);

    return (
        <div className="background-carousel">
        {images.map((img, index) => (
            <div
            key={index}
            className={`carousel-image ${index === currentIndex ? "active" : ""}`}
            style={{ backgroundImage: `url(${img})` }}
            />
        ))}
        <div className="carousel-overlay"></div>
        </div>
    );
};

export default BackgroundCarousel;