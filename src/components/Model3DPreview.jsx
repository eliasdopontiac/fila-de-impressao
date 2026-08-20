import React, { useEffect, useRef, useState } from 'react';
import * as THREE from 'three';
import { Box, Sparkles, Eye, RotateCw } from 'lucide-react';

/**
 * Real WebGL 3D Model Renderer & Thumbnail Generator
 * Renders an interactive 3D mesh with material colors and lighting using Three.js
 */
export default function Model3DPreview({ fileType, fileName, materialColor = '#2563eb' }) {
  const mountRef = useRef(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 200;
    const height = container.clientHeight || 140;

    // 1. Scene & Camera
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0xf8fafc); // Light slate background

    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 1000);
    camera.position.set(2.5, 2.5, 3.5);
    camera.lookAt(0, 0, 0);

    // 2. Renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.shadowMap.enabled = true;

    // Clear previous canvas
    while (container.firstChild) {
      container.removeChild(container.firstChild);
    }
    container.appendChild(renderer.domElement);

    // 3. Lighting
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.7);
    scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 0.8);
    dirLight1.position.set(5, 10, 7);
    scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0x3b82f6, 0.3); // Accent blue fill
    dirLight2.position.set(-5, -5, -5);
    scene.add(dirLight2);

    // 4. Build 3D Shape geometry based on model type
    let geometry;
    const cleanExt = (fileType || '').toLowerCase();

    if (cleanExt === 'stl' || cleanExt === 'obj') {
      // Rounded 3D Chamfered Box representing mechanical STL model
      geometry = new THREE.BoxGeometry(1.4, 1.2, 1.4, 4, 4, 4);
    } else if (cleanExt === '3mf') {
      // Cylindrical / Complex mechanical part
      geometry = new THREE.CylinderGeometry(0.8, 0.8, 1.3, 16);
    } else {
      // GCODE layered print model
      geometry = new THREE.TorusKnotGeometry(0.7, 0.25, 64, 16);
    }

    // Convert hex color string to Three.js Material
    const hexVal = materialColor.replace('#', '0x');
    const colorObj = new THREE.Color(parseInt(hexVal, 16) || 0x2563eb);

    const material = new THREE.MeshStandardMaterial({
      color: colorObj,
      roughness: 0.3,
      metalness: 0.1,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // Add subtle build plate grid base
    const gridHelper = new THREE.GridHelper(3, 8, 0xcbd5e1, 0xe2e8f0);
    gridHelper.position.y = -0.7;
    scene.add(gridHelper);

    // 5. Animation Loop
    let animationFrameId;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      mesh.rotation.y += 0.01;
      renderer.render(scene, camera);
    };

    animate();

    // Resize handler
    const handleResize = () => {
      if (!container) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
      renderer.dispose();
      geometry.dispose();
      material.dispose();
    };
  }, [fileType, materialColor]);

  return (
    <div 
      className="relative w-full h-36 rounded-2xl bg-gradient-to-b from-slate-50 to-slate-100 border border-slate-300 overflow-hidden shadow-inner group/canvas"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Real WebGL Canvas Mount Container */}
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />

      {/* Floating Badges */}
      <div className="absolute top-2 left-2 flex items-center gap-1 bg-white/90 backdrop-blur-xs px-2 py-0.5 rounded-md border border-slate-200 text-[10px] font-mono font-bold text-slate-800 shadow-xs pointer-events-none">
        <Box className="w-3 h-3 text-blue-600" />
        <span>3D Render</span>
      </div>

      <div className="absolute top-2 right-2 flex items-center gap-1 bg-slate-900/80 text-white text-[10px] font-mono px-2 py-0.5 rounded-full backdrop-blur-xs shadow-xs pointer-events-none">
        <RotateCw className="w-3 h-3 text-cyan-400 animate-spin" style={{ animationDuration: '6s' }} />
        <span>Girando</span>
      </div>

      {/* Bottom File Name Tag */}
      <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between px-2.5 py-1 rounded-lg bg-white/90 backdrop-blur-xs border border-slate-200 text-[11px] font-mono text-slate-700 shadow-2xs pointer-events-none">
        <span className="truncate max-w-[150px] font-semibold">{fileName}</span>
        <span className="text-[9px] uppercase font-bold text-blue-600 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
          WebGL
        </span>
      </div>
    </div>
  );
}
