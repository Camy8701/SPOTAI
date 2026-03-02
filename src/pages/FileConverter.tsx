import { useState, useRef } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { motion } from "framer-motion";
import { Upload, Download, FileText, Image, X } from "lucide-react";

type ConversionType = "image" | "text";

const imageFormats = ["PNG", "JPEG", "WEBP", "BMP", "GIF"];
const textFormats = ["TXT", "CSV", "JSON", "XML"];

const FileConverter = () => {
  const [file, setFile] = useState<File | null>(null);
  const [conversionType, setConversionType] = useState<ConversionType>("image");
  const [targetFormat, setTargetFormat] = useState("PNG");
  const [converting, setConverting] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const formats = conversionType === "image" ? imageFormats : textFormats;

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) { setFile(f); setDownloadUrl(null); setError(null); }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const f = e.dataTransfer.files?.[0];
    if (f) { setFile(f); setDownloadUrl(null); setError(null); }
  };

  const convertImage = async (file: File, format: string): Promise<Blob> => {
    return new Promise((resolve, reject) => {
      const img = new window.Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas not supported"));
        ctx.drawImage(img, 0, 0);
        const mime = format === "JPEG" ? "image/jpeg" : format === "WEBP" ? "image/webp" : format === "BMP" ? "image/bmp" : format === "GIF" ? "image/gif" : "image/png";
        canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("Conversion failed")), mime, 0.92);
      };
      img.onerror = () => reject(new Error("Invalid image file"));
      img.src = URL.createObjectURL(file);
    });
  };

  const convertText = async (file: File, format: string): Promise<Blob> => {
    const text = await file.text();
    let output = text;
    const ext = file.name.split(".").pop()?.toLowerCase();

    if (format === "JSON" && ext === "csv") {
      const lines = text.trim().split("\n");
      const headers = lines[0].split(",").map(h => h.trim());
      const rows = lines.slice(1).map(line => {
        const vals = line.split(",").map(v => v.trim());
        return Object.fromEntries(headers.map((h, i) => [h, vals[i] || ""]));
      });
      output = JSON.stringify(rows, null, 2);
    } else if (format === "CSV" && ext === "json") {
      try {
        const data = JSON.parse(text);
        if (Array.isArray(data) && data.length > 0) {
          const keys = Object.keys(data[0]);
          output = [keys.join(","), ...data.map((r: Record<string, unknown>) => keys.map(k => String(r[k] ?? "")).join(","))].join("\n");
        }
      } catch { output = text; }
    } else if (format === "XML") {
      try {
        const data = JSON.parse(text);
        const toXml = (obj: unknown, tag: string): string => {
          if (Array.isArray(obj)) return obj.map((item, i) => toXml(item, `item`)).join("\n");
          if (typeof obj === "object" && obj !== null) {
            const inner = Object.entries(obj as Record<string, unknown>).map(([k, v]) => toXml(v, k)).join("\n");
            return `<${tag}>\n${inner}\n</${tag}>`;
          }
          return `<${tag}>${String(obj)}</${tag}>`;
        };
        output = `<?xml version="1.0" encoding="UTF-8"?>\n<root>\n${toXml(data, "data")}\n</root>`;
      } catch { output = `<?xml version="1.0" encoding="UTF-8"?>\n<root><content>${text}</content></root>`; }
    }

    return new Blob([output], { type: "text/plain" });
  };

  const handleConvert = async () => {
    if (!file) return;
    setConverting(true); setError(null); setDownloadUrl(null);
    try {
      const blob = conversionType === "image" ? await convertImage(file, targetFormat) : await convertText(file, targetFormat);
      const url = URL.createObjectURL(blob);
      setDownloadUrl(url);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Conversion failed");
    } finally {
      setConverting(false);
    }
  };

  const downloadFile = () => {
    if (!downloadUrl || !file) return;
    const a = document.createElement("a");
    a.href = downloadUrl;
    const baseName = file.name.replace(/\.[^.]+$/, "");
    a.download = `${baseName}.${targetFormat.toLowerCase()}`;
    a.click();
  };

  return (
    <Layout>
      <div className="max-w-2xl mx-auto px-4 py-16">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-4xl font-bold text-foreground mb-2 text-center">File Converter</h1>
          <p className="text-muted-foreground text-center mb-10">Convert images and text files between formats — all in your browser</p>

          <div className="bg-card rounded-2xl shadow-lg p-8 space-y-6 border border-border">
            {/* Type selector */}
            <div className="flex gap-3">
              <Button
                variant={conversionType === "image" ? "default" : "outline"}
                className={conversionType === "image" ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 flex-1" : "flex-1"}
                onClick={() => { setConversionType("image"); setTargetFormat("PNG"); setFile(null); setDownloadUrl(null); }}
              >
                <Image className="w-4 h-4 mr-2" /> Image
              </Button>
              <Button
                variant={conversionType === "text" ? "default" : "outline"}
                className={conversionType === "text" ? "bg-gradient-to-r from-orange-500 to-orange-600 text-white border-0 flex-1" : "flex-1"}
                onClick={() => { setConversionType("text"); setTargetFormat("TXT"); setFile(null); setDownloadUrl(null); }}
              >
                <FileText className="w-4 h-4 mr-2" /> Text
              </Button>
            </div>

            {/* Drop zone */}
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => inputRef.current?.click()}
              className="border-2 border-dashed border-border rounded-xl p-10 text-center cursor-pointer hover:border-orange-400 transition-colors"
            >
              <input
                ref={inputRef}
                type="file"
                className="hidden"
                accept={conversionType === "image" ? "image/*" : ".txt,.csv,.json,.xml"}
                onChange={handleFileSelect}
              />
              <Upload className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
              {file ? (
                <div className="flex items-center justify-center gap-2">
                  <span className="font-medium text-foreground">{file.name}</span>
                  <button onClick={(e) => { e.stopPropagation(); setFile(null); setDownloadUrl(null); }}>
                    <X className="w-4 h-4 text-muted-foreground hover:text-foreground" />
                  </button>
                </div>
              ) : (
                <p className="text-muted-foreground">Click or drag & drop a file here</p>
              )}
            </div>

            {/* Target format */}
            <div>
              <label className="block text-sm font-semibold text-foreground mb-2">Convert to</label>
              <Select value={targetFormat} onValueChange={setTargetFormat}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {formats.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>

            {error && <p className="text-red-500 text-sm">{error}</p>}

            <Button
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white"
              disabled={!file || converting}
              onClick={handleConvert}
            >
              {converting ? "Converting..." : "Convert"}
            </Button>

            {downloadUrl && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <Button className="w-full" variant="outline" onClick={downloadFile}>
                  <Download className="w-4 h-4 mr-2" /> Download {targetFormat}
                </Button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </Layout>
  );
};

export default FileConverter;
