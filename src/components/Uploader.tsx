import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { uploadFile } from '@/lib/supabase';
import { toast } from 'sonner';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

interface UploaderProps {
  bucket: string;
  accept: string;
  onUpload: (file: File, url: string) => void;
  className?: string;
  label?: string;
  preview?: boolean;
}

export function Uploader({ 
  bucket, 
  accept, 
  onUpload, 
  className = '', 
  label = 'Upload de arquivo',
  preview = false 
}: UploaderProps) {
  const [uploading, setUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    setFile(selectedFile);

    // Show preview if enabled
    if (preview && selectedFile.type.startsWith('image/')) {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }

    setUploading(true);

    try {
      // Generate unique filename
      const timestamp = Date.now();
      const extension = selectedFile.name.split('.').pop();
      const fileName = `${timestamp}.${extension}`;

      const publicUrl = await uploadFile(bucket, fileName, selectedFile);
      
      if (publicUrl) {
        onUpload(selectedFile, publicUrl);
        toast.success('Arquivo enviado com sucesso!');
      } else {
        toast.error('Erro ao enviar arquivo');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      toast.error('Erro ao enviar arquivo');
    } finally {
      setUploading(false);
    }
  };

  const clearFile = () => {
    setFile(null);
    setPreviewUrl(null);
    const input = document.getElementById('file-input') as HTMLInputElement;
    if (input) input.value = '';
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <Label htmlFor="file-input">{label}</Label>
      
      {!file ? (
        <div className="border-2 border-dashed border-primary/30 rounded-xl p-8 text-center bg-gradient-to-br from-secondary/20 to-accent/10 hover:border-primary/50 transition-all duration-300">
          <Upload className="mx-auto h-12 w-12 text-primary mb-4" />
          <div className="space-y-3">
            <Label htmlFor="file-input" className="cursor-pointer">
              <Button variant="premium" className="pointer-events-none">
                Selecionar arquivo
              </Button>
            </Label>
            <p className="text-sm text-muted-foreground">
              Ou arraste e solte aqui
            </p>
          </div>
          <Input
            id="file-input"
            type="file"
            accept={accept}
            onChange={handleFileSelect}
            disabled={uploading}
            className="hidden"
          />
        </div>
      ) : (
        <div className="space-y-4">
          {preview && previewUrl && (
            <div className="relative border-2 border-primary/20 rounded-xl p-4 bg-gradient-to-br from-secondary/20 to-accent/10">
              <img 
                src={previewUrl} 
                alt="Preview" 
                className="max-w-full max-h-32 mx-auto rounded-lg shadow-lg"
              />
            </div>
          )}
          
          <div className="flex items-center justify-between p-4 border border-primary/20 rounded-xl bg-gradient-to-r from-secondary/30 to-accent/20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary to-primary-glow flex items-center justify-center">
                <ImageIcon className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={clearFile}
              disabled={uploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          {uploading && (
            <div className="text-center">
              <p className="text-sm text-muted-foreground">Enviando arquivo...</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}