/**
 * Home Page - PDF Brander main application
 * Design: "Soft Studio" warm minimal tool aesthetic
 * Layout: Asymmetric two-panel (controls left, preview right) with bottom file queue
 */

import { useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  ArrowRight,
  ArrowLeft,
  PackageOpen,
  Sparkles,
  FileText,
  CheckCircle2,
  Copy,
  Stamp,
} from 'lucide-react';
import { toast } from 'sonner';

import Layout from '@/components/layout/Layout';
import PdfBranderHeader from '@/components/pdf-brander/PdfBranderHeader';
import PdfDropZone from '@/components/pdf-brander/PdfDropZone';
import FileList from '@/components/pdf-brander/FileList';
import LogoUpload from '@/components/pdf-brander/LogoUpload';
import PositionPicker from '@/components/pdf-brander/PositionPicker';
import BrandingControls from '@/components/pdf-brander/BrandingControls';
import CoverPageControls from '@/components/pdf-brander/CoverPageControls';
import LivePreview from '@/components/pdf-brander/LivePreview';
import PdfPreview from '@/components/pdf-brander/PdfPreview';
import { Progress } from '@/components/ui/progress';
import { useBrander } from '@/hooks/useBrander';

const HERO_BG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663081092866/feaoXtNMxWhvWpjb2UAqii/hero-bg-KVPzKsqw9WAqWsYCEVGVgc.webp';
const EMPTY_STATE_IMG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663081092866/feaoXtNMxWhvWpjb2UAqii/empty-state-397mJzhKi2wfAWecid7g4m.webp';
const PROCESSING_IMG = 'https://d2xsxph8kpxj0f.cloudfront.net/310519663081092866/feaoXtNMxWhvWpjb2UAqii/processing-illustration-3eWCAbAjuZsy27uhpgZjCV.webp';

export default function Home() {
  const brander = useBrander();
  const branderRef = useRef(brander);
  branderRef.current = brander;

  const handleFilesAdded = useCallback(
    async (files: File[]) => {
      const added = await branderRef.current.addPdfFiles(files);
      if (added.length > 0) {
        toast.success(`Added ${added.length} PDF${added.length > 1 ? 's' : ''}`);
      }
    },
    []
  );

  const handleProcess = useCallback(async () => {
    branderRef.current.setStep('process');
    await branderRef.current.processAllPdfs();
    branderRef.current.setStep('download');
    toast.success('All PDFs branded successfully!');
  }, []);

  const previewFile = useMemo(
    () => brander.pdfFiles.find((f) => f.id === brander.previewFileId) || null,
    [brander.pdfFiles, brander.previewFileId]
  );

  const sf = brander.selectedFile;

  return (
    <Layout>
      <div className="min-h-full bg-[radial-gradient(circle_at_top_left,_rgba(239,106,91,0.08),_transparent_28%),linear-gradient(180deg,#fbf8f3_0%,#ffffff_38%)]">
        <section className="border-b border-border/70 bg-white/75">
          <div className="container py-8 sm:py-10">
            <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
              <div className="max-w-3xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#f1d8d2] bg-[#fff3ef] px-3 py-1 text-xs font-semibold uppercase tracking-[0.22em] text-coral">
                  <Stamp className="h-3.5 w-3.5" />
                  SpotAI Tools
                </div>
                <h1 className="max-w-3xl text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                  PDF Brander
                </h1>
                <p className="mt-3 max-w-2xl text-base text-muted-foreground">
                  Upload PDFs, place your logo, optionally swap the cover, and export branded files directly in the browser.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3">
                <Link
                  to="/tools"
                  className="inline-flex items-center justify-center rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-foreground transition hover:bg-secondary"
                >
                  All tools
                </Link>
                <div className="inline-flex items-center gap-2 rounded-full border border-[#d9eadf] bg-[#eef8f1] px-4 py-2 text-sm font-medium text-[#3f7c56]">
                  100% browser-based
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="container py-6 sm:py-8">
          <div className="overflow-hidden rounded-[32px] border border-[#eadfd3] bg-white shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
            <PdfBranderHeader
              step={brander.step}
              onReset={brander.resetAll}
              hasFiles={brander.pdfFiles.length > 0}
            />

            <main className="flex-1">
              <AnimatePresence mode="wait">
          {/* ============ STEP 1: UPLOAD ============ */}
              {brander.step === 'upload' && (
                <motion.div
                  key="upload"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3 }}
                >
              {/* Hero section */}
                  {brander.pdfFiles.length === 0 && (
                    <div className="relative overflow-hidden border-b border-border" style={{ backgroundColor: '#f5f3ef' }}>
                  {/* Decorative background shapes */}
                      <div className="absolute top-0 right-0 h-80 w-80 opacity-20 pointer-events-none">
                        <img src={HERO_BG} alt="" className="h-full w-full object-cover" />
                      </div>
                      <div className="relative container py-14 text-center sm:py-16">
                        <motion.div
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: 0.1 }}
                        >
                          <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-coral/10 px-3 py-1.5 text-xs font-semibold text-coral">
                            <Sparkles className="h-3.5 w-3.5" />
                            100% browser-based — your files stay private
                          </div>
                          <h2 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: '#1a1a1a' }}>
                            Brand your PDFs in seconds
                          </h2>
                          <p className="mx-auto max-w-lg text-base" style={{ color: '#666' }}>
                            Upload your ebooks or documents, add your logo, choose placement — and we&apos;ll stamp it on every page. Batch process up to 10 files at once.
                          </p>
                        </motion.div>
                      </div>
                    </div>
                  )}

                  <div className="container py-8">
                    <PdfDropZone
                      onFilesAdded={handleFilesAdded}
                      fileCount={brander.pdfFiles.length}
                      maxFiles={10}
                    />

                    {brander.pdfFiles.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="mt-6"
                      >
                        <div className="mb-3 flex items-center justify-between">
                          <h2 className="text-sm font-semibold text-foreground">
                            Uploaded Files ({brander.pdfFiles.length})
                          </h2>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={brander.clearAllFiles}
                            className="text-xs text-muted-foreground"
                          >
                            Clear all
                          </Button>
                        </div>
                        <FileList
                          files={brander.pdfFiles}
                          onRemove={brander.removePdfFile}
                          showActions={true}
                        />

                        <div className="mt-6 flex justify-end">
                          <Button
                            onClick={() => brander.setStep('configure')}
                            className="bg-coral text-white hover:bg-coral/90"
                          >
                            Continue to Branding
                            <ArrowRight className="ml-2 h-4 w-4" />
                          </Button>
                        </div>
                      </motion.div>
                    )}

                    {brander.pdfFiles.length === 0 && (
                      <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-10 flex flex-col items-center"
                      >
                        <img
                          src={EMPTY_STATE_IMG}
                          alt="Upload PDFs to get started"
                          className="h-48 w-48 object-contain opacity-70"
                        />
                        <p className="mt-3 text-sm text-muted-foreground">
                          Drop your PDF files above to get started
                        </p>
                      </motion.div>
                    )}
                  </div>
                </motion.div>
              )}

          {/* ============ STEP 2: CONFIGURE ============ */}
              {brander.step === 'configure' && (
                <motion.div
                  key="configure"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3 }}
                  className="container py-6"
                >
                  <div className="mb-6 flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => brander.setStep('upload')}
                      className="text-muted-foreground"
                    >
                      <ArrowLeft className="mr-1 h-4 w-4" />
                      Back
                    </Button>
                    <Separator orientation="vertical" className="h-5" />
                    <h2 className="text-lg font-bold text-foreground">Configure Branding</h2>
                  </div>

                  <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
                {/* File selector sidebar */}
                    <div className="lg:col-span-3">
                      <div className="rounded-xl border border-border bg-card p-3">
                        <h3 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                          Files ({brander.pdfFiles.length})
                        </h3>
                        <div className="space-y-1">
                          {brander.pdfFiles.map((f) => (
                            <button
                              key={f.id}
                              onClick={() => brander.setSelectedFileId(f.id)}
                              className={`
                            w-full text-left rounded-lg px-3 py-2.5 transition-all duration-150
                            ${f.id === sf?.id
                              ? 'bg-coral/10 border border-coral/30'
                              : 'hover:bg-muted border border-transparent'
                            }
                          `}
                            >
                              <div className="flex items-center gap-2">
                                <FileText className={`h-4 w-4 shrink-0 ${f.id === sf?.id ? 'text-coral' : 'text-muted-foreground'}`} />
                                <div className="min-w-0 flex-1">
                                  <p className="truncate text-xs font-medium">{f.name}</p>
                                  <p className="text-[10px] text-muted-foreground">
                                    {f.pageCount} pages
                                    {f.branding.logo ? ' · Logo set' : ''}
                                  </p>
                                </div>
                                {f.branding.logo && (
                                  <div className="h-1.5 w-1.5 shrink-0 rounded-full bg-sage" />
                                )}
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                {/* Controls for selected file */}
                    <div className="lg:col-span-4">
                      {sf ? (
                        <div className="space-y-4">
                          <div className="space-y-6 rounded-xl border border-border bg-card p-5">
                            <div className="flex items-center justify-between">
                              <h3 className="truncate pr-2 text-sm font-bold text-foreground">
                                {sf.name}
                              </h3>
                            </div>

                            <LogoUpload
                              logo={sf.branding.logo}
                              onUpload={brander.setFileLogo}
                              onRemove={brander.removeFileLogo}
                            />

                            <Separator />

                            <PositionPicker
                              value={sf.branding.position}
                              onChange={brander.setFilePosition}
                            />

                            <Separator />

                            <BrandingControls
                              scale={sf.branding.scale}
                              opacity={sf.branding.opacity}
                              padding={sf.branding.padding}
                              onScaleChange={brander.setFileScale}
                              onOpacityChange={brander.setFileOpacity}
                              onPaddingChange={brander.setFilePadding}
                            />

                            <Separator />

                            <CoverPageControls
                              skipCoverPage={sf.branding.skipCoverPage}
                              onSkipChange={brander.setFileSkipCover}
                              coverPreviewUrl={sf.branding.coverPageImage?.previewUrl ?? null}
                              onCoverUpload={brander.setFileCoverPage}
                              onCoverRemove={brander.removeFileCoverPage}
                            />
                          </div>

                      {/* Apply to all + Process */}
                          {brander.pdfFiles.length > 1 && (
                            <Button
                              variant="outline"
                              className="w-full"
                              onClick={() => {
                                brander.applyToAll();
                                toast.success('Settings applied to all files');
                              }}
                            >
                              <Copy className="mr-2 h-4 w-4" />
                              Apply settings to all files
                            </Button>
                          )}

                          <Button
                            onClick={handleProcess}
                            disabled={!brander.canProcess}
                            className="h-12 w-full bg-coral text-base font-semibold text-white hover:bg-coral/90"
                            size="lg"
                          >
                            <Sparkles className="mr-2 h-5 w-5" />
                            Brand All PDFs ({brander.pdfFiles.length})
                          </Button>

                          {!brander.canProcess && (
                            <p className="text-center text-xs text-muted-foreground">
                              Upload a logo on at least one file to start processing
                            </p>
                          )}
                        </div>
                      ) : (
                        <div className="rounded-xl border border-border bg-card p-8 text-center">
                          <p className="text-sm text-muted-foreground">Select a file to configure</p>
                        </div>
                      )}
                    </div>

                {/* Right panel - Live Preview */}
                    <div className="lg:col-span-5">
                      <div className="h-full rounded-xl border border-border bg-card p-5">
                        <LivePreview
                          pdfFile={sf}
                          logo={sf?.branding.logo ?? null}
                          position={sf?.branding.position ?? 'bottom-right'}
                          scale={sf?.branding.scale ?? 0.15}
                          opacity={sf?.branding.opacity ?? 0.85}
                          padding={sf?.branding.padding ?? 20}
                        />
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

          {/* ============ STEP 3: PROCESSING ============ */}
              {brander.step === 'process' && (
                <motion.div
                  key="process"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -30 }}
                  transition={{ duration: 0.3 }}
                  className="container py-10"
                >
                  <div className="mx-auto max-w-2xl">
                    <div className="mb-8 text-center">
                      <motion.img
                        src={PROCESSING_IMG}
                        alt="Processing"
                        className="mx-auto mb-4 h-auto w-56 opacity-80"
                        animate={{ y: [0, -5, 0] }}
                        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                      />
                      <h2 className="mb-2 text-2xl font-bold text-foreground">
                        Branding your PDFs...
                      </h2>
                      <p className="mb-4 text-sm text-muted-foreground">
                        {brander.completedCount} of {brander.totalCount} files completed
                      </p>
                      <div className="mx-auto flex max-w-md items-center gap-3">
                        <Progress value={brander.overallProgress} className="h-2.5 flex-1" />
                        <span className="w-10 text-right text-sm font-semibold tabular-nums text-foreground">
                          {brander.overallProgress}%
                        </span>
                      </div>
                    </div>

                    <FileList
                      files={brander.pdfFiles}
                      onRemove={brander.removePdfFile}
                      showActions={false}
                    />
                  </div>
                </motion.div>
              )}

          {/* ============ STEP 4: DOWNLOAD ============ */}
              {brander.step === 'download' && (
                <motion.div
                  key="download"
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className="container py-10"
                >
                  <div className="mx-auto max-w-2xl">
                {/* Success header */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: 0.1, type: 'spring', stiffness: 200 }}
                      className="mb-8 text-center"
                    >
                      <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-sage-light">
                        <CheckCircle2 className="h-8 w-8 text-sage" />
                      </div>
                      <h2 className="mb-2 text-2xl font-bold text-foreground">
                        All done!
                      </h2>
                      <p className="text-sm text-muted-foreground">
                        {brander.completedCount} PDF{brander.completedCount > 1 ? 's' : ''} branded successfully.
                        Preview or download below.
                      </p>
                    </motion.div>

                {/* Download all button */}
                    {brander.completedCount > 1 && (
                      <motion.div
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="mb-6"
                      >
                        <Button
                          onClick={brander.downloadAllAsZip}
                          className="h-12 w-full bg-coral text-base font-semibold text-white hover:bg-coral/90"
                          size="lg"
                        >
                          <PackageOpen className="mr-2 h-5 w-5" />
                          Download All as ZIP
                        </Button>
                      </motion.div>
                    )}

                {/* File list with download/preview */}
                    <FileList
                      files={brander.pdfFiles}
                      onRemove={brander.removePdfFile}
                      onDownload={brander.downloadSinglePdf}
                      onPreview={(id) => brander.setPreviewFileId(id)}
                      showActions={true}
                    />

                {/* Start over */}
                    <div className="mt-8 text-center">
                      <Button
                        variant="outline"
                        onClick={brander.resetAll}
                        className="text-muted-foreground"
                      >
                        Brand more PDFs
                      </Button>
                    </div>
                  </div>
                </motion.div>
              )}
              </AnimatePresence>
            </main>
          </div>

          <div className="mt-4 rounded-2xl border border-[#efe3d6] bg-[#f8f4ee] px-5 py-4 text-center text-sm text-[#6f6254]">
            PDF Brander processes files locally in your browser. Your PDFs and logo stay on your device.
          </div>
        </section>
      </div>

      {/* Preview modal */}
      <PdfPreview
        file={previewFile}
        open={!!brander.previewFileId}
        onClose={() => brander.setPreviewFileId(null)}
        onDownload={brander.downloadSinglePdf}
      />
    </Layout>
  );
}
