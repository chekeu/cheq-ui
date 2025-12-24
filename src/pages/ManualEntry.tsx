import { ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { PageTransition } from '../components/PageTransition';

export default function ManualEntry() {
  const navigate = useNavigate();

  return (
    <PageTransition>
    <div className="min-h-screen bg-background text-foreground font-sans flex flex-col items-center">
       <div className="w-full max-w-md min-h-screen bg-background flex flex-col relative md:border-x md:border-surface">
        
        {/* Simple Header */}
        <header className="p-6 flex items-center gap-4">
          <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-gray-400 hover:text-white">
            <ArrowLeft size={24} />
          </button>
          <h1 className="text-xl font-bold">Manual Entry</h1>
        </header>

        <main className="p-6">
           <p className="text-gray-500">Form goes here...</p>
        </main>

      </div>
    </div>
    </PageTransition>
  )
}