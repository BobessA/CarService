import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/aboutus')({
  component: RouteComponent,
})

function RouteComponent() {
    return (
        <section className="bg-gray-100 py-16">
          <div className="max-w-7xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
              <div>
                <h2 className="text-4xl font-extrabold text-gray-900">
                  Miért válasszon minket?
                </h2>
                <p className="mt-4 text-gray-700 text-lg leading-relaxed">
                  Cégünk több mint egy évtizede nyújt kiemelkedő minőségű autószerviz 
                  szolgáltatásokat ügyfeleink számára. Elkötelezettek vagyunk amellett, 
                  hogy járműve **biztonságosan, hatékonyan és problémamentesen** működjön.  
                  Legyen szó **olajcseréről, teljeskörű diagnosztikáról vagy futómű beállításról**,  
                  szakértő csapatunk minden kihívást magabiztosan kezel.
                </p>
                <p className="mt-4 text-gray-700 text-lg leading-relaxed">
                  **Ügyfélközpontú szemléletünknek** köszönhetően az Ön kényelme és elégedettsége 
                  áll az első helyen. Modern, jól felszerelt műhelyünkben kizárólag **csúcstechnológiás 
                  eszközöket és prémium minőségű alkatrészeket** használunk.  
                  Szervizünk gyors, átlátható és megbízható – nálunk nem kell aggódnia rejtett költségek miatt.
                </p>
                <p className="mt-4 text-gray-700 text-lg leading-relaxed">
                  Amennyiben kérdése van, vagy szeretne időpontot foglalni, lépjen kapcsolatba velünk!  
                  Célunk, hogy minden ügyfelünk **elégedetten és biztonságosan** hagyja el szervizünket.
                </p>
                <a
                  href="/kapcsolat"
                  className="mt-6 inline-block bg-red-600 text-white px-6 py-3 rounded-md text-lg font-medium hover:bg-red-700 transition"
                >
                  Lépjen kapcsolatba velünk
                </a>
              </div>
    
              <div className="relative">
                <img
                  src="/images/about-us.webp"
                  alt="Szervizünk"
                  className="w-full rounded-lg shadow-lg"
                />
                <div className="absolute top-0 left-0 bg-red-600 text-white px-4 py-2 rounded-br-lg">
                  Több mint 10 év tapasztalat
                </div>
              </div>
            </div>
          </div>
        </section>
      );
}
