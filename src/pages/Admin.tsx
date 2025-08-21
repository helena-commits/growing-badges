import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Uploader } from '@/components/Uploader';
import { BadgePreview } from '@/components/BadgePreview';
import { 
  Template, 
  listTemplates, 
  saveTemplate, 
  updateTemplate,
  setOfficialTemplate, 
  deleteTemplate 
} from '@/lib/supabase';
import { 
  TemplateBack,
  listBackTemplates,
  saveBackTemplate,
  setOfficialBackTemplate,
  deleteBackTemplate
} from '@/lib/supabase-back';
import { AdminBackSection } from '@/components/AdminBackSection';
import { toast } from 'sonner';
import { Trash2, Star, Upload } from 'lucide-react';

const DEFAULT_LAYOUT = {
  width: 1013,
  height: 638,
  photo_x: 341,
  photo_y: 441,
  photo_w: 341,
  photo_h: 436,
  photo_radius: 28,
  name_x: 169,
  name_y: 954,
  name_w: 688,
  name_h: 65,
  role_x: 169,
  role_y: 1137,
  role_w: 688,
  role_h: 82,
  name_color: '#111111',
  role_color: '#111111',
  name_weight: '700',
  role_weight: '700',
  name_max_size: 64,
  role_max_size: 72
};

export default function Admin() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [backTemplates, setBackTemplates] = useState<TemplateBack[]>([]);
  const [currentTemplate, setCurrentTemplate] = useState<Partial<Template>>(DEFAULT_LAYOUT);
  const [currentBackTemplate, setCurrentBackTemplate] = useState<Partial<TemplateBack>>({
    name: '',
    file_url: '',
    width: 1013,
    height: 638,
    name_x: 160,
    name_y: 200,
    name_w: 704,
    name_h: 65,
    name_color: '#111111',
    name_weight: '700',
    name_max_size: 40,
    is_official: false
  });
  const [templateFile, setTemplateFile] = useState<File | null>(null);
  const [templateUrl, setTemplateUrl] = useState<string>('');
  const [backTemplateFile, setBackTemplateFile] = useState<File | null>(null);
  const [backTemplateUrl, setBackTemplateUrl] = useState<string>('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadTemplates();
    loadBackTemplates();
  }, []);

  const loadBackTemplates = async () => {
    const data = await listBackTemplates();
    setBackTemplates(data);
  };

  const loadTemplates = async () => {
    const data = await listTemplates();
    setTemplates(data);
  };

  const handleTemplateUpload = (file: File, url: string) => {
    setTemplateFile(file);
    setTemplateUrl(url);
    setCurrentTemplate(prev => ({ ...prev, file_url: url }));
  };

  const handleSaveTemplate = async () => {
    if (!currentTemplate.name || !templateUrl) {
      toast.error('Preencha o nome e faça upload do template');
      return;
    }

    setLoading(true);
    
    try {
      const templateData = {
        ...DEFAULT_LAYOUT,
        ...currentTemplate,
        file_url: templateUrl,
        is_official: false
      };

      const saved = await saveTemplate(templateData as Omit<Template, 'id' | 'created_at'>);
      
      if (saved) {
        toast.success('Template salvo com sucesso!');
        await loadTemplates();
        // Reset form
        setCurrentTemplate(DEFAULT_LAYOUT);
        setTemplateFile(null);
        setTemplateUrl('');
      } else {
        toast.error('Erro ao salvar template');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      toast.error('Erro ao salvar template');
    } finally {
      setLoading(false);
    }
  };

  const handleSetOfficial = async (id: string) => {
    setLoading(true);
    
    try {
      const success = await setOfficialTemplate(id);
      
      if (success) {
        toast.success('Template definido como oficial!');
        await loadTemplates();
      } else {
        toast.error('Erro ao definir template como oficial');
      }
    } catch (error) {
      console.error('Error setting official template:', error);
      toast.error('Erro ao definir template como oficial');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteTemplate = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este template?')) return;
    
    setLoading(true);
    
    try {
      const success = await deleteTemplate(id);
      
      if (success) {
        toast.success('Template excluído com sucesso!');
        await loadTemplates();
      } else {
        toast.error('Erro ao excluir template');
      }
    } catch (error) {
      console.error('Error deleting template:', error);
      toast.error('Erro ao excluir template');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string | number) => {
    setCurrentTemplate(prev => ({
      ...prev,
      [field]: typeof value === 'string' && field.includes('_') && field !== 'name_color' && field !== 'role_color' && field !== 'name_weight' && field !== 'role_weight' ? parseInt(value) || 0 : value
    }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-secondary/30 to-accent/20 p-4">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
            Administração
          </h1>
          <div className="text-xl font-semibold text-primary">Templates de Crachá - Bernhoeft GRT</div>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Gerencie e configure os templates oficiais para geração de crachás
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          {/* Template Form */}
          <Card className="shadow-elegant border-primary/10 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-primary">Novo Template</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Basic Info */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="template-name">Nome do Template</Label>
                  <Input
                    id="template-name"
                    placeholder="Ex: Template Oficial 2024"
                    value={currentTemplate.name || ''}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                  />
                </div>

                <Uploader
                  bucket="templates"
                  accept="image/png,image/jpeg"
                  onUpload={handleTemplateUpload}
                  label="Upload do Template (1013x638)"
                  preview
                />
              </div>

              <Separator />

              {/* Layout Configuration */}
              <div className="space-y-4">
                <h3 className="font-semibold">Configuração do Layout</h3>
                
                {/* Photo Layout */}
                <div className="grid grid-cols-2 gap-4">
                  <h4 className="col-span-2 text-sm font-medium text-muted-foreground">Área da Foto</h4>
                  <div>
                    <Label>X</Label>
                    <Input
                      type="number"
                      value={currentTemplate.photo_x || 0}
                      onChange={(e) => handleInputChange('photo_x', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Y</Label>
                    <Input
                      type="number"
                      value={currentTemplate.photo_y || 0}
                      onChange={(e) => handleInputChange('photo_y', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Largura</Label>
                    <Input
                      type="number"
                      value={currentTemplate.photo_w || 0}
                      onChange={(e) => handleInputChange('photo_w', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Altura</Label>
                    <Input
                      type="number"
                      value={currentTemplate.photo_h || 0}
                      onChange={(e) => handleInputChange('photo_h', e.target.value)}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label>Raio de Arredondamento</Label>
                    <Input
                      type="number"
                      value={currentTemplate.photo_radius || 0}
                      onChange={(e) => handleInputChange('photo_radius', e.target.value)}
                    />
                  </div>
                </div>

                <Separator />

                {/* Name Layout */}
                <div className="grid grid-cols-2 gap-4">
                  <h4 className="col-span-2 text-sm font-medium text-muted-foreground">Área do Nome</h4>
                  <div>
                    <Label>X</Label>
                    <Input
                      type="number"
                      value={currentTemplate.name_x || 0}
                      onChange={(e) => handleInputChange('name_x', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Y</Label>
                    <Input
                      type="number"
                      value={currentTemplate.name_y || 0}
                      onChange={(e) => handleInputChange('name_y', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Largura</Label>
                    <Input
                      type="number"
                      value={currentTemplate.name_w || 0}
                      onChange={(e) => handleInputChange('name_w', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Altura</Label>
                    <Input
                      type="number"
                      value={currentTemplate.name_h || 0}
                      onChange={(e) => handleInputChange('name_h', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Cor</Label>
                    <Input
                      type="color"
                      value={currentTemplate.name_color || '#111111'}
                      onChange={(e) => handleInputChange('name_color', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Tamanho Máximo</Label>
                    <Input
                      type="number"
                      value={currentTemplate.name_max_size || 64}
                      onChange={(e) => handleInputChange('name_max_size', e.target.value)}
                    />
                  </div>
                </div>

                <Separator />

                {/* Role Layout */}
                <div className="grid grid-cols-2 gap-4">
                  <h4 className="col-span-2 text-sm font-medium text-muted-foreground">Área da Função</h4>
                  <div>
                    <Label>X</Label>
                    <Input
                      type="number"
                      value={currentTemplate.role_x || 0}
                      onChange={(e) => handleInputChange('role_x', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Y</Label>
                    <Input
                      type="number"
                      value={currentTemplate.role_y || 0}
                      onChange={(e) => handleInputChange('role_y', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Largura</Label>
                    <Input
                      type="number"
                      value={currentTemplate.role_w || 0}
                      onChange={(e) => handleInputChange('role_w', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Altura</Label>
                    <Input
                      type="number"
                      value={currentTemplate.role_h || 0}
                      onChange={(e) => handleInputChange('role_h', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Cor</Label>
                    <Input
                      type="color"
                      value={currentTemplate.role_color || '#111111'}
                      onChange={(e) => handleInputChange('role_color', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label>Tamanho Máximo</Label>
                    <Input
                      type="number"
                      value={currentTemplate.role_max_size || 72}
                      onChange={(e) => handleInputChange('role_max_size', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <Button 
                onClick={handleSaveTemplate}
                disabled={loading || !currentTemplate.name || !templateUrl}
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                Salvar Template
              </Button>
            </CardContent>
          </Card>

          {/* Preview */}
          <Card className="shadow-elegant border-primary/10 bg-card/80 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-primary">Pré-visualização</CardTitle>
            </CardHeader>
            <CardContent>
              {templateUrl ? (
                <BadgePreview
                  template={currentTemplate as Template}
                  photoFile={null}
                  photoUrl={templateUrl}
                  name="Nome de Exemplo"
                  role="Função de Exemplo"
                />
              ) : (
                <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-8 text-center">
                  <p className="text-muted-foreground">
                    Faça upload de um template para ver a pré-visualização
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Templates List */}
        <Card className="shadow-elegant border-primary/10 bg-card/80 backdrop-blur-sm">
          <CardHeader>
            <CardTitle className="text-primary">Templates da Frente Salvos</CardTitle>
          </CardHeader>
          <CardContent>
            {templates.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                Nenhum template salvo ainda
              </p>
            ) : (
              <div className="space-y-4">
                {templates.map((template) => (
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
                          onClick={() => handleSetOfficial(template.id)}
                          disabled={loading}
                        >
                          <Star className="w-4 h-4 mr-1" />
                          Tornar Oficial
                        </Button>
                      )}
                      
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDeleteTemplate(template.id)}
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

        {/* Back Template Section */}
        <AdminBackSection 
          backTemplates={backTemplates}
          onTemplatesChange={loadBackTemplates}
        />
      </div>
    </div>
  );
}