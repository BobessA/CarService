
import { Link } from '@tanstack/react-router';

const Footer = () => {
    return (
        <footer className="bg-gray-800 text-white py-6 bottom-0 w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center justify-between">
              <div className="text-center md:text-left">
                <h2 className="text-lg font-semibold">🚗 Szervíz</h2>
                <p className="text-sm text-gray-400">&copy; 2025 Minden jog fenntartva.</p>
              </div>
  
                <div className="mt-4 md:mt-0 flex space-x-6">
                    <Link to="/aboutus" className="text-gray-300 hover:text-white">Rólunk</Link>
                    <Link to="/services" className="text-gray-300 hover:text-white">Szervíz</Link>
                    <Link to="/contact" className="text-gray-300 hover:text-white">Kapcsolat</Link>
                </div>
    
              <div className="mt-4 md:mt-0 flex space-x-4">
                <a href="#" className="text-gray-300 hover:text-white">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.46 6c-.77.35-1.6.58-2.46.69a4.29 4.29 0 0 0 1.88-2.37c-.83.49-1.76.84-2.75 1.03A4.29 4.29 0 0 0 16.43 4c-2.36 0-4.29 1.92-4.29 4.29 0 .34.04.67.12 1C8.16 9.18 5.13 7.38 3.07 4.63a4.3 4.3 0 0 0-.58 2.16c0 1.49.76 2.8 1.92 3.57-.7-.02-1.35-.21-1.93-.53v.05c0 2.08 1.48 3.81 3.45 4.2-.36.1-.75.16-1.15.16-.28 0-.55-.03-.81-.08.55 1.7 2.15 2.93 4.04 2.96a8.6 8.6 0 0 1-5.32 1.84c-.35 0-.7-.02-1.04-.06a12.15 12.15 0 0 0 6.57 1.92c7.87 0 12.18-6.52 12.18-12.18 0-.19 0-.37-.01-.56a8.57 8.57 0 0 0 2.1-2.18z"/>
                  </svg>
                </a>
                <a href="#" className="text-gray-300 hover:text-white">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M19.67 3H4.33C3.6 3 3 3.6 3 4.33v15.34c0 .73.6 1.33 1.33 1.33h8.67V14h-2.5v-2.5h2.5V9.33c0-2.5 1.5-3.92 3.75-3.92 1.1 0 2.25.19 2.25.19v2.42h-1.27c-1.25 0-1.66.78-1.66 1.57V11.5h2.83L16.67 14h-2.17v7.17h5.17c.73 0 1.33-.6 1.33-1.33V4.33c0-.73-.6-1.33-1.33-1.33z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        </footer>
      );
}

export default Footer
