import React, { useState } from 'react';
import { 
  FolderKanban, 
  Plus, 
  User, 
  Calendar, 
  Send, 
  Trash2, 
  CheckCircle2, 
  Search, 
  X, 
  Layers, 
  FileCode,
  Tag,
  Palette
} from 'lucide-react';
import { usePrintQueue } from '../context/PrintQueueContext';

export default function ProjectManager() {
  const { projects, addProject, deleteProject, dispatchProjectPartsToQueue } = usePrintQueue();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Project Form State
  const [formData, setFormData] = useState({
    title: '',
    responsible: '',
    customer: '',
    deadline: '',
    materialRequirement: 'PETG',
    colorRequirement: '',
    notes: '',
    parts: [
      {
        name: 'Peça 1',
        quantityRequired: 5,
        estimatedTimeHours: 1,
        estimatedTimeMinutes: 30,
        estimatedWeightGrams: 50,
        materialType: 'PETG',
        fileName: 'Peca_1.stl'
      }
    ]
  });

  const handleAddPartRow = () => {
    setFormData((prev) => ({
      ...prev,
      parts: [
        ...prev.parts,
        {
          name: `Peça ${prev.parts.length + 1}`,
          quantityRequired: 1,
          estimatedTimeHours: 1,
          estimatedTimeMinutes: 0,
          estimatedWeightGrams: 40,
          materialType: prev.materialRequirement || 'PETG',
          fileName: `Peca_${prev.parts.length + 1}.stl`
        }
      ]
    }));
  };

  const handleRemovePartRow = (index) => {
    if (formData.parts.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      parts: prev.parts.filter((_, i) => i !== index)
    }));
  };

  const handlePartChange = (index, field, value) => {
    setFormData((prev) => {
      const updatedParts = [...prev.parts];
      updatedParts[index] = { ...updatedParts[index], [field]: value };
      return { ...prev, parts: updatedParts };
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!formData.title.trim() || !formData.responsible.trim()) {
      alert('Por favor, informe o título do projeto e o responsável.');
      return;
    }

    addProject(formData);
    setIsAddModalOpen(false);
    // Reset form
    setFormData({
      title: '',
      responsible: '',
      customer: '',
      deadline: '',
      materialRequirement: 'PETG',
      colorRequirement: '',
      notes: '',
      parts: [
        {
          name: 'Peça 1',
          quantityRequired: 5,
          estimatedTimeHours: 1,
          estimatedTimeMinutes: 30,
          estimatedWeightGrams: 50,
          materialType: 'PETG',
          fileName: 'Peca_1.stl'
        }
      ]
    });
  };

  // Filter projects by title, responsible or customer
  const filteredProjects = projects.filter(
    (p) =>
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.responsible.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.customer.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      
      {/* Top Header & Search */}
      <div className="glass-panel p-5 rounded-3xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-heading font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <FolderKanban className="w-6 h-6 text-blue-600" />
              Gestão por Projetos & Lotes 3D
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Agrupe peças por projeto, acompanhe responsáveis, especificações de cor/material e envie lotes inteiros para a Fila de Impressão.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-600/20 transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Novo Projeto de Impressão</span>
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por projeto, responsável ou cliente..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-slate-300 text-slate-900 text-xs focus:outline-none focus:border-blue-600"
          />
        </div>
      </div>

      {/* Projects List */}
      {filteredProjects.length > 0 ? (
        <div className="space-y-6">
          {filteredProjects.map((project) => {
            const totalRequired = project.parts.reduce((a, b) => a + (parseInt(b.quantityRequired) || 0), 0);
            const totalPrinted = project.parts.reduce((a, b) => a + (parseInt(b.quantityPrinted) || 0), 0);
            const progressPercent = totalRequired > 0 ? Math.round((totalPrinted / totalRequired) * 100) : 0;
            const isCompleted = totalPrinted >= totalRequired && totalRequired > 0;

            return (
              <div key={project.id} className="glass-panel p-6 rounded-3xl space-y-4">
                
                {/* Project Header */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-200">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-heading font-bold text-slate-900">
                        {project.title}
                      </h2>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                        isCompleted
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-blue-100 text-blue-800 border border-blue-300'
                      }`}>
                        {isCompleted ? 'Concluído' : 'Em Produção'}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 mt-1.5 text-xs text-slate-600 flex-wrap">
                      <span className="flex items-center gap-1 font-semibold text-slate-900">
                        <User className="w-3.5 h-3.5 text-blue-600" />
                        Resp: {project.responsible}
                      </span>
                      <span>•</span>
                      <span>Cliente/Dept: {project.customer}</span>
                      {project.deadline && (
                        <>
                          <span>•</span>
                          <span className="flex items-center gap-1 font-mono">
                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                            Prazo: {project.deadline}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Top Action Buttons */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => dispatchProjectPartsToQueue(project.id)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs shadow-md shadow-blue-600/20 transition-all"
                      title="Gerar e enviar todas as peças pendentes para a Fila de Impressão"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar Peças para a Fila</span>
                    </button>

                    <button
                      onClick={() => {
                        if (window.confirm(`Deseja excluir o projeto "${project.title}"?`)) {
                          deleteProject(project.id);
                        }
                      }}
                      className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Excluir Projeto"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Specs Box: Material, Color Requirement & Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center gap-2">
                    <Tag className="w-4 h-4 text-blue-600 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-mono">Material Exigido</span>
                      <div className="font-bold text-slate-900 font-mono">{project.materialRequirement}</div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Palette className="w-4 h-4 text-indigo-600 shrink-0" />
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase font-mono">Especificação de Cor</span>
                      <div className="font-bold text-slate-900">{project.colorRequirement || 'Padrão'}</div>
                    </div>
                  </div>

                  <div className="sm:col-span-1">
                    <span className="text-[10px] text-slate-500 uppercase font-mono">Observações</span>
                    <div className="text-slate-700 italic truncate">{project.notes || 'Sem observações'}</div>
                  </div>
                </div>

                {/* Project Overall Progress Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-600">Progresso Geral do Lote:</span>
                    <span className="font-bold text-blue-700">
                      {totalPrinted} / {totalRequired} peças impressas ({progressPercent}%)
                    </span>
                  </div>
                  <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden border border-slate-300">
                    <div
                      className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full transition-all duration-500"
                      style={{ width: `${progressPercent}%` }}
                    ></div>
                  </div>
                </div>

                {/* Parts Breakdown Table */}
                <div className="overflow-x-auto border border-slate-200 rounded-2xl bg-white">
                  <table className="w-full text-left text-xs text-slate-800">
                    <thead className="bg-slate-100 text-slate-700 font-mono uppercase border-b border-slate-200">
                      <tr>
                        <th className="p-3">Tipo de Peça</th>
                        <th className="p-3">Arquivo 3D / GCODE</th>
                        <th className="p-3">Qtd. Solicitada</th>
                        <th className="p-3">Qtd. Impressa</th>
                        <th className="p-3">Material</th>
                        <th className="p-3">Estimativa / Unidade</th>
                        <th className="p-3 text-right">Status Peça</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 font-mono">
                      {project.parts.map((part) => {
                        const partDone = part.quantityPrinted >= part.quantityRequired;
                        return (
                          <tr key={part.id} className="hover:bg-slate-50">
                            <td className="p-3 font-semibold text-slate-900 font-sans">{part.name}</td>
                            <td className="p-3 text-slate-600 flex items-center gap-1.5">
                              <FileCode className="w-3.5 h-3.5 text-blue-600" />
                              <span>{part.fileName}</span>
                            </td>
                            <td className="p-3 font-bold text-slate-900">{part.quantityRequired} un.</td>
                            <td className="p-3 font-bold text-blue-700">{part.quantityPrinted} un.</td>
                            <td className="p-3">{part.materialType}</td>
                            <td className="p-3 text-slate-600">
                              {part.estimatedTimeHours}h {part.estimatedTimeMinutes}m • {part.estimatedWeightGrams}g
                            </td>
                            <td className="p-3 text-right font-sans">
                              {partDone ? (
                                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                                  <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Concluída
                                </span>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                                  Pendente ({part.quantityRequired - part.quantityPrinted} faltantes)
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="glass-panel p-12 rounded-3xl text-center space-y-3">
          <FolderKanban className="w-12 h-12 text-slate-400 mx-auto" />
          <h3 className="text-lg font-heading font-bold text-slate-800">
            Nenhum projeto encontrado
          </h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Cadastre seu primeiro projeto para gerenciar lotes de peças, responsáveis e enviar direto para a fila.
          </p>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors mt-2"
          >
            <Plus className="w-4 h-4" />
            <span>Criar Novo Projeto</span>
          </button>
        </div>
      )}

      {/* New Project Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-md overflow-y-auto">
          <div className="w-full max-w-3xl bg-white border border-slate-200 rounded-3xl shadow-2xl overflow-hidden my-8">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50/80">
              <h2 className="text-xl font-heading font-bold text-slate-900 flex items-center gap-2">
                <FolderKanban className="w-5 h-5 text-blue-600" />
                Cadastrar Novo Projeto de Impressão 3D
              </h2>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[80vh] overflow-y-auto">
              
              {/* Basic Project Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome do Projeto *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Ex: Robô Hexápode v2"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-blue-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Responsável pelo Projeto *
                  </label>
                  <div className="relative">
                    <User className="absolute left-3 top-3 w-4 h-4 text-slate-400" />
                    <input
                      type="text"
                      required
                      value={formData.responsible}
                      onChange={(e) => setFormData({ ...formData, responsible: e.target.value })}
                      placeholder="Ex: Eng. Ricardo Oliveira"
                      className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm focus:outline-none focus:border-blue-600"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cliente / Departamento
                  </label>
                  <input
                    type="text"
                    value={formData.customer}
                    onChange={(e) => setFormData({ ...formData, customer: e.target.value })}
                    placeholder="Ex: Mecatrônica"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Material Exigido
                  </label>
                  <select
                    value={formData.materialRequirement}
                    onChange={(e) => setFormData({ ...formData, materialRequirement: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm"
                  >
                    <option value="PLA">PLA</option>
                    <option value="PETG">PETG</option>
                    <option value="ABS">ABS</option>
                    <option value="TPU">TPU (Flex)</option>
                    <option value="ASA">ASA</option>
                    <option value="Resin">Resina</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Especificação de Cor
                  </label>
                  <input
                    type="text"
                    value={formData.colorRequirement}
                    onChange={(e) => setFormData({ ...formData, colorRequirement: e.target.value })}
                    placeholder="Ex: Azul Cyan Transparent"
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm"
                  />
                </div>
              </div>

              {/* Deadline & Notes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Prazo Limite / Entregável
                  </label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Observações do Projeto
                  </label>
                  <input
                    type="text"
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    placeholder="Ex: Peças para protótipo da feira técnica..."
                    className="w-full px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-300 text-slate-900 text-sm"
                  />
                </div>
              </div>

              {/* Dynamic Parts List Builder */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5 font-mono">
                    <Layers className="w-4 h-4" /> Tipos de Peças & Quantidades do Lote
                  </h4>
                  <button
                    type="button"
                    onClick={handleAddPartRow}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold hover:bg-blue-700 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Adicionar Outro Tipo de Peça</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {formData.parts.map((part, index) => (
                    <div key={index} className="p-3 rounded-xl bg-white border border-slate-300 space-y-2">
                      <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                        <span>Peça #{index + 1}</span>
                        {formData.parts.length > 1 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePartRow(index)}
                            className="text-rose-600 hover:underline text-xs flex items-center gap-1"
                          >
                            <Trash2 className="w-3.5 h-3.5" /> Remover
                          </button>
                        )}
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <div>
                          <label className="block text-[11px] text-slate-500 mb-1">Nome da Peça</label>
                          <input
                            type="text"
                            required
                            value={part.name}
                            onChange={(e) => handlePartChange(index, 'name', e.target.value)}
                            placeholder="Ex: Braço Articulado"
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-xs font-medium"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-500 mb-1">Quantidade a Imprimir</label>
                          <input
                            type="number"
                            min="1"
                            max="100"
                            value={part.quantityRequired}
                            onChange={(e) => handlePartChange(index, 'quantityRequired', e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-xs font-mono font-bold text-blue-700"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] text-slate-500 mb-1">Nome Arquivo STL/GCODE</label>
                          <input
                            type="text"
                            value={part.fileName}
                            onChange={(e) => handlePartChange(index, 'fileName', e.target.value)}
                            className="w-full px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-300 text-xs font-mono"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-3 gap-3 pt-1">
                        <div>
                          <label className="block text-[10px] text-slate-400">Horas / peça</label>
                          <input
                            type="number"
                            min="0"
                            value={part.estimatedTimeHours}
                            onChange={(e) => handlePartChange(index, 'estimatedTimeHours', e.target.value)}
                            className="w-full px-2 py-1 rounded bg-slate-50 border border-slate-300 text-xs font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400">Minutos / peça</label>
                          <input
                            type="number"
                            min="0"
                            max="59"
                            value={part.estimatedTimeMinutes}
                            onChange={(e) => handlePartChange(index, 'estimatedTimeMinutes', e.target.value)}
                            className="w-full px-2 py-1 rounded bg-slate-50 border border-slate-300 text-xs font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] text-slate-400">Peso (g) / peça</label>
                          <input
                            type="number"
                            min="1"
                            value={part.estimatedWeightGrams}
                            onChange={(e) => handlePartChange(index, 'estimatedWeightGrams', e.target.value)}
                            className="w-full px-2 py-1 rounded bg-slate-50 border border-slate-300 text-xs font-mono"
                          />
                        </div>
                      </div>

                    </div>
                  ))}
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-3 border-t border-slate-200 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-sm font-medium"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-md shadow-blue-600/20"
                >
                  Salvar Projeto
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
}
