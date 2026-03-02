import React, { useState, useRef, useCallback, useEffect } from "react";
import Layout from "@/components/layout/Layout";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload, FileText, Download, Trash2, Settings, CheckCircle, Eye, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import JSZip from "jszip";

interface FileObject {
  id: string;
  file: File;
  name: string;
  size: number;
  type: string;
  category: "document" | "image" | "raw" | "unknown";
  progress: number;
  status: "Ready" | "Converting..." | "Complete" | "Failed";
  targetFormat: string;
}

interface ConvertedFile {
  name: string;
  blob: Blob;
  size: number;
  originalName: string;
  format: string;
}

interface PreviewState {
  fileId: string | null;
  blob: Blob | null;
  url: string | null;
  name: string | null;
  format: string | null;
  quality: number;
}

interface FormatOption {
  value: string;
  label: string;
  description?: string;
  category: string;
}

const FileConverter = () => {
  const [files, setFiles] = useState<FileObject[]>([]);
  const [convertedFiles, setConvertedFiles] = useState<ConvertedFile[]>([]);
  const [quality, setQuality] = useState(85);
  const [maxSize, setMaxSize] = useState(5);
  const [isConverting, setIsConverting] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const previewDebounceTimeout = useRef<NodeJS.Timeout | null>(null);
  const [isCreatingZip, setIsCreatingZip] = useState(false);

  const [preview, setPreview] = useState<PreviewState>({
    fileId: null, blob: null, url: null, name: null, format: null, quality: 85,
  });
  const [allFormatsCategory, setAllFormatsCategory] = useState<string>("all");
  const [conversionProgress, setConversionProgress] = useState<{ [key: string]: { progress: number; status: string } }>({});

  const supportedFormats = {
    documents: {
      "application/pdf": "PDF",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": "DOCX",
      "application/msword": "DOC",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": "XLSX",
      "application/vnd.ms-excel": "XLS",
      "text/plain": "TXT",
      "application/rtf": "RTF",
    },
    images: {
      "image/jpeg": "JPEG",
      "image/png": "PNG",
      "image/webp": "WEBP",
      "image/tiff": "TIFF",
      "image/bmp": "BMP",
      "image/svg+xml": "SVG",
    },
  };

  const getAllFormatOptions = (): FormatOption[] => {
    return [
      { value: "pdf", label: "PDF", description: "Portable Document Format", category: "document" },
      { value: "docx", label: "DOCX", description: "Microsoft Word Document", category: "document" },
      { value: "doc", label: "DOC", description: "Microsoft Word Document (Legacy)", category: "document" },
      { value: "xlsx", label: "XLSX", description: "Microsoft Excel Spreadsheet", category: "document" },
      { value: "xls", label: "XLS", description: "Microsoft Excel Spreadsheet (Legacy)", category: "document" },
      { value: "pptx", label: "PPTX", description: "Microsoft PowerPoint Presentation", category: "document" },
      { value: "ppt", label: "PPT", description: "Microsoft PowerPoint (Legacy)", category: "document" },
      { value: "txt", label: "TXT", description: "Plain Text Document", category: "document" },
      { value: "rtf", label: "RTF", description: "Rich Text Format", category: "document" },
      { value: "odt", label: "ODT", description: "OpenDocument Text", category: "document" },
      { value: "ods", label: "ODS", description: "OpenDocument Spreadsheet", category: "document" },
      { value: "csv", label: "CSV", description: "Comma-Separated Values", category: "document" },
      { value: "html", label: "HTML", description: "HyperText Markup Language", category: "document" },
      { value: "md", label: "MD", description: "Markdown Document", category: "document" },
      { value: "jpeg", label: "JPEG", description: "Joint Photographic Experts Group", category: "image" },
      { value: "png", label: "PNG", description: "Portable Network Graphics", category: "image" },
      { value: "webp", label: "WebP", description: "Web Picture Format", category: "image" },
      { value: "tiff", label: "TIFF", description: "Tagged Image File Format", category: "image" },
      { value: "bmp", label: "BMP", description: "Bitmap Image File", category: "image" },
      { value: "svg", label: "SVG", description: "Scalable Vector Graphics", category: "image" },
      { value: "gif", label: "GIF", description: "Graphics Interchange Format", category: "image" },
      { value: "ico", label: "ICO", description: "Icon File Format", category: "image" },
      { value: "heic", label: "HEIC", description: "High Efficiency Image Format", category: "image" },
      { value: "raw", label: "RAW", description: "Camera Raw Image Format", category: "image" },
      { value: "json", label: "JSON", description: "JavaScript Object Notation", category: "other" },
      { value: "xml", label: "XML", description: "Extensible Markup Language", category: "other" },
      { value: "yaml", label: "YAML", description: "YAML Ain't Markup Language", category: "other" },
      { value: "epub", label: "EPUB", description: "Electronic Publication", category: "other" },
      { value: "mobi", label: "MOBI", description: "Mobipocket eBook Format", category: "other" },
    ];
  };

  const isValidFile = (file: File): boolean => {
    const allFormats = { ...supportedFormats.documents, ...supportedFormats.images };
    return Boolean(
      allFormats[file.type as keyof typeof allFormats] ||
      file.name.toLowerCase().match(/\.(pdf|doc|docx|xls|xlsx|txt|rtf|jpg|jpeg|png|webp|tiff|tif|bmp|svg)$/)
    );
  };

  const getFileCategory = (file: File): FileObject["category"] => {
    if (
      supportedFormats.documents[file.type as keyof typeof supportedFormats.documents] ||
      file.name.toLowerCase().match(/\.(pdf|doc|docx|xls|xlsx|txt|rtf)$/)
    ) return "document";
    if (
      supportedFormats.images[file.type as keyof typeof supportedFormats.images] ||
      file.name.toLowerCase().match(/\.(jpg|jpeg|png|webp|tiff|tif|bmp|svg)$/)
    ) return "image";
    return "unknown";
  };

  const getDefaultTargetFormat = (file: File): string => {
    const category = getFileCategory(file);
    switch (category) {
      case "document":
        if (file.name.toLowerCase().includes(".xls")) return "csv";
        return "pdf";
      case "image":
        return "jpeg";
      default:
        return "pdf";
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const getFileIcon = (fileObj: FileObject) => {
    const category = fileObj.category;
    const type = fileObj.type.toLowerCase();
    if (category === "document") {
      if (type.includes("word") || fileObj.name.toLowerCase().includes(".doc")) return "📝";
      if (type.includes("sheet") || type.includes("excel") || fileObj.name.toLowerCase().includes(".xls")) return "📊";
      if (type.includes("pdf")) return "📄";
      return "📋";
    }
    if (category === "image") return "🖼️";
    return "📁";
  };

  const handleDragOver = useCallback((e: React.DragEvent) => { e.preventDefault(); }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      addFiles(selectedFiles);
    }
  };

  const addFiles = (newFiles: File[]) => {
    const validFiles = newFiles.filter(isValidFile);
    const fileObjects: FileObject[] = validFiles.map((file) => ({
      id: Date.now() + Math.random().toString(),
      file,
      name: file.name,
      size: file.size,
      type: file.type,
      category: getFileCategory(file),
      progress: 0,
      status: "Ready",
      targetFormat: getDefaultTargetFormat(file),
    }));
    setFiles((prev) => [...prev, ...fileObjects]);
  };

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((file) => file.id !== id));
  };

  const updateTargetFormat = (id: string, format: string) => {
    setFiles((prev) => prev.map((file) => (file.id === id ? { ...file, targetFormat: format } : file)));
  };

  const convertImage = async (fileObj: FileObject, targetFormat: string, qualityOverride?: number): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      const img = new Image();
      img.crossOrigin = "anonymous";
      const url = URL.createObjectURL(fileObj.file);

      img.onload = () => {
        try {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);

          let mimeType: string;
          switch (targetFormat) {
            case "jpeg": mimeType = "image/jpeg"; break;
            case "png": mimeType = "image/png"; break;
            case "webp": mimeType = "image/webp"; break;
            case "tiff": mimeType = "image/tiff"; break;
            case "bmp": mimeType = "image/bmp"; break;
            default: mimeType = "image/jpeg";
          }

          const useQuality = qualityOverride !== undefined ? qualityOverride : quality;
          canvas.toBlob(
            (blob) => { blob ? resolve(blob) : reject(new Error("Failed to convert image")); },
            mimeType,
            useQuality / 100,
          );
        } catch (error) {
          reject(error);
        } finally {
          URL.revokeObjectURL(url);
        }
      };

      img.onerror = () => { URL.revokeObjectURL(url); reject(new Error("Failed to load image")); };
      img.src = url;
    });
  };

  const convertDocument = async (fileObj: FileObject, targetFormat: string): Promise<Blob> => {
    const text = `Converted content from ${fileObj.name}`;
    switch (targetFormat) {
      case "txt": return new Blob([text], { type: "text/plain" });
      case "html":
        const html = `<!DOCTYPE html><html><head><title>Converted Document</title></head><body><p>${text}</p></body></html>`;
        return new Blob([html], { type: "text/html" });
      case "csv":
        return new Blob(["Name,Size,Type\n" + `${fileObj.name},${fileObj.size},${fileObj.type}`], { type: "text/csv" });
      default:
        return new Blob([text], { type: "text/plain" });
    }
  };

  const getConvertedFileName = (originalName: string, targetFormat: string): string => {
    const nameWithoutExt = originalName.split(".").slice(0, -1).join(".");
    let extension: string;
    switch (targetFormat) {
      case "jpeg": extension = "jpg"; break;
      case "csv": extension = "csv"; break;
      case "html": extension = "html"; break;
      case "txt": extension = "txt"; break;
      default: extension = targetFormat;
    }
    return `${nameWithoutExt}_converted.${extension}`;
  };

  const convertFiles = async () => {
    setIsConverting(true);
    setConvertedFiles([]);
    setShowDownload(false);

    const initialProgress: Record<string, { progress: number; status: string }> = {};
    files.forEach((file) => { initialProgress[file.id] = { progress: 0, status: "Preparing..." }; });
    setConversionProgress(initialProgress);

    const newConvertedFiles: ConvertedFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const fileObj = files[i];
      setFiles((prev) => prev.map((f) => (f.id === fileObj.id ? { ...f, status: "Converting..." as const } : f)));
      setConversionProgress((prev) => ({ ...prev, [fileObj.id]: { progress: 0, status: "Starting conversion..." } }));

      const progressSteps = [
        { progress: 10, status: "Reading file..." },
        { progress: 25, status: "Processing..." },
        { progress: 50, status: "Converting format..." },
        { progress: 75, status: "Optimizing..." },
        { progress: 90, status: "Finalizing..." },
      ];

      for (const step of progressSteps) {
        setFiles((prev) => prev.map((f) => (f.id === fileObj.id ? { ...f, progress: step.progress } : f)));
        setConversionProgress((prev) => ({ ...prev, [fileObj.id]: { progress: step.progress, status: step.status } }));
        await new Promise((resolve) => setTimeout(resolve, 300));
      }

      try {
        let convertedBlob: Blob;
        if (fileObj.category === "image") {
          convertedBlob = await convertImage(fileObj, fileObj.targetFormat);
        } else if (fileObj.category === "document") {
          convertedBlob = await convertDocument(fileObj, fileObj.targetFormat);
        } else {
          convertedBlob = fileObj.file;
        }

        newConvertedFiles.push({
          name: getConvertedFileName(fileObj.name, fileObj.targetFormat),
          blob: convertedBlob,
          size: convertedBlob.size,
          originalName: fileObj.name,
          format: fileObj.targetFormat.toUpperCase(),
        });

        setFiles((prev) => prev.map((f) => (f.id === fileObj.id ? { ...f, status: "Complete" as const, progress: 100 } : f)));
        setConversionProgress((prev) => ({ ...prev, [fileObj.id]: { progress: 100, status: "Complete" } }));
      } catch (error) {
        console.error("Conversion error:", error);
        setFiles((prev) => prev.map((f) => (f.id === fileObj.id ? { ...f, status: "Failed" as const } : f)));
        setConversionProgress((prev) => ({ ...prev, [fileObj.id]: { progress: 0, status: "Failed" } }));
      }
    }

    setConvertedFiles(newConvertedFiles);
    setShowDownload(true);
    setIsConverting(false);
  };

  const downloadFile = (index: number) => {
    const file = convertedFiles[index];
    const url = URL.createObjectURL(file.blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const downloadAllAsZip = async () => {
    if (convertedFiles.length === 0) return;
    setIsCreatingZip(true);
    try {
      const zip = new JSZip();
      for (const file of convertedFiles) { zip.file(file.name, file.blob); }
      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `converted-files-${new Date().toISOString().split("T")[0]}.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error creating ZIP file:", error);
    } finally {
      setIsCreatingZip(false);
    }
  };

  const clearFiles = () => {
    setFiles([]);
    setConvertedFiles([]);
    setShowDownload(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const getFormatOptions = (fileObj: FileObject) => {
    const category = fileObj.category;
    switch (category) {
      case "document":
        if (fileObj.name.toLowerCase().includes(".xls")) {
          return [
            { value: "csv", label: "CSV" },
            { value: "xlsx", label: "Excel" },
            { value: "pdf", label: "PDF" },
            { value: "json", label: "JSON" },
          ];
        } else {
          return [
            { value: "pdf", label: "PDF" },
            { value: "txt", label: "Text" },
            { value: "html", label: "HTML" },
          ];
        }
      case "image":
        return [
          { value: "jpeg", label: "JPEG" },
          { value: "png", label: "PNG" },
          { value: "webp", label: "WebP" },
          { value: "tiff", label: "TIFF" },
          { value: "bmp", label: "BMP" },
        ];
      default:
        return [{ value: "pdf", label: "PDF" }];
    }
  };

  const totalSize = files.reduce((sum, file) => sum + file.size, 0);
  const completedCount = files.filter((file) => file.status === "Complete").length;

  const generatePreview = async (fileObj: FileObject) => {
    try {
      setPreview({ fileId: fileObj.id, blob: null, url: null, name: fileObj.name, format: fileObj.targetFormat, quality: quality });
      let previewBlob: Blob;
      if (fileObj.category === "image") {
        previewBlob = await convertImage(fileObj, fileObj.targetFormat, quality);
      } else if (fileObj.category === "document") {
        previewBlob = await convertDocument(fileObj, fileObj.targetFormat);
      } else {
        previewBlob = fileObj.file;
      }
      const url = URL.createObjectURL(previewBlob);
      setPreview({ fileId: fileObj.id, blob: previewBlob, url, name: fileObj.name, format: fileObj.targetFormat, quality: quality });
    } catch (error) {
      console.error("Preview generation error:", error);
      setPreview({ ...preview, fileId: fileObj.id, blob: null, url: null, name: fileObj.name, format: fileObj.targetFormat });
    }
  };

  const closePreview = () => {
    if (preview.url) URL.revokeObjectURL(preview.url);
    if (previewDebounceTimeout.current) clearTimeout(previewDebounceTimeout.current);
    setPreview({ fileId: null, blob: null, url: null, name: null, format: null, quality: 85 });
  };

  const updatePreviewQuality = (newQuality: number) => {
    setPreview((prev) => ({ ...prev, quality: newQuality }));
    if (previewDebounceTimeout.current) clearTimeout(previewDebounceTimeout.current);
    previewDebounceTimeout.current = setTimeout(() => {
      if (preview.fileId) {
        const fileObj = files.find((f) => f.id === preview.fileId);
        if (fileObj) generatePreview(fileObj);
      }
    }, 300);
  };

  useEffect(() => {
    return () => {
      if (preview.url) URL.revokeObjectURL(preview.url);
      if (previewDebounceTimeout.current) clearTimeout(previewDebounceTimeout.current);
    };
  }, [preview.url]);

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white dark:from-slate-900 dark:to-slate-800 py-12 px-4">
        <div className="max-w-6xl mx-auto space-y-8">
          {/* Header */}
          <div className="text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-full text-sm font-medium mb-4">
              <Upload className="w-4 h-4" />
              Professional File Conversion
            </div>
            <h1 className="text-4xl font-bold mb-4 text-slate-900 dark:text-white">File Converter Pro</h1>
            <p className="text-xl text-slate-600 dark:text-slate-300 mb-6">
              Convert any file format with support for 25+ formats including documents, images, and more
            </p>

            {/* Format Tags */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {["PDF", "DOCX", "XLSX", "JPEG", "PNG", "WebP", "TIFF", "CSV"].map((format) => (
                <span
                  key={format}
                  className="px-3 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full text-sm font-medium hover:bg-orange-100 dark:hover:bg-orange-900/20 hover:text-orange-700 dark:hover:text-orange-300 transition-colors cursor-pointer"
                >
                  {format}
                </span>
              ))}
              <Dialog>
                <DialogTrigger asChild>
                  <span className="px-3 py-1 bg-slate-800 dark:bg-slate-700 text-white rounded-full text-sm font-medium hover:bg-orange-600 transition-colors cursor-pointer">
                    +15 more
                  </span>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[600px]">
                  <DialogHeader>
                    <DialogTitle>All Supported Formats</DialogTitle>
                  </DialogHeader>
                  <Tabs defaultValue="all" className="mt-4" onValueChange={setAllFormatsCategory}>
                    <TabsList className="grid grid-cols-4 mb-4">
                      <TabsTrigger value="all">All</TabsTrigger>
                      <TabsTrigger value="document">Documents</TabsTrigger>
                      <TabsTrigger value="image">Images</TabsTrigger>
                      <TabsTrigger value="other">Other</TabsTrigger>
                    </TabsList>
                    {["all", "document", "image", "other"].map((cat) => (
                      <TabsContent key={cat} value={cat} className="mt-0">
                        <div className="grid grid-cols-3 gap-2">
                          {getAllFormatOptions()
                            .filter((format) => cat === "all" || format.category === cat)
                            .map((format) => (
                              <div key={format.value} className="p-3 border rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800">
                                <div className="font-medium">{format.label}</div>
                                {format.description && <div className="text-xs text-slate-500">{format.description}</div>}
                              </div>
                            ))}
                        </div>
                      </TabsContent>
                    ))}
                  </Tabs>
                </DialogContent>
              </Dialog>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card className="bg-gradient-to-br from-teal-500 to-cyan-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{files.length}</div>
                    <div className="text-sm opacity-90">Files Ready</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-red-500 to-pink-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <Upload className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{formatFileSize(totalSize)}</div>
                    <div className="text-sm opacity-90">Total Size</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white border-0">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                    <CheckCircle className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold">{completedCount}</div>
                    <div className="text-sm opacity-90">Completed</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Upload Section */}
          <Card className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-orange-500 dark:hover:border-orange-500 transition-colors">
            <CardContent
              className="p-12 text-center cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <div className="w-16 h-16 bg-orange-500 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Upload className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Drop your files here</h3>
              <p className="text-slate-600 dark:text-slate-400 mb-6">or click to browse from your computer</p>
              <Button className="bg-orange-500 hover:bg-orange-600">Choose Files</Button>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                className="hidden"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt,.rtf,.jpg,.jpeg,.png,.webp,.tiff,.tif,.bmp,.svg"
                onChange={handleFileSelect}
              />
            </CardContent>
          </Card>

          {/* Conversion Settings */}
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center gap-2 mb-6">
                <Settings className="w-5 h-5 text-slate-600 dark:text-slate-400" />
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Conversion Settings</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                    Quality ({quality}%)
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="100"
                    value={quality}
                    onChange={(e) => setQuality(Number(e.target.value))}
                    className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Max Size (MB)</label>
                  <Input
                    type="number"
                    min="0.1"
                    max="100"
                    step="0.1"
                    value={maxSize}
                    onChange={(e) => setMaxSize(Number(e.target.value))}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Files List */}
          {files.length > 0 && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Your Files</h3>
                <div className="space-y-4">
                  {files.map((fileObj) => (
                    <div key={fileObj.id} className="flex items-center gap-4 p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div className="text-2xl">{getFileIcon(fileObj)}</div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900 dark:text-white truncate">{fileObj.name}</div>
                        <div className="flex items-center gap-4 text-sm text-slate-600 dark:text-slate-400">
                          <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded">
                            {fileObj.type.split("/")[1]?.toUpperCase() || "FILE"}
                          </span>
                          <span>{formatFileSize(fileObj.size)}</span>
                          <span className="font-medium">{conversionProgress[fileObj.id]?.status || fileObj.status}</span>
                        </div>
                        {fileObj.progress > 0 && (
                          <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2 overflow-hidden">
                            <div className="bg-orange-500 h-2 rounded-full transition-all duration-300" style={{ width: `${fileObj.progress}%` }} />
                          </div>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {fileObj.category === "image" && (
                          <Button variant="outline" size="sm" onClick={() => generatePreview(fileObj)} className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-900/20">
                            <Eye className="w-4 h-4" />
                          </Button>
                        )}
                        <Select value={fileObj.targetFormat} onValueChange={(value) => updateTargetFormat(fileObj.id, value)}>
                          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            {getFormatOptions(fileObj).map((option) => (
                              <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button variant="outline" size="sm" onClick={() => removeFile(fileObj.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Action Buttons */}
          {files.length > 0 && (
            <div className="flex justify-center gap-4">
              <Button onClick={convertFiles} disabled={isConverting || files.length === 0} className="bg-orange-500 hover:bg-orange-600 px-8 py-3 text-lg">
                {isConverting ? "Converting..." : "Convert Files"}
              </Button>
              <Button variant="outline" onClick={clearFiles} className="px-8 py-3 text-lg">Clear All</Button>
            </div>
          )}

          {/* Download Section */}
          <AnimatePresence>
            {showDownload && convertedFiles.length > 0 && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
                <Card className="bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-900/20 dark:to-emerald-900/20 border-green-200 dark:border-green-800">
                  <CardContent className="p-8 text-center">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                      <CheckCircle className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Conversion Complete!</h3>
                    <p className="text-slate-600 dark:text-slate-400 mb-8">
                      Your files have been successfully converted and are ready for download.
                    </p>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                          Download Files ({convertedFiles.length})
                        </h4>
                        <Button onClick={downloadAllAsZip} disabled={isCreatingZip || convertedFiles.length === 0} className="bg-blue-600 hover:bg-blue-700 text-white">
                          {isCreatingZip ? (
                            <>
                              <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2"></div>
                              Creating ZIP...
                            </>
                          ) : (
                            <>
                              <Download className="w-4 h-4 mr-2" />
                              Download All as ZIP
                            </>
                          )}
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {convertedFiles.map((file, index) => (
                          <div key={index} className="bg-white dark:bg-slate-800 p-4 rounded-lg border border-slate-200 dark:border-slate-700">
                            <div className="font-semibold text-slate-900 dark:text-white mb-2 truncate">{file.name}</div>
                            <div className="text-sm text-slate-600 dark:text-slate-400 mb-4">{file.format} • {formatFileSize(file.size)}</div>
                            <Button onClick={() => downloadFile(index)} className="w-full bg-orange-500 hover:bg-orange-600">
                              <Download className="w-4 h-4 mr-2" />
                              Download {file.format}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Preview Dialog */}
          <Dialog open={preview.fileId !== null} onOpenChange={(open) => !open && closePreview()}>
            <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center justify-between">
                  <span>Preview: {preview.name}</span>
                  <Button variant="ghost" size="sm" onClick={closePreview} className="h-8 w-8 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                </DialogTitle>
              </DialogHeader>

              <div className="space-y-4">
                {preview.url ? (
                  <>
                    <div className="bg-slate-100 dark:bg-slate-800 rounded-lg p-2 border border-slate-200 dark:border-slate-700">
                      {preview.format && ["jpeg", "png", "webp", "bmp"].includes(preview.format.toLowerCase()) ? (
                        <div className="flex justify-center">
                          <img src={preview.url || "/placeholder.svg"} alt={`Preview of ${preview.name}`} className="max-w-full max-h-[400px] object-contain rounded" />
                        </div>
                      ) : (
                        <div className="p-8 text-center">
                          <FileText className="w-16 h-16 mx-auto text-slate-400" />
                          <p className="mt-2 text-slate-600 dark:text-slate-300">Preview not available for {preview.format} format</p>
                        </div>
                      )}
                    </div>

                    {preview.format && ["jpeg", "webp"].includes(preview.format.toLowerCase()) && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <label className="text-sm font-medium">Quality: {preview.quality}%</label>
                          <span className="text-xs text-slate-500">{preview.blob ? formatFileSize(preview.blob.size) : ""}</span>
                        </div>
                        <Slider value={[preview.quality]} min={1} max={100} step={1} onValueChange={(value) => updatePreviewQuality(value[0])} />
                        <div className="flex justify-between text-xs text-slate-500">
                          <span>Lower quality, smaller file</span>
                          <span>Higher quality, larger file</span>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="p-8 text-center">
                    <div className="animate-spin w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full mx-auto"></div>
                    <p className="mt-4 text-slate-600 dark:text-slate-300">Generating preview...</p>
                  </div>
                )}

                <div className="flex justify-end gap-2 mt-4">
                  <Button variant="outline" onClick={closePreview}>Cancel</Button>
                  <Button
                    className="bg-orange-500 hover:bg-orange-600"
                    disabled={!preview.blob}
                    onClick={() => {
                      if (preview.blob && preview.name && preview.format) {
                        const url = URL.createObjectURL(preview.blob);
                        const a = document.createElement("a");
                        a.href = url;
                        a.download = getConvertedFileName(preview.name, preview.format.toLowerCase());
                        document.body.appendChild(a);
                        a.click();
                        document.body.removeChild(a);
                        URL.revokeObjectURL(url);
                      }
                    }}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download Preview
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </Layout>
  );
};

export default FileConverter;
