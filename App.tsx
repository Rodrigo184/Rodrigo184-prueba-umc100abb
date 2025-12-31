
import React, { useState, useMemo } from 'react';
import { SECTIONS } from './data';
import { SelectionState, ComponentOption } from './types';
import { 
  ClipboardDocumentListIcon, 
  CheckCircleIcon, 
  ArrowPathIcon,
  InformationCircleIcon,
  CpuChipIcon,
  PrinterIcon
} from '@heroicons/react/24/outline';

const App: React.FC = () => {
  const [selections, setSelections] = useState<SelectionState>({});
  const [showResults, setShowResults] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSelection = (sectionId: string, optionId: string, isMultiple: boolean) => {
    setSelections(prev => {
      if (isMultiple) {
        const current = (prev[sectionId] as string[]) || [];
        if (current.includes(optionId)) {
          // Si ya está seleccionado, quitarlo
          const nextSelections = { ...prev };
          const newList = current.filter(id => id !== optionId);
          if (newList.length === 0) {
            delete nextSelections[sectionId];
          } else {
            nextSelections[sectionId] = newList;
          }
          return nextSelections;
        } else {
          // Si no está, agregarlo
          return { ...prev, [sectionId]: [...current, optionId] };
        }
      } else {
        // Lógica para selección única: permitir deseleccionar al hacer clic de nuevo
        if (prev[sectionId] === optionId) {
          const nextSelections = { ...prev };
          delete nextSelections[sectionId];
          return nextSelections;
        } else {
          return { ...prev, [sectionId]: optionId };
        }
      }
    });
    setShowResults(false);
    setError(null);
  };

  const selectedComponents = useMemo(() => {
    const list: ComponentOption[] = [];
    SECTIONS.forEach(section => {
      const selection = selections[section.id];
      if (!selection) return;

      if (Array.isArray(selection)) {
        selection.forEach(optId => {
          const opt = section.options.find(o => o.id === optId);
          if (opt && opt.orderCode !== 'N/A') list.push(opt);
        });
      } else {
        const opt = section.options.find(o => o.id === selection);
        if (opt && opt.orderCode !== 'N/A') list.push(opt);
      }
    });
    return list;
  }, [selections]);

  const generateList = () => {
    if (!selections['A']) {
      setError('Error: Se debe seleccionar un Controlador Base en la SECCIÓN A.');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    setError(null);
    setShowResults(true);
    // Scroll suave a los resultados
    setTimeout(() => {
      const resultsEl = document.getElementById('results-area');
      resultsEl?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const resetSelections = () => {
    setSelections({});
    setShowResults(false);
    setError(null);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen pb-12">
      {/* Header */}
      <header className="bg-slate-900 text-white py-8 px-4 shadow-lg sticky top-0 z-20 print:hidden">
        <div className="max-w-5xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="bg-blue-600 p-3 rounded-xl shadow-lg">
              <CpuChipIcon className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">UMC100.3 Selector</h1>
              <p className="text-slate-400 text-sm">Herramienta de Configuración de Componentes</p>
            </div>
          </div>
          <div className="flex gap-3">
            <button 
              onClick={resetSelections}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors text-sm font-medium"
            >
              <ArrowPathIcon className="w-4 h-4" />
              Reiniciar
            </button>
            <button 
              onClick={generateList}
              className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg transition-all shadow-md active:scale-95 text-sm font-bold"
            >
              <ClipboardDocumentListIcon className="w-5 h-5" />
              Generar Lista
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 mt-8 space-y-8">
        {/* Alerta de Error */}
        {error && (
          <div className="bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm animate-pulse">
            <div className="flex items-center">
              <InformationCircleIcon className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* Secciones de Configuración */}
        <div className="grid grid-cols-1 gap-6 print:hidden">
          {SECTIONS.map((section) => (
            <section key={section.id} className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden transition-all hover:shadow-md">
              <div className="bg-slate-50 border-b border-slate-100 p-4 flex justify-between items-center">
                <h2 className="font-bold text-slate-800 text-lg">{section.title}</h2>
                {section.id === 'A' && (
                  <span className="text-xs font-bold uppercase tracking-widest px-2 py-1 bg-red-100 text-red-600 rounded">Obligatorio</span>
                )}
              </div>
              <div className="p-6">
                <p className="text-slate-500 text-sm mb-4 font-medium uppercase tracking-wide">{section.question}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {section.options.map((option) => {
                    const isSelected = section.isMultiple 
                      ? (selections[section.id] as string[] || []).includes(option.id)
                      : selections[section.id] === option.id;

                    return (
                      <div 
                        key={option.id}
                        onClick={() => handleSelection(section.id, option.id, section.isMultiple)}
                        className={`
                          relative flex flex-col p-4 rounded-xl border-2 cursor-pointer transition-all h-full
                          ${isSelected 
                            ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-500 ring-opacity-20 shadow-sm' 
                            : 'border-slate-100 hover:border-slate-300 bg-white'}
                        `}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className={`text-sm font-bold ${isSelected ? 'text-blue-700' : 'text-slate-700'}`}>
                            {option.id}. {option.label}
                          </span>
                          {isSelected && <CheckCircleIcon className="w-5 h-5 text-blue-600" />}
                        </div>
                        {option.orderCode !== 'N/A' && (
                          <div className="mt-auto pt-2 border-t border-slate-100">
                             <span className="text-[10px] text-slate-400 font-mono block">STYLE NUMBER:</span>
                             <span className="text-[11px] font-mono text-slate-600 truncate">{option.orderCode}</span>
                          </div>
                        )}
                        {isSelected && !section.isMultiple && (
                           <div className="absolute -top-1 -right-1 flex h-4 w-4">
                             <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-20"></span>
                           </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </section>
          ))}
        </div>

        {/* Área de Resultados */}
        {showResults && (
          <div id="results-area" className="bg-white rounded-3xl shadow-xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 print:shadow-none print:border-none">
            <div className="bg-blue-600 p-6 flex justify-between items-center text-white print:bg-white print:text-black print:border-b-2 print:border-black">
              <div className="flex items-center gap-3">
                <ClipboardDocumentListIcon className="w-8 h-8" />
                <h2 className="text-2xl font-bold">Resumen de Configuración</h2>
              </div>
              <button 
                onClick={handlePrint}
                className="flex items-center gap-2 px-4 py-2 bg-blue-700 hover:bg-blue-800 rounded-lg text-sm font-bold transition-colors print:hidden"
              >
                <PrinterIcon className="w-5 h-5" />
                Imprimir / PDF
              </button>
            </div>
            
            <div className="p-8">
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b-2 border-slate-100">
                      <th className="py-4 px-2 text-slate-400 font-bold text-xs uppercase tracking-wider">Sección</th>
                      <th className="py-4 px-2 text-slate-400 font-bold text-xs uppercase tracking-wider">Descripción del Componente</th>
                      <th className="py-4 px-2 text-slate-400 font-bold text-xs uppercase tracking-wider">Order Code (Style Number)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-50">
                    {selectedComponents.map((comp, idx) => {
                      const sectionInfo = SECTIONS.find(s => s.options.some(o => o.id === comp.id));
                      return (
                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                          <td className="py-5 px-2">
                            <span className="bg-slate-100 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
                              {sectionInfo?.id || '-'}
                            </span>
                          </td>
                          <td className="py-5 px-2">
                            <div className="font-semibold text-slate-800">{comp.label}</div>
                            <div className="text-slate-500 text-xs mt-1">{comp.description}</div>
                          </td>
                          <td className="py-5 px-2">
                            <span className="font-mono text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded border border-blue-100">
                              {comp.orderCode}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              
              {selectedComponents.length === 0 && (
                <div className="text-center py-12">
                  <InformationCircleIcon className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                  <p className="text-slate-400">No se han seleccionado componentes adicionales.</p>
                </div>
              )}

              <div className="mt-8 pt-8 border-t border-slate-100 flex justify-between items-center text-slate-400 text-sm italic print:hidden">
                 <p>Generado automáticamente - Configuración UMC100.3</p>
                 <p>{new Date().toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        )}
      </main>

      <footer className="mt-12 text-center text-slate-400 text-sm print:hidden">
        <p>© {new Date().getFullYear()} Universal Motor Controller Configurator Remygallegos COMPANY</p>
      </footer>
    </div>
  );
};

export default App;
