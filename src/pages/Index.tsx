import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Uploader } from '@/components/Uploader';
import { BadgePreview, BadgePreviewRef } from '@/components/BadgePreview';
import { getOfficialTemplate, saveBadge, uploadFile, Template } from '@/lib/supabase';
import { createSlug } from '@/lib/canvas-utils';
import { toast } from 'sonner';
import { Download, Eye, AlertTriangle, Settings } from 'lucide-react';
import { Link } from 'react-router-dom';

const Index = () => {
  const [template, setTemplate] = useState<Template | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [saveToHistory, setSaveToHistory] = useState(false);
  const [canDownload, setCanDownload] = useState(false);
  const [loading, setLoading] = useState(false);
  const [noOfficialTemplate, setNoOfficialTemplate] = useState(false);
  const badgePreviewRef = useRef<BadgePreviewRef>(null);

  useEffect(() => {
    loadOfficialTemplate();
  }, []);

  const loadOfficialTemplate = async () => {
    const officialTemplate = await getOfficialTemplate();
    if (officialTemplate) {
      setTemplate(officialTemplate);
      setNoOfficialTemplate(false);
    } else {
      setNoOfficialTemplate(true);
    }
  };

  const handlePhotoUpload = (file: File, url: string) => {
    setPhotoFile(file);
    setPhotoUrl(url);
  };

  const handleGeneratePreview = () => {
    if (!photoFile && !photoUrl) {
      toast.error('Selecione uma foto');
      return;
    }
    
    if (!name.trim()) {
      toast.error('Digite o nome do funcionário');
      return;
    }
    
    if (!role.trim()) {
      toast.error('Digite a função');
      return;
    }

    // The BadgePreview component will automatically render when these props change
    toast.success('Pré-visualização gerada!');
  };

  const handleDownload = async () => {
    if (!badgePreviewRef.current) {
      toast.error('Erro ao baixar: pré-visualização não encontrada');
      return;
    }

    setLoading(true);

    try {
      // Get PNG data from BadgePreview component
      const dataUrl = badgePreviewRef.current.toPNG();
      
      if (!dataUrl) {
        toast.error('Erro ao gerar imagem');
        return;
      }
      
      // Download the file
      const link = document.createElement('a');
      link.download = `cracha-${createSlug(name)}.png`;
      link.href = dataUrl;
      link.click();

      // Optionally save to history
      if (saveToHistory && template) {
        // Convert dataUrl to blob
        const response = await fetch(dataUrl);
        const blob = await response.blob();

        // Upload badge PNG to storage
        const timestamp = Date.now();
        const fileName = `badge-${timestamp}.png`;
        const badgeUrl = await uploadFile('badges', fileName, new File([blob], fileName, { type: 'image/png' }));

        // Save badge record
        await saveBadge({
          full_name: name,
          role: role,
          photo_url: photoUrl,
          template_id: template.id,
          output_url: badgeUrl
        });

        toast.success('Crachá salvo no histórico!');
      }

      toast.success('Crachá baixado com sucesso!');
    } catch (error) {
      console.error('Error downloading badge:', error);
      toast.error('Erro ao baixar crachá');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = photoFile && name.trim() && role.trim();

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold">Gerador de Crachá – We Grow</h1>
          <p className="text-xl text-muted-foreground">
            Faça upload da sua foto, preencha seus dados e baixe seu crachá personalizado
          </p>
          
          <div className="flex justify-center">
            <Link to="/admin">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Painel Administrativo
              </Button>
            </Link>
          </div>
        </div>

        {/* Warning for no official template */}
        {noOfficialTemplate && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Nenhum template oficial salvo. Usando layout padrão. 
              Vá em <Link to="/admin" className="underline">Painel Administrativo</Link> para 
              enviar o template-cracha-antes e definir como oficial.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Form */}
          <Card>
            <CardHeader>
              <CardTitle>Dados do Crachá</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Photo Upload */}
              <Uploader
                bucket="photos"
                accept="image/png,image/jpeg,image/jpg"
                onUpload={handlePhotoUpload}
                label="Foto do Funcionário"
                preview
              />

              {/* Name */}
              <div>
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  placeholder="Nome do funcionário"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              {/* Role */}
              <div>
                <Label htmlFor="role">Função</Label>
                <Input
                  id="role"
                  placeholder="Função desempenhada"
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                />
              </div>

              {/* Save to History */}
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="save-history"
                  checked={saveToHistory}
                  onCheckedChange={(checked) => setSaveToHistory(checked as boolean)}
                />
                <Label htmlFor="save-history" className="text-sm">
                  Salvar no histórico (opcional)
                </Label>
              </div>

              {/* Actions */}
              <div className="space-y-3">
                <Button
                  onClick={handleGeneratePreview}
                  disabled={!isFormValid}
                  className="w-full"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Gerar Pré-visualização
                </Button>

                <Button
                  onClick={handleDownload}
                  disabled={!canDownload || loading}
                  variant="default"
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {loading ? 'Baixando...' : 'Baixar PNG'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Pré-visualização</CardTitle>
            </CardHeader>
            <CardContent>
              {isFormValid ? (
                <BadgePreview
                  ref={badgePreviewRef}
                  template={template}
                  photoFile={photoFile}
                  photoUrl={photoUrl}
                  name={name}
                  role={role}
                  onRender={setCanDownload}
                />
              ) : (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <div className="space-y-4">
                    <div className="w-24 h-36 bg-muted-foreground/10 rounded-lg mx-auto"></div>
                    <div className="space-y-2">
                      <p className="font-medium text-muted-foreground">Pré-visualização do Crachá</p>
                      <p className="text-sm text-muted-foreground">
                        Preencha todos os campos para ver a pré-visualização
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
