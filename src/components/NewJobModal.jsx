import React, { useState, useRef } from 'react';
import { 
  X, 
  UploadCloud, 
  FileCheck, 
  Layers, 
  User, 
  PlusCircle 
} from 'lucide-react';
import { usePrintQueue } from '../context/PrintQueueContext';
import { formatFileSize } from '../utils/fileStorage';

export default function NewJobModal({ isOpen, onClose }) {
  const { addJob, spools } = usePrintQueue();
  const fileInputRef = useRef(null);

  const [uploadedFile, setUploadedFile] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    customer: '',
    materialType: 'PLA',
    spoolId: spools[0]?.id || '',
    estimatedTimeHours: 1,
    estimatedTimeMinutes: 30,
    estimatedWeightGrams: 50,
    layerHeight: 0.2,
    infillPercentage: 20,
    priority: 'normal',
    notes: '',
  });

  if (!isOpen) return null;

  const handleFileSelect = (file) => {
    if (!file) return;
    setUploadedFile(file);
    
    // Auto-fill title if empty
    if (!formData.title) {
      const cleanName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
      setFormData((prev) => ({
        ...prev,
        title: cleanName.replace(/_/g, ' ').replace(/-/g, ' '),
      }));
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title.trim()) {
      alert('Por favor, informe o título do trabalho.');
      return;
    }

    await addJob(formData, uploadedFile);
    onClose();
    // Reset modal
    setUploadedFile(null);
    setFormData({
      title: '',
      customer: '',
      materialType: 'PLA',
      spoolId: spools[0]?.id || '',
      estimatedTimeHours: 1,
      estimatedTimeMinutes: 30,
      estimatedWeightGrams: 50,
      layerHeight: 0.2,
      infillPercentage: 20,
      priority: 'normal',
      notes: '',
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-2xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <PlusCircle className="w-5 h-5 text-blue-600" />
            <h2 className="text-xl font-heading font-bold text-slate-900">
              Adicionar Trabalho à Fila de Impressão
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          
          {/* File Upload Dropzone */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Upload de Arquivo (STL, GCODE, 3MF, OBJ, STEP)
            </label>
            <div
              onDragEnter={handleDrag}
              onDragOver={handleDrag}
              onDragLeave={handleDrag}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`relative border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all duration-200 ${
                dragActive
                  ? 'border-blue-500 bg-blue-50/60 scale-[0.99]'
                  : uploadedFile
                  ? 'border-emerald-500 bg-emerald-50/40'
                  : 'border-slate-300 hover:border-blue-400 bg-slate-50/50'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".gcode,.stl,.3mf,.obj,.step,.NC"
                onChange={(e) => handleFileSelect(e.target.files[0])}
                className="hidden"
              />

              {uploadedFile ? (
                <div className="flex items-center justify-center gap-3 text-emerald-700">
                  <FileCheck className="w-8 h-8 text-emerald-600 animate-bounce" />
                  <div className="text-left">
                    <p className="font-semibold text-sm text-slate-900">{uploadedFile.name}</p>
                    <p className="text-xs text-slate-500 font-mono">
                      Tamanho: {formatFileSize(uploadedFile.size)} • Formato: .{uploadedFile.name.split('.').pop().toLowerCase()}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-500 space-y-2">
                  <UploadCloud className="w-10 h-10 text-blue-600 mb-1" />
                  <p className="text-sm font-medium text-slate-800">
                    Arraste o arquivo 3D/G-Code aqui ou <span className="text-blue-600 underline">clique para selecionar</span>
                  </p>
                  <p className="text-xs text-slate-400 font-mono">
                    Arquivos aceitos: .gcode, .stl, .3mf, .obj, .step (Salvo localmente para download)
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Title & Customer Inputs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome do Trabalho / Peça *
              </label>
              <input
                type="text"
                required
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Ex: Suporte Articulado VESA"
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-blue-600 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Cliente / Solicitante
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                <input
                  type="text"
                  value={formData.customer}
                  onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                  placeholder="Ex: Pedro Henrique"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-blue-600 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* Material & Filament Spool Selection */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tipo de Material
              </label>
              <select
                value={formData.materialType}
                onChange={(e) => setFormData({ ...formData, materialType: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-blue-600 focus:bg-white"
              >
                <option value="PLA">PLA</option>
                <option value="PETG">PETG</option>
                <option value="ABS">ABS</option>
                <option value="TPU">TPU (Flex)</option>
                <option value="ASA">ASA</option>
                <option value="Resin">Resina UV</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Carretel do Estoque
              </label>
              <select
                value={formData.spoolId}
                onChange={(e) => setFormData({ ...formData, spoolId: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-blue-600 focus:bg-white"
              >
                <option value="">Selecione um carretel...</option>
                {spools.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name} ({s.remainingWeight}g disp.)
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Prioridade
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-blue-600 focus:bg-white"
              >
                <option value="urgent">🚨 Urgente</option>
                <option value="high">🔥 Alta</option>
                <option value="normal">⚡ Normal</option>
                <option value="low">💤 Baixa</option>
              </select>
            </div>
          </div>

          {/* Technical Print Specifications */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-4">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-blue-700 flex items-center gap-1.5 font-mono">
              <Layers className="w-4 h-4" /> Parâmetros de Impressão (Fatiador)
            </h4>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-[11px] text-slate-500 mb-1">
                  Horas Est.
                </label>
                <input
                  type="number"
                  min="0"
                  max="500"
                  value={formData.estimatedTimeHours}
                  onChange={(e) => setFormData({ ...formData, estimatedTimeHours: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">
                  Minutos Est.
                </label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={formData.estimatedTimeMinutes}
                  onChange={(e) => setFormData({ ...formData, estimatedTimeMinutes: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">
                  Peso Estimado (g)
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.estimatedWeightGrams}
                  onChange={(e) => setFormData({ ...formData, estimatedWeightGrams: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-500 mb-1">
                  Infill (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={formData.infillPercentage}
                  onChange={(e) => setFormData({ ...formData, infillPercentage: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-sm font-mono"
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Observações & Recomendações
            </label>
            <textarea
              rows="2"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Ex: Imprimir com 4 perímetros de parede, suporte tipo árvore..."
              className="w-full px-4 py-2 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-blue-600 focus:bg-white"
            ></textarea>
          </div>

          {/* Footer Submit Buttons */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-medium transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-md shadow-blue-600/20 transition-all"
            >
              Adicionar à Fila
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
