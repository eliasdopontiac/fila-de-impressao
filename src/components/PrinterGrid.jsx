import React, { useState } from 'react';
import { Printer, Plus, Flame, CheckCircle2, Wrench, X } from 'lucide-react';
import { usePrintQueue } from '../context/PrintQueueContext';
import PrinterCard from './PrinterCard';

export default function PrinterGrid() {
  const { printers, addPrinter } = usePrintQueue();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    model: 'CoreXY High-Speed',
    maxBuildVolume: '220 x 220 x 250 mm',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    addPrinter(formData);
    setIsAddModalOpen(false);
    setFormData({
      name: '',
      model: 'CoreXY High-Speed',
      maxBuildVolume: '220 x 220 x 250 mm',
    });
  };

  const activeCount = printers.filter((p) => p.status === 'printing').length;
  const idleCount = printers.filter((p) => p.status === 'idle').length;
  const maintenanceCount = printers.filter((p) => p.status === 'maintenance').length;

  return (
    <div className="space-y-6">
      
      {/* Top Header & Fleet Stats */}
      <div className="glass-panel p-5 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Printer className="w-6 h-6 text-blue-600" />
              Frota de Impressoras 3D
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Monitoramento térmico e de produção em tempo real de toda a frota de equipamentos.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Adicionar Impressora</span>
          </button>
        </div>

        {/* Overview Metric Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-mono">Total de Equipamentos</div>
              <div className="text-base font-bold text-slate-900 font-mono">{printers.length}</div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-mono">Em Impressão</div>
              <div className="text-base font-bold text-amber-600 font-mono">{activeCount}</div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-mono">Livres para Uso</div>
              <div className="text-base font-bold text-emerald-600 font-mono">{idleCount}</div>
            </div>
          </div>

          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3">
            <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
              <Wrench className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] text-slate-500 uppercase font-mono">Manutenção</div>
              <div className="text-base font-bold text-rose-600 font-mono">{maintenanceCount}</div>
            </div>
          </div>
        </div>

      </div>

      {/* Grid of Printer Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-5">
        {printers.map((printer) => (
          <PrinterCard key={printer.id} printer={printer} />
        ))}
      </div>

      {/* Add Printer Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-heading font-bold text-slate-900 flex items-center gap-2">
                <Printer className="w-5 h-5 text-blue-600" />
                Nova Impressora 3D
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome da Impressora *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Bambu Lab P1S"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Modelo / Arquitetura
                </label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                  placeholder="Ex: CoreXY High-Speed, FDM Bed Slinger, SLA Resina"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Volume Útil de Impressão
                </label>
                <input
                  type="text"
                  value={formData.maxBuildVolume}
                  onChange={(e) => setFormData({ ...formData, maxBuildVolume: e.target.value })}
                  placeholder="Ex: 256 x 256 x 256 mm"
                  className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="pt-3 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold shadow-md shadow-blue-600/20"
                >
                  Cadastrar Impressora
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
