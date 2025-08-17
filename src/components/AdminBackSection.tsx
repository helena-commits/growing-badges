import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Uploader } from '@/components/Uploader';
import { BadgeBackPreview } from '@/components/BadgeBackPreview';
import { TemplateBack, saveBackTemplate, setOfficialBackTemplate, deleteBackTemplate } from '@/lib/supabase-back';
import { toast } from 'sonner';
import { Trash2, Star, Upload } from 'lucide-react';

interface AdminBackSectionProps {
  backTemplates: TemplateBack[];
  onTemplatesChange: () => void;
}

export function AdminBackSection({ backTemplates, onTemplatesChange }: AdminBackSectionProps) {
  const [currentBackTemplate, setCurrentBackTemplate] = useState<Partial<TemplateBack>>({
    name: '',
    file_url: '',
    width: 1024,
    height: 1536,
    name_x: 160,
    name_y: 200,
    name_w: 704,
    name_h: 65,
    name_color: '#111111',
    name_weight: '700',
    name_max_size: 40,
    is_official: false
  });
  const [backTemplateUrl, setBackTemplateUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleBackTemplateUpload = (file: File, url: string) => {
    setCurrentBackTemplate(prev => ({ ...prev, file_url: url }));
    setBackTemplateUrl(url);
  };

  const handleBackInputChange = (field: string, value: string) => {
    setCurrentBackTemplate(prev => ({
      ...prev,
      [field]: field.includes('_x') || field.includes('_y') || field.includes('_w') || field.includes('_h') || field.includes('max_size') || field === 'width' || field === 'height' 
        ? parseInt(value) || 0 
        : value
    }));
  };

  const handleSaveBackTemplate = async () => {
    if (!currentBackTemplate.name || !currentBackTemplate.file_url) {
      toast.error('Preencha o nome e faça upload da imagem');
      return;
    }

    setLoading(true);
    try {
      await saveBackTemplate(currentBackTemplate as Omit<TemplateBack, 'id' | 'created_at'>);
      toast.success('Template do verso salvo com sucesso!');
      onTemplatesChange();
      
      // Reset form
      setCurrentBackTemplate({
        name: '',
        file_url: '',
        width: 1024,
        height: 1536,
        name_x: 160,
        name_y: 200,
        name_w: 704,
        name_h: 65,
        name_color: '#111111',
        name_weight: '700',
        name_max_size: 40,
        is_official: false
      });
      setBackTemplateUrl('');
    } catch (error) {
      toast.error('Erro ao salvar template do verso');
    } finally {
      setLoading(false);
    }
  };

  const handleSetBackOfficial = async (id: string) => {
    setLoading(true);
    try {
      await setOfficialBackTemplate(id);
      toast.success('Template do verso definido como oficial!');
      onTemplatesChange();
    } catch (error) {
      toast.error('Erro ao definir template como oficial');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBackTemplate = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este template do verso?')) return;
    
    setLoading(true);
    try {
      await deleteBackTemplate(id);
      toast.success('Template do verso excluído!');
      onTemplatesChange();
    } catch (error) {
      toast.error('Erro ao excluir template do verso');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="grid gap-8 lg:grid-cols-2">
        {/* Back Template Form */}
        <Card className="shadow-elegant border-primary/10 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-primary">Novo Template do Verso</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <Label htmlFor="back-template-name">Nome do Template</Label>
              <Input
                id="back-template-name"
                placeholder="Ex: Template Verso Oficial 2024"
                value={currentBackTemplate.name || ''}
                onChange={(e) => handleBackInputChange('name', e.target.value)}
              />
            </div>

            <Uploader
              bucket="templates_back"
              accept="image/png,image/jpeg"
              onUpload={handleBackTemplateUpload}
              label="Upload do Template do Verso (1024x1536)"
              preview
            />

            {/* Name Layout Configuration */}
            <div className="space-y-4">
              <h3 className="font-semibold">Configuração da Área do Nome</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>X</Label>
                  <Input
                    type="number"
                    value={currentBackTemplate.name_x || 0}
                    onChange={(e) => handleBackInputChange('name_x', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Y</Label>
                  <Input
                    type="number"
                    value={currentBackTemplate.name_y || 0}
                    onChange={(e) => handleBackInputChange('name_y', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Largura</Label>
                  <Input
                    type="number"
                    value={currentBackTemplate.name_w || 0}
                    onChange={(e) => handleBackInputChange('name_w', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Altura</Label>
                  <Input
                    type="number"
                    value={currentBackTemplate.name_h || 0}
                    onChange={(e) => handleBackInputChange('name_h', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Cor</Label>
                  <Input
                    type="color"
                    value={currentBackTemplate.name_color || '#111111'}
                    onChange={(e) => handleBackInputChange('name_color', e.target.value)}
                  />
                </div>
                <div>
                  <Label>Tamanho Máximo</Label>
                  <Input
                    type="number"
                    value={currentBackTemplate.name_max_size || 40}
                    onChange={(e) => handleBackInputChange('name_max_size', e.target.value)}
                  />
                </div>
              </div>
            </div>

            <Button 
              onClick={handleSaveBackTemplate}
              disabled={loading || !currentBackTemplate.name || !currentBackTemplate.file_url}
              className="w-full"
            >
              <Upload className="w-4 h-4 mr-2" />
              Salvar Template do Verso
            </Button>
          </CardContent>
        </Card>

        {/* Back Preview */}
        <Card className="shadow-elegant border-primary/10 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-primary">Pré-visualização do Verso</CardTitle>
          </CardHeader>
          <CardContent>
            {backTemplateUrl ? (
              <BadgeBackPreview
                template={currentBackTemplate as TemplateBack}
                name="Nome de Exemplo"
              />
            ) : (
              <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                <p className="text-muted-foreground">
                  Faça upload de um template do verso para ver a pré-visualização
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Back Templates List */}
      <Card className="shadow-elegant border-primary/10 bg-card/80 backdrop-blur-sm">
        <CardHeader>
          <CardTitle className="text-primary">Templates do Verso Salvos</CardTitle>
        </CardHeader>
        <CardContent>
          {backTemplates.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              Nenhum template do verso salvo ainda
            </p>
          ) : (
            <div className="space-y-4">
              {backTemplates.map((template) => (
                <div
                  key={template.id}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div>
                      <h3 className="font-medium">{template.name}</h3>
                      <p className="text-sm text-muted-foreground">
                        Criado em {new Date(template.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    {template.is_official && (
                      <Badge variant="default">
                        <Star className="w-3 h-3 mr-1" />
                        Oficial
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    {!template.is_official && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSetBackOfficial(template.id)}
                        disabled={loading}
                      >
                        <Star className="w-4 h-4 mr-1" />
                        Tornar Oficial
                      </Button>
                    )}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteBackTemplate(template.id)}
                      disabled={loading || template.is_official}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}