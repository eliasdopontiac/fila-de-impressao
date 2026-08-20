import React, { useState } from 'react';
import { Package, Plus, AlertTriangle, Trash2, Scale, X } from 'lucide-react';
import { usePrintQueue } from '../context/PrintQueueContext';

export default function FilamentInventory() {
  const { spools, addSpool, deleteSpool, updateSpoolWeight } = usePrintQueue();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    material: 'PLA',
    colorName: '',
    colorHex: '#2563eb',
    totalWeight: 1000,
    remainingWeight: 1000,
    diameter: 1.75,
    pricePerKg: 120.0,
    brand: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.name.trim()) return;
    addSpool(formData);
    setIsAddModalOpen(false);
    setFormData({
      name: '',
      material: 'PLA',
      colorName: '',
      colorHex: '#2563eb',
      totalWeight: 1000,
      remainingWeight: 1000,
      diameter: 1.75,
      pricePerKg: 120.0,
      brand: '',
    });
  };

  const lowSpools = spools.filter((s) => s.remainingWeight < 150);

  return (
    <div className="space-y-6">
      
      {/* Top Header & Low Stock Warning Banner */}
      <div className="glass-panel p-5 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Package className="w-6 h-6 text-blue-600" />
              Estoque de Filamentos & Suprimentos
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Controle de carretéis, gramatura restante e custos por material.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Carretel</span>
          </button>
        </div>

        {lowSpools.length > 0 && (
          <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-amber-800 text-xs">
            <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
            <div>
              <span className="font-bold">{lowSpools.length} carretel(éis) com estoque crítico (&lt; 150g):</span>{' '}
              {lowSpools.map((s) => s.name).join(', ')}. Providencie a substituição para evitar falhas de impressão!
            </div>
          </div>
        )}
      </div>

      {/* Spools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {spools.map((spool) => {
          const percentLeft = Math.min(100, Math.max(0, Math.round((spool.remainingWeight / spool.totalWeight) * 100)));
          const isLow = spool.remainingWeight < 150;

          return (
            <div
              key={spool.id}
              className={`glass-panel p-5 rounded-3xl relative transition-all ${
                isLow ? 'border-amber-300 ring-2 ring-amber-500/20' : ''
              }`}
            >
              {/* Header: Color Swatch + Name */}
              <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full border-2 border-slate-300 shadow-xs flex items-center justify-center shrink-0"
                    style={{ backgroundColor: spool.colorHex }}
                  ></div>
                  <div>
                    <h3 className="text-base font-heading font-bold text-slate-900 truncate max-w-[160px]">
                      {spool.name}
                    </h3>
                    <p className="text-xs text-slate-500 font-mono">
                      {spool.brand || 'Genérico'} • {spool.material}
                    </p>
                  </div>
                </div>

                <span className="px-2 py-1 rounded-md text-[10px] font-mono font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {spool.diameter}mm
                </span>
              </div>

              {/* Progress Bar Weight Remaining */}
              <div className="space-y-1.5 mb-4">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-500">Peso Restante:</span>
                  <span className={`font-bold ${isLow ? 'text-amber-700' : 'text-blue-700'}`}>
                    {spool.remainingWeight}g / {spool.totalWeight}g ({percentLeft}%)
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 border border-slate-300 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isLow ? 'bg-amber-500' : 'bg-gradient-to-r from-blue-600 to-indigo-600'
                    }`}
                    style={{ width: `${percentLeft}%` }}
                  ></div>
                </div>
              </div>

              {/* Price & Specs */}
              <div className="grid grid-cols-2 gap-2 text-xs p-3 rounded-xl bg-slate-50 border border-slate-200 mb-3">
                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Preço / Kg</div>
                  <div className="font-semibold text-emerald-700 font-mono">
                    R$ {spool.pricePerKg.toFixed(2)}
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-slate-500 uppercase font-mono">Cor</div>
                  <div className="font-semibold text-slate-800 truncate">
                    {spool.colorName || 'Padrão'}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between">
                <button
                  onClick={() => {
                    const newWeight = prompt(`Ajustar peso restante para "${spool.name}" (gramas):`, spool.remainingWeight);
                    if (newWeight !== null && !isNaN(parseFloat(newWeight))) {
                      updateSpoolWeight(spool.id, parseFloat(newWeight));
                    }
                  }}
                  className="text-xs text-blue-600 hover:underline flex items-center gap-1 font-semibold"
                >
                  <Scale className="w-3.5 h-3.5" />
                  <span>Ajustar Balança</span>
                </button>

                <button
                  onClick={() => {
                    if (window.confirm(`Excluir carretel "${spool.name}"?`)) {
                      deleteSpool(spool.id);
                    }
                  }}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

            </div>
          );
        })}
      </div>

      {/* Add Spool Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md">
          <div className="w-full max-w-md bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <h3 className="text-lg font-heading font-bold text-slate-900 flex items-center gap-2">
                <Package className="w-5 h-5 text-blue-600" />
                Cadastrar Carretel de Filamento
              </h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome do Carretel / Modelo *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Ex: Creality Hyper PLA"
                  className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-blue-600"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Marca / Fabricante
                  </label>
                  <input
                    type="text"
                    value={formData.brand}
                    onChange={(e) => setFormData({ ...formData, brand: e.target.value })}
                    placeholder="Ex: eSun, Bambu"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tipo de Material
                  </label>
                  <select
                    value={formData.material}
                    onChange={(e) => setFormData({ ...formData, material: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm"
                  >
                    <option value="PLA">PLA</option>
                    <option value="PETG">PETG</option>
                    <option value="ABS">ABS</option>
                    <option value="TPU">TPU (Flex)</option>
                    <option value="ASA">ASA</option>
                    <option value="Resin">Resina</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome da Cor
                  </label>
                  <input
                    type="text"
                    value={formData.colorName}
                    onChange={(e) => setFormData({ ...formData, colorName: e.target.value })}
                    placeholder="Ex: Azul Cyan"
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Amostra de Cor (Hex)
                  </label>
                  <input
                    type="color"
                    value={formData.colorHex}
                    onChange={(e) => setFormData({ ...formData, colorHex: e.target.value })}
                    className="w-full h-9 rounded-xl bg-slate-50 border border-slate-300 cursor-pointer p-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Peso Total (g)
                  </label>
                  <input
                    type="number"
                    value={formData.totalWeight}
                    onChange={(e) => setFormData({ ...formData, totalWeight: e.target.value, remainingWeight: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Preço por Kg (R$)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.pricePerKg}
                    onChange={(e) => setFormData({ ...formData, pricePerKg: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm font-mono"
                  />
                </div>
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
                  Salvar Carretel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
