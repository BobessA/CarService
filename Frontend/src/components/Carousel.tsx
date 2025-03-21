import { useState, useEffect } from "react";
import Slide  from "../models/Slide";

const slides: Slide[] = [
  {
    image: "/images/dia1.webp",
    title: "Professzionális Autószerviz",
    description: "Gyors és megbízható szervizelés a legjobb szakemberekkel.",
    buttonText: "Időpont foglalás",
    buttonLink: "/",
  },
  {
    image: "/images/dia2.webp",
    title: "Modern Diagnosztika",
    description: "Legújabb technológiákkal állunk ügyfeleink rendelkezésére.",
    buttonText: "Szolgáltatások",
    buttonLink: "/services",
  },
  {
    image: "/images/dia3.webp",
    title: "Tapasztalt Szakemberek",
    description: "Több éves tapasztalattal rendelkező szerelőink várják Önt.",
    buttonText: "Kapcsolat",
    buttonLink: "/contact",
  },
];

const Carousel = () => {
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    const interval = setInterval(() => {
      nextSlide();
    }, 7500);
    return () => clearInterval(interval);
  }, [currentIndex]);

  const prevSlide = (): void => {
    setCurrentIndex((prev) => (prev === 0 ? slides.length - 1 : prev - 1));
  };

  const nextSlide = (): void => {
    setCurrentIndex((prev) => (prev === slides.length - 1 ? 0 : prev + 1));
  };

  return (
    <div className="relative w-full h-[500px] overflow-hidden">
      <div
        className="flex transition-transform duration-700 ease-in-out w-full h-full flex-nowrap"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {slides.map((slide, index) => (
          <div key={index} className="relative w-full h-[500px] flex-shrink-0">
            <img
              src={slide.image}
              alt={`Slide ${index}`}
              className="w-full h-full object-cover"
            />
            
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center bg-gray-800/50 p-6">
              <h2 className="text-4xl font-bold text-white">{slide.title}</h2>
              <p className="text-lg text-gray-200 mt-2 max-w-2xl">{slide.description}</p>
              <a
                href={slide.buttonLink}
                className="mt-4 bg-red-600 text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-red-700 transition"
              >
                {slide.buttonText}
              </a>
            </div>
          </div>
        ))}
      </div>

      <button
        onClick={prevSlide}
        className="absolute top-1/2 left-4 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 z-10"
      >
        ❮
      </button>
      <button
        onClick={nextSlide}
        className="absolute top-1/2 right-4 transform -translate-y-1/2 bg-gray-800 text-white p-2 rounded-full shadow-lg hover:bg-gray-700 z-10"
      >
        ❯
      </button>

      <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full ${index === currentIndex ? "bg-white" : "bg-gray-500"} transition-colors`}
          />
        ))}
      </div>
    </div>
  );
};

export default Carousel;
