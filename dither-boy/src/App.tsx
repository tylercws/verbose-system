import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import './App.css';
import { motion } from 'framer-motion';
import { GlassPanel } from '@/components/ui/glass-panel';
import { LiquidButton } from '@/components/ui/liquid-button';
import { AlgorithmCard } from '@/components/ui/algorithm-card';
import { FileUpload } from '@/components/ui/file-upload';
import { Canvas } from '@/components/ui/canvas';
import { Slider } from '@/components/ui/slider';
import { DitheringEngine } from '@/lib/dithering-engine';
import { DITHERING_ALGORITHMS, DitheringAlgorithm, ALGORITHM_CATEGORIES } from '@/lib/algorithms';
import { cn } from '@/lib/utils';

const DitherBoy: React.FC = () => {
  const [selectedAlgorithm, setSelectedAlgorithm] = useState<DitheringAlgorithm | null>(null);
  const [algorithmParameters, setAlgorithmParameters] = useState<Record<string, number>>({});
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [currentImage, setCurrentImage] = useState<string>('');
  const [processedImage, setProcessedImage] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [uploadResetToken, setUploadResetToken] = useState(0);

  const ditheringEngine = useRef(new DitheringEngine());

  const handleFilesAccepted = useCallback((files: File[]) => {
    setUploadedFiles(files);

    if (files.length > 0) {
      const file = files[0];
      const reader = new FileReader();

      reader.onload = (e) => {
        const imageUrl = e.target?.result as string;
        setCurrentImage(imageUrl);
        setProcessedImage('');
      };

      reader.readAsDataURL(file);
    }
  }, []);

  const handleAlgorithmSelect = (algorithm: DitheringAlgorithm) => {
    setSelectedAlgorithm(algorithm);

    const params: Record<string, number> = {};
    if (algorithm.parameters) {
      Object.entries(algorithm.parameters).forEach(([key, param]) => {
        params[key] = param.default;
      });
    }
    setAlgorithmParameters(params);
  };

  const handleParameterChange = (paramName: string, value: number) => {
    setAlgorithmParameters((prev) => ({
      ...prev,
      [paramName]: value,
    }));
  };

  const handleClear = useCallback(() => {
    if (isProcessing) return;

    setSelectedAlgorithm(null);
    setAlgorithmParameters({});
    setUploadedFiles([]);
    setCurrentImage('');
    setProcessedImage('');
    setUploadResetToken((token) => token + 1);
  }, [isProcessing]);

  const processImage = useCallback(async () => {
    if (!selectedAlgorithm || !currentImage) return;

    setIsProcessing(true);

    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = currentImage;
      });

      const imageData = ditheringEngine.current.imageToImageData(img);

      const processed = await ditheringEngine.current.processImage(
        imageData,
        selectedAlgorithm.id,
        algorithmParameters
      );

      const processedCanvas = ditheringEngine.current.imageDataToCanvas(processed);
      const dataUrl = processedCanvas.toDataURL('image/png');

      setProcessedImage(dataUrl);
    } catch (error) {
      console.error('Error processing image:', error);
    } finally {
      setIsProcessing(false);
    }
  }, [selectedAlgorithm, currentImage, algorithmParameters]);

  useEffect(() => {
    if (selectedAlgorithm && currentImage) {
      const timeoutId = setTimeout(() => {
        processImage();
      }, 300);

      return () => clearTimeout(timeoutId);
    }
  }, [algorithmParameters, processImage, selectedAlgorithm, currentImage]);

  const handleProcessClick = useCallback(() => {
    if (isProcessing) return;
    processImage();
  }, [isProcessing, processImage]);

  const handleExportResult = useCallback(() => {
    if (!processedImage || isProcessing) return;

    const link = document.createElement('a');
    link.href = processedImage;
    link.download = 'dither-boy-output.png';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [processedImage, isProcessing]);

  const filteredAlgorithms = useMemo(() => {
    let algorithms = DITHERING_ALGORITHMS;

    if (selectedCategory !== 'All') {
      algorithms = algorithms.filter((algo) => algo.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      algorithms = algorithms.filter(
        (algo) =>
          algo.name.toLowerCase().includes(query) ||
          algo.description.toLowerCase().includes(query) ||
          algo.tags?.some((tag) => tag.toLowerCase().includes(query))
      );
    }

    return algorithms;
  }, [selectedCategory, searchQuery]);

  return (
    <div className="min-h-screen bg-bg-depth bg-gradient-to-br from-bg-primary via-bg-secondary to-bg-primary relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <motion.div
          className="absolute -top-40 -right-40 w-80 h-80 bg-primary-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
        <motion.div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-500/10 rounded-full blur-3xl"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.6, 0.3, 0.6],
          }}
          transition={{
            duration: 10,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
        />
      </div>

      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 p-6"
      >
        <GlassPanel variant="default" blur="lg" padding="md">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary-500 to-secondary-500 flex items-center justify-center">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gradient">Dither Boy</h1>
                <p className="text-text-secondary text-sm">Liquid Morphism Edition</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <LiquidButton
                variant="secondary"
                size="sm"
                onClick={handleProcessClick}
                disabled={!selectedAlgorithm || !currentImage || isProcessing}
                loading={isProcessing}
                icon={
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                      clipRule="evenodd"
                    />
                  </svg>
                }
              >
                {isProcessing ? 'Processing...' : 'Process'}
              </LiquidButton>

              <LiquidButton
                variant="ghost"
                size="sm"
                onClick={handleClear}
                disabled={isProcessing}
                icon={
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                }
              >
                Clear
              </LiquidButton>
            </div>
          </div>
        </GlassPanel>
      </motion.header>

      <div className="relative z-10 p-6">
        <div className="grid grid-cols-12 gap-6 h-[calc(100vh-12rem)]">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="col-span-3 flex flex-col"
          >
            <GlassPanel variant="default" padding="none" className="flex-1 flex flex-col">
              <div className="p-4 border-b border-border-glass">
                <h2 className="text-lg font-semibold text-text-primary mb-3">Algorithms</h2>

                <div className="relative mb-3">
                  <input
                    type="text"
                    placeholder="Search algorithms..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-liquid pr-10"
                  />
                  <svg
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-text-muted"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>

                <div className="flex flex-wrap gap-2">
                  {['All', ...ALGORITHM_CATEGORIES].map((category) => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={cn(
                        'px-3 py-1 text-xs rounded-full transition-all',
                        selectedCategory === category
                          ? 'bg-primary-500 text-bg-depth'
                          : 'bg-surface-glassLight text-text-secondary hover:bg-surface-glass'
                      )}
                    >
                      {category}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4">
                <div className="grid grid-cols-1 gap-3">
                  {filteredAlgorithms.map((algorithm) => (
                    <AlgorithmCard
                      key={algorithm.id}
                      algorithm={algorithm}
                      selected={selectedAlgorithm?.id === algorithm.id}
                      onSelect={handleAlgorithmSelect}
                    />
                  ))}
                </div>
              </div>
            </GlassPanel>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="col-span-6 flex flex-col"
          >
            {uploadedFiles.length > 0 ? (
              <Canvas
                imageSrc={currentImage}
                processedImageSrc={processedImage}
                width={600}
                height={500}
                showControls={true}
              />
            ) : (
              <FileUpload
                onFilesAccepted={handleFilesAccepted}
                className="h-full"
                resetToken={uploadResetToken}
              >
                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <motion.div
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="text-center opacity-50"
                  >
                    <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-primary-500/20 flex items-center justify-center">
                      <svg className="w-12 h-12 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                    </div>
                    <p className="text-text-primary font-medium">Drop your images here</p>
                  </motion.div>
                </div>
              </FileUpload>
            )}
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="col-span-3 flex flex-col"
          >
            <GlassPanel variant="default" padding="none" className="flex-1 flex flex-col">
              <div className="p-4 border-b border-border-glass">
                <h2 className="text-lg font-semibold text-text-primary">Controls</h2>
                {selectedAlgorithm && (
                  <p className="text-text-secondary text-sm mt-1">{selectedAlgorithm.name}</p>
                )}
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {selectedAlgorithm ? (
                  <>
                    {selectedAlgorithm.parameters &&
                      Object.entries(selectedAlgorithm.parameters).map(([key, param]) => (
                        <Slider
                          key={key}
                          label={param.label || key}
                          value={algorithmParameters[key] || param.default}
                          onValueChange={(value) => handleParameterChange(key, value)}
                          min={param.min}
                          max={param.max}
                          step={param.step || 1}
                          formatValue={(val) =>
                            key === 'threshold' || key === 'seed'
                              ? Math.round(val).toString()
                              : key === 'intensity'
                                ? `${Math.round(val)}%`
                                : val.toString()
                          }
                        />
                      ))}

                    <div className="mt-6 p-3 bg-surface-glassLight rounded-lg">
                      <h3 className="text-sm font-medium text-text-primary mb-2">About</h3>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {selectedAlgorithm.description}
                      </p>

                      {selectedAlgorithm.tags && (
                        <div className="flex flex-wrap gap-1 mt-3">
                          {selectedAlgorithm.tags.map((tag, index) => (
                            <span
                              key={index}
                              className="px-2 py-1 text-xs bg-primary-500/20 text-primary-300 rounded-full"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="flex items-center gap-3 mt-3 text-xs">
                        <div className="flex items-center gap-1">
                          <span className="text-text-muted">Speed:</span>
                          <span
                            className={cn(
                              'font-medium',
                              selectedAlgorithm.performance === 'fast'
                                ? 'text-green-400'
                                : selectedAlgorithm.performance === 'medium'
                                  ? 'text-yellow-400'
                                  : 'text-red-400'
                            )}
                          >
                            {selectedAlgorithm.performance}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="text-text-muted">Quality:</span>
                          <span
                            className={cn(
                              'font-medium',
                              selectedAlgorithm.quality === 'high'
                                ? 'text-green-400'
                                : selectedAlgorithm.quality === 'medium'
                                  ? 'text-yellow-400'
                                  : 'text-red-400'
                            )}
                          >
                            {selectedAlgorithm.quality}
                          </span>
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-surface-glassLight flex items-center justify-center">
                      <svg className="w-8 h-8 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
                        />
                      </svg>
                    </div>
                    <p className="text-text-secondary">Select an algorithm to adjust parameters</p>
                  </div>
                )}
              </div>

              <div className="p-4 border-t border-border-glass space-y-3">
              <LiquidButton
                variant="primary"
                size="md"
                onClick={processImage}
                disabled={!selectedAlgorithm || !currentImage || isProcessing}
                  loading={isProcessing}
                  icon={
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                      />
                    </svg>
                  }
                  className="w-full"
                >
                  {isProcessing ? 'Processing...' : 'Process Image'}
                </LiquidButton>

              <LiquidButton
                variant="secondary"
                size="md"
                onClick={handleExportResult}
                disabled={!processedImage || isProcessing}
                icon={
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                      />
                    </svg>
                  }
                  className="w-full"
                >
                  Export Result
                </LiquidButton>
              </div>
            </GlassPanel>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default DitherBoy;
