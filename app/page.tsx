import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8">
      <div className="max-w-4xl w-full space-y-8">
        <div className="text-center">
          <h1 className="text-5xl font-bold text-gray-900 dark:text-white mb-4">
            P-Bot
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8">
            Sistema de Encuestas y Reportes
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          <Link
            href="/encuesta"
            className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 p-8"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl">
                📝
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Encuesta
              </h2>
              <p className="text-center text-gray-600 dark:text-gray-300">
                Completa nuestra encuesta paso a paso
              </p>
            </div>
          </Link>

          <Link
            href="/dashboard"
            className="group relative overflow-hidden bg-white dark:bg-gray-800 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 p-8"
          >
            <div className="flex flex-col items-center space-y-4">
              <div className="w-16 h-16 bg-indigo-500 rounded-full flex items-center justify-center text-white text-2xl">
                📊
              </div>
              <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">
                Dashboard CEO
              </h2>
              <p className="text-center text-gray-600 dark:text-gray-300">
                Vista de administración y KPIs
              </p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
