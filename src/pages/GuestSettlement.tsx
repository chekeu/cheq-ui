import { ArrowLeft, Copy, CheckCircle2, Banknote, Building2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { PageTransition } from '../components/PageTransition';
import { useBillStore } from '../store/useBillStore';

const VenmoIcon = () => <span className="font-bold tracking-tighter italic mr-1">V</span>;

export default function GuestSettlement() {
  const navigate = useNavigate();
  const { items, taxRate, tipRate } = useBillStore();
  
  const [copied, setCopied] = useState(false);
  const [hostHandle, setHostHandle] = useState(''); 

  // Guest Math
  const selectedItems = items.filter(i => i.isSelected);
  const subtotal = selectedItems.reduce((sum, item) => sum + item.price, 0);
  const taxAmount = subtotal * taxRate;
  const tipAmount = subtotal * tipRate;
  const total = subtotal + taxAmount + tipAmount;

  const paymentNote = `Dinner (${selectedItems.length} items) - Cheq`;

  const generateVenmoLink = () => {
    const cleanHandle = hostHandle.replace('@', '');
    const recipientParam = cleanHandle ? `&recipients=${cleanHandle}` : '';
    return `venmo://paycharge?txn=pay&amount=${total.toFixed(2)}${recipientParam}&note=${encodeURIComponent(paymentNote)}`;
  };

  const generateCashAppLink = () => {
    const cleanHandle = hostHandle.replace('$', '');
    if (!cleanHandle) return `https://cash.app/`;
    return `https://cash.app/$${cleanHandle}/${total.toFixed(2)}`;
  };

  const handleCopy = () => {
    const text = `I owe $${total.toFixed(2)} for ${selectedItems.map(i => i.name).join(', ')}`;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <PageTransition>
      <div className="min-h-screen bg-background text-foreground font-sans flex flex-col items-center">
        <div className="w-full max-w-md min-h-screen bg-background flex flex-col relative md:border-x md:border-surface">
          
          <header className="p-6 flex items-center gap-4">
            <button 
              onClick={() => navigate('/split')} 
              className="p-2 -ml-2 text-gray-400 hover:text-white hover:bg-white/5 rounded-full transition-colors"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="text-xl font-bold tracking-tight">Payment</h1>
          </header>

          <main className="flex-1 p-6 pb-32 overflow-y-auto">
            
            {/* RECEIPT CARD */}
            <div className="bg-surface rounded-cheq p-6 mb-8 relative overflow-hidden shadow-lg">
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-50" />
              
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-gray-400 text-sm">
                  <span>Subtotal ({selectedItems.length})</span>
                  <span className="font-mono">${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-gray-400 text-sm">
                  <span>Tax ({(taxRate * 100).toFixed(2)}%)</span>
                  <span className="font-mono">${taxAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between items-center text-brand text-sm font-medium">
                  <span>Tip ({(tipRate * 100).toFixed(0)}%)</span>
                  <span className="font-mono">${tipAmount.toFixed(2)}</span>
                </div>
              </div>

              <div className="border-t border-dashed border-white/20 pt-4 flex justify-between items-end">
                <span className="text-sm font-bold tracking-widest text-gray-400">YOU OWE</span>
                <span className="text-4xl font-mono font-bold text-white tracking-tighter">
                  ${total.toFixed(2)}
                </span>
              </div>
            </div>

            {/* PAYMENT ACTIONS */}
            <div className="space-y-3">
              <div className="mb-4">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-widest ml-1 mb-2 block">
                  Pay To (Username)
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. @jaypark"
                  value={hostHandle}
                  onChange={(e) => setHostHandle(e.target.value)}
                  className="w-full bg-background border border-surface rounded-cheq p-3 text-white placeholder:text-gray-600 focus:border-brand focus:outline-none transition-colors"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <a href={generateVenmoLink()} className="col-span-2 py-4 bg-[#008CFF] hover:bg-[#0074D4] text-white font-bold rounded-cheq flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                  <VenmoIcon /> Venmo
                </a>
                <a href={generateCashAppLink()} className="col-span-1 py-4 bg-[#00D632] hover:bg-[#00B82B] text-white font-bold rounded-cheq flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                  <Banknote size={20} /> Cash App
                </a>
                <button onClick={handleCopy} className="col-span-1 py-4 bg-[#6D1ED4] hover:bg-[#5815B0] text-white font-bold rounded-cheq flex items-center justify-center gap-2 transition-all active:scale-[0.98]">
                  <Building2 size={20} /> Zelle
                </button>
              </div>
            </div>

          </main>
        </div>
      </div>
    </PageTransition>
  )
}