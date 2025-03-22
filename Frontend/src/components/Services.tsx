import { Wrench, Car, Shield, BatteryCharging, Droplet, Sparkles, Thermometer, Wind } from "lucide-react"; // Lucide ikonok importálása
import ServiceDescription from "../models/ServiceDescription";

const services: ServiceDescription[] = [
  {
    title: "Autószerelés",
    description: "Minden típusú jármű teljes körű szerelését vállaljuk, legyen szó motorproblémáról, fékhibáról vagy futómű beállításról. Szakértő szerelőink gyors és hatékony munkát biztosítanak, hogy járműved minél hamarabb újra az úton lehessen.",
    icon: <Wrench size={60} className="text-red-600" />,
  },
  {
    title: "Diagnosztika",
    description: "Modern diagnosztikai eszközeink segítségével gyorsan és pontosan azonosítjuk a jármű hibáit. Legyen szó motorelektronikáról, ABS rendszerről vagy más műszaki problémáról, a legújabb technológiákat alkalmazzuk a hiba feltárására és javítására.",
    icon: <Car size={60} className="text-red-600" />,
  },
  {
    title: "Gumi- és futóműszerviz",
    description: "Kerékcsere, centírozás és futómű beállítás a maximális vezetési élmény és biztonság érdekében. Kiváló minőségű gumiabroncsokat kínálunk, és gondoskodunk arról, hogy járműved futóműve megfelelően működjön minden úttípuson.",
    icon: <Shield size={60} className="text-red-600" />,
  },
  {
    title: "Akkumulátor csere",
    description: "Ha az autód nehezen indul, vagy teljesen lemerült az akkumulátor, segítünk! Gyors és megbízható akkumulátor ellenőrzést és cserét biztosítunk, hogy járműved mindig készen álljon az útra.",
    icon: <BatteryCharging size={60} className="text-red-600" />,
  },
  {
    title: "Olajcsere",
    description: "A motorolaj rendszeres cseréje elengedhetetlen a motor hosszú élettartamához. Csúcskategóriás motorolajokat és szűrőket használunk, hogy biztosítsuk az optimális teljesítményt és az alkatrészek védelmét.",
    icon: <Droplet size={60} className="text-red-600" />,
  },
  {
    title: "Autókozmetika",
    description: "Teljes körű autókozmetikai szolgáltatásaink között szerepel a külső és belső tisztítás, polírozás, védőbevonatok felvitele és bőrápolás. Professzionális megoldásainkkal autód újra csillogni fog, mintha új lenne.",
    icon: <Sparkles size={60} className="text-red-600" />,
  },
  {
    title: "Klímatöltés",
    description: "A jármű klímarendszerének megfelelő működése fontos a vezetési komfort és a levegőminőség szempontjából. Rendszeres karbantartással és töltéssel biztosítjuk, hogy klímád hatékonyan és tisztán működjön.",
    icon: <Thermometer size={60} className="text-red-600" />,
  },
  {
    title: "Szélvédő javítás",
    description: "Repedések és kavicsfelverődések javítása, hogy elkerüld a teljes szélvédőcserét. Gyors és költséghatékony megoldásainkkal biztosítjuk a zavartalan kilátást és a jármű biztonságát.",
    icon: <Wind size={60} className="text-red-600" />,
  },
];


const Services = () => {
  return (
    <section className="py-16 bg-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-bold text-center text-gray-800">Szolgáltatásaink</h2>
        <p className="text-center text-gray-600 mt-2">
          Professzionális szervizelés a legmodernebb technológiákkal.
        </p>

        
        <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-6">
          {services.map((service, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition transform hover:-translate-y-2"
            >
              <div className="flex items-center justify-center">{service.icon}</div>
              <h3 className="text-xl font-semibold text-gray-800 mt-4">{service.title}</h3>
              <p className="text-gray-600 mt-2">{service.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Services;
