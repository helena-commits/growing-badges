import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Uploader } from '@/components/Uploader';
import { BadgePreview, BadgePreviewRef } from '@/components/BadgePreview';
import { BadgeBackPreview, BadgeBackPreviewRef } from '@/components/BadgeBackPreview';
import { getOfficialTemplate, saveBadge, uploadFile, Template } from '@/lib/supabase';
import { getOfficialBackTemplate, initializeDefaultBackTemplate, TemplateBack } from '@/lib/supabase-back';
import { createSlug } from '@/lib/canvas-utils';
import { toast } from 'sonner';
import { Download, Eye, AlertTriangle, Settings, FileText } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import jsPDF from 'jspdf';

const Index = () => {
  const location = useLocation();
  const [template, setTemplate] = useState<Template | null>(null);
  const [backTemplate, setBackTemplate] = useState<TemplateBack | null>(null);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [saveToHistory, setSaveToHistory] = useState(false);
  const [canDownload, setCanDownload] = useState(false);
  const [canDownloadBack, setCanDownloadBack] = useState(false);
  const [loading, setLoading] = useState(false);
  const [noOfficialTemplate, setNoOfficialTemplate] = useState(false);
  const [noOfficialBackTemplate, setNoOfficialBackTemplate] = useState(false);
  const badgePreviewRef = useRef<BadgePreviewRef>(null);
  const badgeBackPreviewRef = useRef<BadgeBackPreviewRef>(null);

  useEffect(() => {
    loadOfficialTemplates();
  }, []);

  // Load photo from URL parameter
  useEffect(() => {
    const p = new URLSearchParams(location.search);
    const url = p.get('photo');
    if (!url) return;
    (async () => {
      try {
        const res = await fetch(url, { mode: 'cors' });
        const blob = await res.blob();
        const ext = (blob.type.split('/')[1] || 'jpg').split(';')[0];
        const objectUrl = URL.createObjectURL(blob);
        setPhotoUrl(objectUrl);
        setPhotoFile(new File([blob], `from-supabase.${ext}`, { type: blob.type }));
        toast.success('Foto carregada automaticamente do Supabase');
      } catch (e) {
        toast.error('Não foi possível carregar a foto automaticamente');
      }
    })();
  }, [location.search]);

  const loadOfficialTemplates = async () => {
    // Initialize default back template if needed
    await initializeDefaultBackTemplate();

    const officialTemplate = await getOfficialTemplate();
    const officialBackTemplate = await getOfficialBackTemplate();

    if (officialTemplate) {
      setTemplate(officialTemplate);
      setNoOfficialTemplate(false);
    } else {
      setNoOfficialTemplate(true);
    }

    if (officialBackTemplate) {
      setBackTemplate(officialBackTemplate);
      setNoOfficialBackTemplate(false);
    } else {
      setNoOfficialBackTemplate(true);
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

    // The BadgePreview components will automatically render when these props change
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
      link.download = `cracha-frente-${createSlug(name)}.png`;
      link.href = dataUrl;
      link.click();

      // Optionally save to history
      if (saveToHistory && template) {
        // Convert dataUrl to blob
        const response = await fetch(dataUrl);
        const blob = await response.blob();

        // Upload badge PNG to storage
        const timestamp = Date.now();
        const fileName = `badge-front-${timestamp}.png`;
        const badgeUrl = await uploadFile('badges', fileName, new File([blob], fileName, {
          type: 'image/png'
        }));

        let backBadgeUrl = null;
        if (canDownloadBack && badgeBackPreviewRef.current) {
          const backDataUrl = badgeBackPreviewRef.current.toPNG();
          if (backDataUrl) {
            const backResponse = await fetch(backDataUrl);
            const backBlob = await backResponse.blob();
            const backFileName = `badge-back-${timestamp}.png`;
            backBadgeUrl = await uploadFile('badges', backFileName, new File([backBlob], backFileName, {
              type: 'image/png'
            }));
          }
        }

        // Save badge record
        await saveBadge({
          full_name: name,
          role: role,
          photo_url: photoUrl,
          template_id: template.id,
          output_url: badgeUrl,
          back_output_url: backBadgeUrl
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

  const handleDownloadBack = async () => {
    if (!badgeBackPreviewRef.current) {
      toast.error('Erro ao baixar: pré-visualização do verso não encontrada');
      return;
    }
    setLoading(true);
    try {
      const dataUrl = badgeBackPreviewRef.current.toPNG();
      if (!dataUrl) {
        toast.error('Erro ao gerar imagem do verso');
        return;
      }

      const link = document.createElement('a');
      link.download = `cracha-verso-${createSlug(name)}.png`;
      link.href = dataUrl;
      link.click();

      toast.success('Verso do crachá baixado com sucesso!');
    } catch (error) {
      console.error('Error downloading back badge:', error);
      toast.error('Erro ao baixar verso do crachá');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadBoth = async () => {
    setLoading(true);
    try {
      // Download front
      await handleDownload();
      
      // Download back if available
      if (canDownloadBack && badgeBackPreviewRef.current) {
        setTimeout(() => handleDownloadBack(), 500);
      }
    } catch (error) {
      console.error('Error downloading both badges:', error);
      toast.error('Erro ao baixar crachás');
    } finally {
      setLoading(false);
    }
  };

  const handleDownloadPDF = async () => {
    if (!badgePreviewRef.current) {
      toast.error('Erro ao gerar PDF: pré-visualização não encontrada');
      return;
    }
    
    setLoading(true);
    try {
      // Get PNG data from both preview components
      const frontDataUrl = badgePreviewRef.current.toPNG();
      if (!frontDataUrl) {
        toast.error('Erro ao gerar imagem da frente');
        return;
      }

      // Create PDF with portrait orientation and standard badge dimensions
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: [54, 85.6] // Standard badge size: 54mm x 85.6mm
      });

      // Add front page
      pdf.addImage(frontDataUrl, 'PNG', 0, 0, 54, 85.6);

      // Add back page if available
      if (canDownloadBack && badgeBackPreviewRef.current && backTemplate) {
        const backDataUrl = badgeBackPreviewRef.current.toPNG();
        if (backDataUrl) {
          pdf.addPage();
          pdf.addImage(backDataUrl, 'PNG', 0, 0, 54, 85.6);
        }
      }

      // Save the PDF
      const fileName = `cracha-${createSlug(name)}.pdf`;
      pdf.save(fileName);

      toast.success('PDF gerado com sucesso!');
    } catch (error) {
      console.error('Error generating PDF:', error);
      toast.error('Erro ao gerar PDF');
    } finally {
      setLoading(false);
    }
  };

  const isFormValid = photoFile && name.trim() && role.trim();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/20">
      <div className="max-w-7xl mx-auto space-y-8 p-4">
        {/* Header */}
        <div className="text-center space-y-6">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <h1 className="text-4xl md:text-5xl font-bold" style={{ color: '#1c195c' }}>
              Gerador de Crachá
            </h1>
            <img src="/lovable-uploads/f6131db8-ea96-46b7-8fbf-bfa5fa97ded6.png" alt="Bernhoeft Logo" className="h-12 md:h-16 w-auto" />
          </div>
          <p className="text-xl max-w-2xl mx-auto" style={{ color: '#9b26b5' }}>
            Faça upload da sua foto, preencha seus dados e baixe seu crachá
          </p>
          
          <div className="flex justify-center">
            <Link to="/admin">
              <Button variant="outline" size="sm" style={{ borderColor: '#0b233f', color: '#0b233f' }}>
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

        {/* Warning for no official back template */}
        {noOfficialBackTemplate && (
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Nenhum template de verso oficial encontrado. 
              Vá em <Link to="/admin" className="underline">Painel Administrativo</Link> para 
              configurar um template do verso.
            </AlertDescription>
          </Alert>
        )}

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Form */}
          <Card className="shadow-elegant border-primary/10 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle style={{ color: '#0b233f' }}>Dados do Crachá</CardTitle>
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
                <Label htmlFor="name" className="text-foreground font-medium">Nome</Label>
                <Input 
                  id="name" 
                  placeholder="Nome do funcionário" 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  className="h-12 text-base border-primary/20 focus:border-primary/40 bg-background/80" 
                />
              </div>

              {/* Role */}
              <div>
                <Label htmlFor="role" className="text-foreground font-medium">Função</Label>
                <Input 
                  id="role" 
                  placeholder="Função desempenhada" 
                  value={role} 
                  onChange={e => setRole(e.target.value)} 
                  className="h-12 text-base border-primary/20 focus:border-primary/40 bg-background/80 w-full overflow-hidden" 
                />
              </div>

              {/* Save to History */}
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="save-history" 
                  checked={saveToHistory} 
                  onCheckedChange={checked => setSaveToHistory(checked as boolean)} 
                />
                <Label htmlFor="save-history" className="text-sm">
                  Salvar no histórico (opcional)
                </Label>
              </div>

              {/* Actions */}
              <div className="space-y-4">
                <Button 
                  onClick={handleGeneratePreview} 
                  disabled={!isFormValid} 
                  variant="premium" 
                  size="lg" 
                  className="w-full"
                >
                  <Eye className="w-4 h-4 mr-2" />
                  Gerar Pré-visualização
                </Button>

                <Button 
                  onClick={handleDownload} 
                  disabled={!canDownload || loading} 
                  variant="outline" 
                  size="lg" 
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {loading ? 'Baixando...' : 'Baixar PNG (Frente)'}
                </Button>

                <Button 
                  onClick={handleDownloadBack} 
                  disabled={!canDownloadBack || loading || !backTemplate} 
                  variant="outline" 
                  size="lg" 
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {loading ? 'Baixando...' : 'Baixar PNG (Verso)'}
                </Button>

                <Button 
                  onClick={handleDownloadBoth} 
                  disabled={!canDownload || loading} 
                  variant="outline"
                  size="lg" 
                  className="w-full"
                >
                  <Download className="w-4 h-4 mr-2" />
                  {loading ? 'Baixando...' : 'Baixar PNGs Separados'}
                </Button>

                <Button 
                  onClick={handleDownloadPDF} 
                  disabled={!canDownload || loading} 
                  size="lg" 
                  className="w-full"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  {loading ? 'Gerando...' : 'Baixar PDF (Frente e Verso)'}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Front Preview */}
          <Card className="shadow-elegant border-primary/10 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle style={{ color: '#9b26b5' }}>Pré-visualização (Frente)</CardTitle>
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
                      <p className="font-medium text-muted-foreground">Pré-visualização da Frente</p>
                      <p className="text-sm text-muted-foreground">
                        Preencha todos os campos para ver a pré-visualização
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Back Preview */}
          <Card className="shadow-elegant border-primary/10 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle style={{ color: '#9b26b5' }}>Pré-visualização (Verso)</CardTitle>
            </CardHeader>
            <CardContent>
              {isFormValid && backTemplate ? (
                <BadgeBackPreview 
                  ref={badgeBackPreviewRef} 
                  template={backTemplate} 
                  name={name} 
                  onRender={() => setCanDownloadBack(true)} 
                />
              ) : (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <div className="space-y-4">
                    <div className="w-24 h-36 bg-muted-foreground/10 rounded-lg mx-auto"></div>
                    <div className="space-y-2">
                      <p className="font-medium text-muted-foreground">Pré-visualização do Verso</p>
                      <p className="text-sm text-muted-foreground">
                        {!backTemplate ? 'Template do verso não configurado' : 'Preencha todos os campos para ver a pré-visualização'}
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