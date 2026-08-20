import React, { createContext, useContext, useState, useEffect } from 'react';
import { initialPrinters, initialSpools, initialJobs, initialProjects } from '../mockData';
import { saveFileToStorage, getFileFromStorage, buildPlaceholderBlob, triggerBlobDownload } from '../utils/fileStorage';

const PrintQueueContext = createContext();

const STORAGE_KEYS = {
  JOBS: 'printstream_jobs_v1',
  PRINTERS: 'printstream_printers_v1',
  SPOOLS: 'printstream_spools_v1',
  PROJECTS: 'printstream_projects_v1',
  SETTINGS: 'printstream_settings_v1',
};

export function PrintQueueProvider({ children }) {
  // Load state from localStorage or fallback to initial mock data
  const [jobs, setJobs] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.JOBS);
    return saved ? JSON.parse(saved) : initialJobs;
  });

  const [printers, setPrinters] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PRINTERS);
    return saved ? JSON.parse(saved) : initialPrinters;
  });

  const [spools, setSpools] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SPOOLS);
    return saved ? JSON.parse(saved) : initialSpools;
  });

  const [projects, setProjects] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.PROJECTS);
    return saved ? JSON.parse(saved) : initialProjects;
  });

  const [settings, setSettings] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    return saved ? JSON.parse(saved) : {
      currencySymbol: 'R$',
      electricityRate: 0.85,
      hourlyMachineRate: 15.00,
      defaultPowerWatts: 250,
      riskBufferPercent: 15,
    };
  });

  // Save to LocalStorage whenever state changes
  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.JOBS, JSON.stringify(jobs));
  }, [jobs]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PRINTERS, JSON.stringify(printers));
  }, [printers]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SPOOLS, JSON.stringify(spools));
  }, [spools]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.PROJECTS, JSON.stringify(projects));
  }, [projects]);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  }, [settings]);

  // Real-time simulator tick
  useEffect(() => {
    const interval = setInterval(() => {
      setPrinters((prevPrinters) =>
        prevPrinters.map((printer) => {
          if (printer.status !== 'printing' || !printer.currentJobId) {
            const coolNozzle = Math.max(25, printer.nozzleTemp - 2);
            const coolBed = Math.max(24, printer.bedTemp - 1);
            return { ...printer, nozzleTemp: coolNozzle, bedTemp: coolBed };
          }

          const activeJob = jobs.find((j) => j.id === printer.currentJobId);
          const totalSecs = printer.totalSeconds || (activeJob ? (activeJob.estimatedTimeHours * 3600 + activeJob.estimatedTimeMinutes * 60) : 3600);
          const newElapsed = printer.elapsedSeconds + 5;
          const newProgress = Math.min(100, Math.floor((newElapsed / totalSecs) * 100));

          const targetN = printer.targetNozzleTemp || 220;
          const targetB = printer.targetBedTemp || 60;
          const nJitter = targetN + (Math.random() > 0.5 ? 1 : -1);
          const bJitter = targetB + (Math.random() > 0.7 ? 1 : 0);

          if (newProgress >= 100) {
            setTimeout(() => {
              completeJob(printer.currentJobId, printer.id);
            }, 100);
          }

          return {
            ...printer,
            elapsedSeconds: newElapsed,
            totalSeconds: totalSecs,
            progress: newProgress,
            nozzleTemp: nJitter,
            bedTemp: bJitter,
          };
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, [jobs]);

  // --- JOB ACTIONS ---
  const addJob = async (jobData, uploadedFile) => {
    const jobId = 'job-' + Date.now();
    let fileDataUrl = null;

    if (uploadedFile) {
      fileDataUrl = await saveFileToStorage(jobId, uploadedFile);
    }

    const newJob = {
      id: jobId,
      title: jobData.title,
      customer: jobData.customer || 'Cliente Geral',
      projectId: jobData.projectId || null,
      partName: jobData.partName || null,
      copyNumber: jobData.copyNumber || 1,
      totalCopies: jobData.totalCopies || 1,
      fileName: uploadedFile ? uploadedFile.name : (jobData.fileName || 'modelo_impressao.gcode'),
      fileSize: uploadedFile ? uploadedFile.size : (jobData.fileSize || 5000000),
      fileType: uploadedFile ? uploadedFile.name.split('.').pop().toLowerCase() : (jobData.fileType || 'gcode'),
      fileDataUrl: fileDataUrl || null,
      materialType: jobData.materialType || 'PLA',
      spoolId: jobData.spoolId || (spools[0]?.id || null),
      estimatedTimeHours: parseInt(jobData.estimatedTimeHours) || 0,
      estimatedTimeMinutes: parseInt(jobData.estimatedTimeMinutes) || 0,
      estimatedWeightGrams: parseFloat(jobData.estimatedWeightGrams) || 0,
      layerHeight: parseFloat(jobData.layerHeight) || 0.2,
      infillPercentage: parseInt(jobData.infillPercentage) || 20,
      priority: jobData.priority || 'normal',
      status: 'queued',
      assignedPrinterId: null,
      createdAt: new Date().toISOString(),
      completedAt: null,
      notes: jobData.notes || '',
      sampleGcode: jobData.sampleGcode || null
    };

    setJobs((prev) => [newJob, ...prev]);
    return newJob;
  };

  const handleDownloadJobFile = async (job) => {
    const storedBlob = await getFileFromStorage(job.id);
    const blob = storedBlob || buildPlaceholderBlob(job.fileName, job.sampleGcode);
    triggerBlobDownload(blob, job.fileName);
  };

  const assignJobToPrinter = (jobId, printerId) => {
    const targetJob = jobs.find((j) => j.id === jobId);
    if (!targetJob) return;

    const totalSeconds = (targetJob.estimatedTimeHours * 3600) + (targetJob.estimatedTimeMinutes * 60);

    setJobs((prev) =>
      prev.map((j) =>
        j.id === jobId
          ? { ...j, status: 'printing', assignedPrinterId: printerId }
          : j
      )
    );

    setPrinters((prev) =>
      prev.map((p) =>
        p.id === printerId
          ? {
              ...p,
              status: 'printing',
              currentJobId: jobId,
              progress: 0,
              elapsedSeconds: 0,
              totalSeconds: totalSeconds > 0 ? totalSeconds : 3600,
              targetNozzleTemp: targetJob.materialType === 'PETG' ? 240 : targetJob.materialType === 'ABS' ? 250 : 220,
              targetBedTemp: targetJob.materialType === 'PETG' ? 70 : targetJob.materialType === 'ABS' ? 100 : 60,
              nozzleTemp: 180,
              bedTemp: 50,
            }
          : p
      )
    );
  };

  const completeJob = (jobId, printerId) => {
    const job = jobs.find((j) => j.id === jobId);
    const nowIso = new Date().toISOString();

    setJobs((prev) =>
      prev.map((j) => (j.id === jobId ? { ...j, status: 'completed', completedAt: nowIso } : j))
    );

    if (printerId) {
      setPrinters((prev) =>
        prev.map((p) =>
          p.id === printerId
            ? {
                ...p,
                status: 'idle',
                currentJobId: null,
                progress: 0,
                elapsedSeconds: 0,
                targetNozzleTemp: 0,
                targetBedTemp: 0,
              }
            : p
        )
      );
    }

    // Deduct filament weight
    if (job && job.spoolId && job.estimatedWeightGrams > 0) {
      setSpools((prevSpools) =>
        prevSpools.map((spool) =>
          spool.id === job.spoolId
            ? {
                ...spool,
                remainingWeight: Math.max(0, spool.remainingWeight - job.estimatedWeightGrams),
              }
            : spool
        )
      );
    }

    // Increment completed part count in project if linked
    if (job && job.projectId && job.partName) {
      setProjects((prevProjects) =>
        prevProjects.map((proj) => {
          if (proj.id === job.projectId) {
            const updatedParts = proj.parts.map((part) => {
              if (part.name === job.partName) {
                return {
                  ...part,
                  quantityPrinted: Math.min(part.quantityRequired, part.quantityPrinted + 1),
                };
              }
              return part;
            });

            const totalReq = updatedParts.reduce((a, b) => a + b.quantityRequired, 0);
            const totalDone = updatedParts.reduce((a, b) => a + b.quantityPrinted, 0);
            const newProjStatus = totalDone >= totalReq ? 'completed' : 'in_progress';

            return {
              ...proj,
              parts: updatedParts,
              status: newProjStatus,
            };
          }
          return proj;
        })
      );
    }
  };

  const updateJobStatus = (jobId, newStatus) => {
    const job = jobs.find((j) => j.id === jobId);
    if (!job) return;

    if (newStatus === 'completed') {
      completeJob(jobId, job.assignedPrinterId);
      return;
    }

    setJobs((prev) =>
      prev.map((j) => {
        if (j.id === jobId) {
          const updated = { 
            ...j, 
            status: newStatus,
            completedAt: newStatus === 'completed' ? new Date().toISOString() : j.completedAt
          };
          if (newStatus === 'queued' || newStatus === 'failed') {
            updated.assignedPrinterId = null;
          }
          return updated;
        }
        return j;
      })
    );

    if ((newStatus === 'queued' || newStatus === 'failed' || newStatus === 'paused') && job.assignedPrinterId) {
      setPrinters((prev) =>
        prev.map((p) =>
          p.id === job.assignedPrinterId
            ? {
                ...p,
                status: newStatus === 'paused' ? 'paused' : 'idle',
                currentJobId: newStatus === 'paused' ? job.id : null,
              }
            : p
        )
      );
    }
  };

  const deleteJob = (jobId) => {
    const jobToDelete = jobs.find((j) => j.id === jobId);
    if (jobToDelete && jobToDelete.assignedPrinterId) {
      setPrinters((prev) =>
        prev.map((p) =>
          p.id === jobToDelete.assignedPrinterId
            ? { ...p, status: 'idle', currentJobId: null, progress: 0 }
            : p
        )
      );
    }
    setJobs((prev) => prev.filter((j) => j.id !== jobId));
  };

  const moveJobPriority = (jobId, direction) => {
    setJobs((prevJobs) => {
      const index = prevJobs.findIndex((j) => j.id === jobId);
      if (index < 0) return prevJobs;
      const targetIndex = direction === 'up' ? index - 1 : index + 1;
      if (targetIndex < 0 || targetIndex >= prevJobs.length) return prevJobs;

      const newArr = [...prevJobs];
      const temp = newArr[index];
      newArr[index] = newArr[targetIndex];
      newArr[targetIndex] = temp;
      return newArr;
    });
  };

  // --- PROJECT ACTIONS ---
  const addProject = (projectData) => {
    const newProject = {
      id: 'proj-' + Date.now(),
      title: projectData.title,
      responsible: projectData.responsible || 'Operador Geral',
      customer: projectData.customer || 'Interno',
      deadline: projectData.deadline || '',
      materialRequirement: projectData.materialRequirement || 'PLA',
      colorRequirement: projectData.colorRequirement || 'Padrão',
      status: 'in_progress',
      notes: projectData.notes || '',
      parts: projectData.parts.map((p, idx) => ({
        id: `part-${Date.now()}-${idx}`,
        name: p.name,
        quantityRequired: parseInt(p.quantityRequired) || 1,
        quantityPrinted: 0,
        estimatedTimeHours: parseInt(p.estimatedTimeHours) || 1,
        estimatedTimeMinutes: parseInt(p.estimatedTimeMinutes) || 0,
        estimatedWeightGrams: parseFloat(p.estimatedWeightGrams) || 50,
        materialType: p.materialType || projectData.materialRequirement || 'PLA',
        fileName: p.fileName || `${p.name.replace(/\s+/g, '_')}.stl`
      }))
    };

    setProjects((prev) => [newProject, ...prev]);
    return newProject;
  };

  const deleteProject = (projectId) => {
    setProjects((prev) => prev.filter((p) => p.id !== projectId));
  };

  const dispatchProjectPartsToQueue = (projectId) => {
    const project = projects.find((p) => p.id === projectId);
    if (!project) return;

    const newJobsBatch = [];
    const timestamp = new Date().toISOString();

    project.parts.forEach((part) => {
      const remainingToPrint = Math.max(0, part.quantityRequired - part.quantityPrinted);
      for (let i = 1; i <= remainingToPrint; i++) {
        const copyNum = part.quantityPrinted + i;
        newJobsBatch.push({
          id: `job-proj-${Date.now()}-${part.id}-${i}`,
          title: `${part.name} (Cópia ${copyNum}/${part.quantityRequired})`,
          customer: project.customer,
          projectId: project.id,
          partName: part.name,
          copyNumber: copyNum,
          totalCopies: part.quantityRequired,
          fileName: part.fileName,
          fileSize: 5242880,
          fileType: part.fileName.split('.').pop().toLowerCase() || 'stl',
          materialType: part.materialType,
          spoolId: spools[0]?.id || null,
          estimatedTimeHours: part.estimatedTimeHours,
          estimatedTimeMinutes: part.estimatedTimeMinutes,
          estimatedWeightGrams: part.estimatedWeightGrams,
          layerHeight: 0.2,
          infillPercentage: 20,
          priority: 'high',
          status: 'queued',
          assignedPrinterId: null,
          createdAt: timestamp,
          completedAt: null,
          notes: `Projeto: ${project.title} | Resp: ${project.responsible} | Especificação: ${project.colorRequirement}`,
          sampleGcode: `; GCODE para projeto ${project.title} - Peça: ${part.name}`
        });
      }
    });

    if (newJobsBatch.length === 0) {
      alert('Todas as peças deste projeto já foram impressas ou enviadas para a fila!');
      return;
    }

    setJobs((prev) => [...newJobsBatch, ...prev]);
    alert(`${newJobsBatch.length} trabalhos foram adicionados à Fila de Impressão para o projeto "${project.title}"!`);
  };

  // --- SPOOL & PRINTER ACTIONS ---
  const addSpool = (spoolData) => {
    const newSpool = {
      id: 'spool-' + Date.now(),
      name: spoolData.name,
      material: spoolData.material || 'PLA',
      colorName: spoolData.colorName || 'Custom',
      colorHex: spoolData.colorHex || '#2563eb',
      totalWeight: parseFloat(spoolData.totalWeight) || 1000,
      remainingWeight: parseFloat(spoolData.remainingWeight) || 1000,
      diameter: parseFloat(spoolData.diameter) || 1.75,
      pricePerKg: parseFloat(spoolData.pricePerKg) || 120.0,
      brand: spoolData.brand || 'Genérico',
    };
    setSpools((prev) => [newSpool, ...prev]);
  };

  const deleteSpool = (spoolId) => {
    setSpools((prev) => prev.filter((s) => s.id !== spoolId));
  };

  const updateSpoolWeight = (spoolId, newRemaining) => {
    setSpools((prev) =>
      prev.map((s) =>
        s.id === spoolId ? { ...s, remainingWeight: Math.max(0, newRemaining) } : s
      )
    );
  };

  const updatePrinterStatus = (printerId, status) => {
    setPrinters((prev) =>
      prev.map((p) => (p.id === printerId ? { ...p, status } : p))
    );
  };

  const addPrinter = (printerData) => {
    const newPrinter = {
      id: 'printer-' + Date.now(),
      name: printerData.name,
      model: printerData.model || 'FDM Printer',
      status: 'idle',
      nozzleTemp: 25,
      targetNozzleTemp: 0,
      bedTemp: 24,
      targetBedTemp: 0,
      speedFactor: 100,
      currentJobId: null,
      progress: 0,
      elapsedSeconds: 0,
      totalSeconds: 0,
      maxBuildVolume: printerData.maxBuildVolume || '220 x 220 x 250 mm',
    };
    setPrinters((prev) => [...prev, newPrinter]);
  };

  const resetDefaults = () => {
    setJobs(initialJobs);
    setPrinters(initialPrinters);
    setSpools(initialSpools);
    setProjects(initialProjects);
    localStorage.clear();
  };

  const value = {
    jobs,
    printers,
    spools,
    projects,
    settings,
    setSettings,
    addJob,
    deleteJob,
    updateJobStatus,
    assignJobToPrinter,
    moveJobPriority,
    handleDownloadJobFile,
    addProject,
    deleteProject,
    dispatchProjectPartsToQueue,
    addSpool,
    deleteSpool,
    updateSpoolWeight,
    addPrinter,
    updatePrinterStatus,
    resetDefaults,
  };

  return (
    <PrintQueueContext.Provider value={value}>
      {children}
    </PrintQueueContext.Provider>
  );
}

export function usePrintQueue() {
  const context = useContext(PrintQueueContext);
  if (!context) {
    throw new Error('usePrintQueue must be used within a PrintQueueProvider');
  }
  return context;
}
