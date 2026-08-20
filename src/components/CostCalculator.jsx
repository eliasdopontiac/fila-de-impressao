import React, { useState } from 'react';
import { Calculator, DollarSign, Zap, Scale, Clock, TrendingUp } from 'lucide-react';
import { usePrintQueue } from '../context/PrintQueueContext';

export default function CostCalculator() {
  const { settings } = usePrintQueue();

  const [weightGrams, setWeightGrams] = useState(150);
  const [printHours, setPrintHours] = useState(3);
  const [printMinutes, setPrintMinutes] = useState(30);
  const [spoolPricePerKg, setSpoolPricePerKg] = useState(120);
  const [powerWatts, setPowerWatts] = useState(250);
  const [electricityRate, setElectricityRate] = useState(settings.electricityRate || 0.85);
  const [hourlyMachineRate, setHourlyMachineRate] = useState(settings.hourlyMachineRate || 15.00);
  const [failureRiskPercent, setFailureRiskPercent] = useState(15);
  const [profitMarginPercent, setProfitMarginPercent] = useState(50);

  // Calculations
  const totalHours = parseFloat(printHours) + parseFloat(printMinutes) / 60;
  const materialCost = (parseFloat(weightGrams) / 1000) * parseFloat(spoolPricePerKg);
  const energyKwh = (parseFloat(powerWatts) / 1000) * totalHours;
  const energyCost = energyKwh * parseFloat(electricityRate);
  const machineCost = totalHours * parseFloat(hourlyMachineRate);

  const baseCost = materialCost + energyCost + machineCost;
  const riskCost = baseCost * (parseFloat(failureRiskPercent) / 100);
  const totalProductionCost = baseCost + riskCost;
  const profitAmount = totalProductionCost * (parseFloat(profitMarginPercent) / 100);
  const finalPrice = totalProductionCost + profitAmount;

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="glass-panel p-5 rounded-3xl">
        <h1 className="text-2xl font-heading font-bold text-slate-900 tracking-tight flex items-center gap-2">
          <Calculator className="w-6 h-6 text-blue-600" />
          Calculadora de Custos & Orçamentos 3D
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Calcule com precisão o custo real de produção (material + energia + depreciação de máquina) e obtenha a margem de lucro sugerida.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Inputs */}
        <div className="lg:col-span-7 glass-panel p-6 rounded-3xl space-y-4">
          <h3 className="text-base font-heading font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-blue-600" />
            Parâmetros do Trabalho
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-amber-600" /> Peso do Filamento (gramas)
              </label>
              <input
                type="number"
                min="1"
                value={weightGrams}
                onChange={(e) => setWeightGrams(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono text-sm focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5 text-emerald-600" /> Preço do Carretel (R$ / kg)
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={spoolPricePerKg}
                onChange={(e) => setSpoolPricePerKg(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono text-sm focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" /> Tempo - Horas
              </label>
              <input
                type="number"
                min="0"
                value={printHours}
                onChange={(e) => setPrintHours(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-blue-600" /> Tempo - Minutos
              </label>
              <input
                type="number"
                min="0"
                max="59"
                value={printMinutes}
                onChange={(e) => setPrintMinutes(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono text-sm"
              />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-3">
              Taxas Operacionais & Margem
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">
                  Energia Elétrica (R$ / kWh)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={electricityRate}
                  onChange={(e) => setElectricityRate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">
                  Taxa de Máquina (R$ / hora)
                </label>
                <input
                  type="number"
                  step="0.50"
                  value={hourlyMachineRate}
                  onChange={(e) => setHourlyMachineRate(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">
                  Buffer de Risco / Falhas (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={failureRiskPercent}
                  onChange={(e) => setFailureRiskPercent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">
                  Margem de Lucro (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={profitMarginPercent}
                  onChange={(e) => setProfitMarginPercent(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-blue-50 border border-blue-300 text-blue-700 font-bold font-mono text-xs"
                />
              </div>
            </div>
          </div>

        </div>

        {/* Right Output Card */}
        <div className="lg:col-span-5 glass-panel p-6 rounded-3xl flex flex-col justify-between space-y-6">
          
          <div>
            <h3 className="text-base font-heading font-bold text-slate-900 border-b border-slate-200 pb-3 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Detalhamento de Custos
            </h3>

            <div className="space-y-3 mt-4 text-sm font-mono">
              <div className="flex items-center justify-between text-slate-700">
                <span className="text-slate-500">Material ({weightGrams}g):</span>
                <span className="text-slate-900 font-bold">R$ {materialCost.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-700">
                <span className="text-slate-500">Energia ({energyKwh.toFixed(2)} kWh):</span>
                <span className="text-slate-900 font-bold">R$ {energyCost.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-700">
                <span className="text-slate-500">Hora Máquina ({totalHours.toFixed(1)}h):</span>
                <span className="text-slate-900 font-bold">R$ {machineCost.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-700 pt-2 border-t border-slate-200">
                <span className="text-slate-500">Risco / Buffer ({failureRiskPercent}%):</span>
                <span className="text-amber-700 font-bold">R$ {riskCost.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-slate-900 font-bold text-base">
                <span>Custo de Produção Total:</span>
                <span className="text-slate-900">R$ {totalProductionCost.toFixed(2)}</span>
              </div>

              <div className="flex items-center justify-between text-emerald-700 font-bold">
                <span>Lucro Líquido ({profitMarginPercent}%):</span>
                <span>+ R$ {profitAmount.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Big Suggested Price Box */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 text-center space-y-1 shadow-md">
            <span className="text-xs uppercase font-mono tracking-wider text-blue-700 font-bold">
              Preço Final Sugerido ao Cliente
            </span>
            <div className="text-3xl font-heading font-extrabold text-blue-900">
              R$ {finalPrice.toFixed(2)}
            </div>
            <p className="text-[11px] text-slate-600 font-mono pt-1">
              (R$ {(finalPrice / (weightGrams || 1)).toFixed(2)} por grama impressa)
            </p>
          </div>

        </div>

      </div>

    </div>
  );
}
