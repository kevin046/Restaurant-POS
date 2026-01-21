import { useState, useEffect } from 'react'
import POS from '@/pages/POS'
import Kitchen from '@/pages/Kitchen'
import MenuManager from '@/pages/MenuManager'
import Reports from '@/pages/Reports'
import TableSetup from '@/pages/TableSetup'
import { LanguageProvider } from '@/components/pos/LanguageContext'
import { LayoutGrid, ChefHat, Utensils, Settings, BarChart3 } from 'lucide-react'

function App() {
    const [currentPage, setCurrentPage] = useState('pos')

    const renderPage = () => {
        switch (currentPage) {
            case 'pos': return <POS />
            case 'kitchen': return <Kitchen />
            case 'menu': return <MenuManager />
            case 'reports': return <Reports />
            case 'tables': return <TableSetup />
            default: return <POS />
        }
    }

    return (
        <LanguageProvider>
            <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-white font-sans">
                {/* Simple Navigation Sidebar */}
                <aside className="w-20 border-r border-slate-800 flex flex-col items-center py-6 gap-6 bg-slate-900/50 backdrop-blur-xl">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-cyan-600 flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/20">
                        <Utensils className="w-7 h-7 text-white" />
                    </div>

                    <button
                        onClick={() => setCurrentPage('pos')}
                        className={`p-4 rounded-2xl transition-all duration-300 group ${currentPage === 'pos' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 scale-105' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'}`}
                    >
                        <LayoutGrid className="w-6 h-6" />
                    </button>

                    <button
                        onClick={() => setCurrentPage('kitchen')}
                        className={`p-4 rounded-2xl transition-all duration-300 group ${currentPage === 'kitchen' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 scale-105' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'}`}
                    >
                        <ChefHat className="w-6 h-6" />
                    </button>

                    <button
                        onClick={() => setCurrentPage('menu')}
                        className={`p-4 rounded-2xl transition-all duration-300 group ${currentPage === 'menu' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 scale-105' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'}`}
                    >
                        <Utensils className="w-6 h-6" />
                    </button>

                    <div className="flex-1"></div>

                    <button
                        onClick={() => setCurrentPage('reports')}
                        className={`p-4 rounded-2xl transition-all duration-300 group ${currentPage === 'reports' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 scale-105' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'}`}
                    >
                        <BarChart3 className="w-6 h-6" />
                    </button>

                    <button
                        onClick={() => setCurrentPage('tables')}
                        className={`p-4 rounded-2xl transition-all duration-300 group ${currentPage === 'tables' ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/40 scale-105' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'}`}
                    >
                        <Settings className="w-6 h-6" />
                    </button>
                </aside>

                <main className="flex-1 overflow-hidden">
                    {renderPage()}
                </main>
            </div>
        </LanguageProvider>
    )
}

export default App
