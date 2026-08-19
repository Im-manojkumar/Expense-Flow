import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

export default function Incomes() {
  const { api, user } = useAuth();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef(null);

  useEffect(() => {
    fetchIncomes();
  }, []);

  const fetchIncomes = async () => {
    try {
      const incomesRes = await api.get('/incomes/');
      const rawIncomes = incomesRes.data.results || incomesRes.data;

      const mappedIncomes = rawIncomes.map(i => ({
        id: `inc_${i.id}`,
        title: i.category,
        subtitle: "Income",
        amount: parseFloat(i.amount),
        date: new Date(i.date),
        type: 'income'
      }));

      const merged = mappedIncomes.sort((a, b) => b.date - a.date);
      setTransactions(merged);
    } catch (error) {
      console.error("Failed to fetch incomes:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportCSV = async () => {
    try {
      const response = await api.get('/incomes/export/csv/', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'incomes.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error) {
      console.error('Failed to export CSV:', error);
      alert('Failed to export CSV.');
    }
  };

  const handleImportCSV = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      setLoading(true);
      const res = await api.post('/incomes/import/csv/', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      alert(res.data.message || 'Import successful');
      fetchIncomes();
    } catch (error) {
      console.error('Import failed:', error);
      alert('Failed to import CSV: ' + (error.response?.data?.detail || error.message));
      setLoading(false);
    }
    
    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: user?.currency || 'USD', signDisplay: 'always' }).format(amount);
  };

  const getIcon = (type, title) => {
    return { icon: 'work', bg: 'bg-success/20', text: 'text-success' };
  };

  // Group by date string (e.g., "Aug 18, 2026")
  const groupedTransactions = transactions.reduce((groups, tx) => {
    const dateStr = tx.date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    if (!groups[dateStr]) groups[dateStr] = [];
    groups[dateStr].push(tx);
    return groups;
  }, {});

  return (
    <div className="space-y-xl pb-xl">
      <div className="mb-xl flex flex-col md:flex-row gap-md justify-between items-start md:items-center">
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">Incomes</h1>
        <div className="flex w-full md:w-auto gap-sm">
          <div className="relative w-full md:w-64">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-outline">search</span>
            <input className="w-full pl-10 pr-4 py-2 bg-surface-container-lowest border border-outline-variant rounded-lg text-body-md focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all text-on-surface" placeholder="Search incomes..." type="text"/>
          </div>
          <input 
            type="file" 
            accept=".csv" 
            ref={fileInputRef} 
            onChange={handleImportCSV} 
            className="hidden" 
          />
          <button onClick={() => fileInputRef.current?.click()} className="px-4 py-2 bg-primary text-on-primary font-label-md rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sm">upload</span>
            Import
          </button>
          <button onClick={handleExportCSV} className="px-4 py-2 bg-secondary text-on-secondary font-label-md rounded-lg hover:bg-secondary-container hover:text-on-secondary-container transition-colors flex items-center justify-center gap-2">
            <span className="material-symbols-outlined text-sm">download</span>
            Export
          </button>
          <button aria-label="Filter" className="p-2 border border-outline-variant rounded-lg bg-surface-container-lowest text-on-surface hover:bg-surface-container-low transition-colors flex items-center justify-center">
            <span className="material-symbols-outlined">filter_list</span>
          </button>
        </div>
      </div>

      <div className="flex gap-sm overflow-x-auto pb-sm mb-md scrollbar-hide">
        <button className="px-md py-1 border border-outline-variant rounded-full text-label-md font-label-md flex items-center gap-xs whitespace-nowrap bg-surface-container-lowest hover:bg-surface-container-low text-on-surface">
          Date <span className="material-symbols-outlined text-sm">arrow_drop_down</span>
        </button>
        <button className="px-md py-1 border border-outline-variant rounded-full text-label-md font-label-md flex items-center gap-xs whitespace-nowrap bg-surface-container-lowest hover:bg-surface-container-low text-on-surface">
          Category <span className="material-symbols-outlined text-sm">arrow_drop_down</span>
        </button>
      </div>

      <div className="bg-surface-container-lowest rounded-xl shadow-[0px_4px_20px_rgba(0,0,0,0.04)] p-lg">
        {loading ? (
          <p className="text-on-surface-variant py-4">Loading incomes...</p>
        ) : Object.keys(groupedTransactions).length === 0 ? (
          <p className="text-on-surface-variant py-4">No incomes found.</p>
        ) : (
          Object.entries(groupedTransactions).map(([dateStr, txs]) => (
            <div key={dateStr} className="mb-md last:mb-0">
              <div className="text-label-md font-label-md text-on-surface-variant mb-sm uppercase tracking-wider">{dateStr}</div>
              <ul className="flex flex-col">
                {txs.map(tx => {
                  const style = getIcon(tx.type, tx.title);
                  return (
                    <li key={tx.id} className="flex items-center justify-between py-md border-b border-surface-container-high last:border-0 hover:bg-surface-container-low transition-colors -mx-lg px-lg">
                      <div className="flex items-center gap-md">
                        <div className={`w-10 h-10 rounded-full ${style.bg} flex items-center justify-center ${style.text}`}>
                          <span className="material-symbols-outlined">{style.icon}</span>
                        </div>
                        <div>
                          <div className="font-body-md text-on-surface">{tx.title}</div>
                          <div className="text-sm text-on-surface-variant flex gap-sm items-center">
                            <span>{tx.subtitle}</span>
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`font-headline-md ${tx.amount < 0 ? 'text-error' : 'text-success'}`}>
                          {formatCurrency(tx.amount)}
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
