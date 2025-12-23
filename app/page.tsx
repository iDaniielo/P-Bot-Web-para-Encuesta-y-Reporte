import Link from "next/link";
import { Gift, BarChart3 } from "lucide-react";

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-red-50 via-white to-green-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4">
            🎄 NavidadSurvey
          </h1>
          <p className="text-xl text-gray-600">
            Comparte tu experiencia navideña con nosotros
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Survey Card */}
          <Link
            href="/encuesta"
            className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-red-500"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <Gift className="w-10 h-10 text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Responder Encuesta
              </h2>
              <p className="text-gray-600">
                Cuéntanos sobre tus planes de regalos navideños en solo 2 minutos
              </p>
              <span className="inline-block text-red-600 font-semibold group-hover:translate-x-2 transition-transform">
                Comenzar →
              </span>
            </div>
          </Link>

          {/* Dashboard Card */}
          <Link
            href="/dashboard"
            className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 p-8 border-2 border-transparent hover:border-green-500"
          >
            <div className="flex flex-col items-center text-center space-y-4">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                <BarChart3 className="w-10 h-10 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Dashboard CEO
              </h2>
              <p className="text-gray-600">
                Visualiza métricas y análisis de las respuestas recopiladas
              </p>
              <span className="inline-block text-green-600 font-semibold group-hover:translate-x-2 transition-transform">
                Ver Dashboard →
              </span>
            </div>
          </Link>
        </div>

        <footer className="text-center mt-12 text-gray-500 text-sm">
          <p>© 2024 NavidadSurvey. Hecho con ❤️ para la temporada navideña</p>
        </footer>
      </div>
    </main>
  );
}
