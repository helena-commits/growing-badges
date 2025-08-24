import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Download, Calendar, FileText, Users, TrendingUp, Search, RefreshCw } from 'lucide-react';
import { format, startOfDay, endOfDay, subDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useToast, toast } from '@/hooks/use-toast';

interface BadgePrint {
  id: string;
  full_name: string;
  role_title: string;
  photo_url: string | null;
  photo_origin: string;
  action: string;
  printed_at: string;
}

interface PrintStats {
  total: number;
  today: number;
  last7Days: number;
}

export default function AdminPrints() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [prints, setPrints] = useState<BadgePrint[]>([]);
  const [stats, setStats] = useState<PrintStats>({ total: 0, today: 0, last7Days: 0 });
  const [searchName, setSearchName] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);

  const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || 'admin123';

  useEffect(() => {
    const isAuth = sessionStorage.getItem('adminPrintsAuth') === 'true';
    if (isAuth) {
      setAuthenticated(true);
      loadData();
    }
  }, []);

  useEffect(() => {
    if (authenticated) {
      const interval = setInterval(loadData, 5000); // Auto refresh every 5 seconds
      return () => clearInterval(interval);
    }
  }, [authenticated, searchName, startDate, endDate]);

  const handleLogin = () => {
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true);
      sessionStorage.setItem('adminPrintsAuth', 'true');
      loadData();
    } else {
      toast({
        title: "Erro",
        description: "Senha incorreta",
        variant: "destructive"
      });
    }
  };

  const handleLogout = () => {
    setAuthenticated(false);
    sessionStorage.removeItem('adminPrintsAuth');
  };

  const loadData = async () => {
    setLoading(true);
    try {
      await Promise.all([loadStats(), loadPrints()]);
    } catch (error) {
      console.error('Error loading data:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    const now = new Date();
    const todayStart = startOfDay(now);
    const todayEnd = endOfDay(now);
    const last7DaysStart = startOfDay(subDays(now, 7));

    const [totalResult, todayResult, last7DaysResult] = await Promise.all([
      supabase.from('badges_printed').select('*', { count: 'exact', head: true }),
      supabase
        .from('badges_printed')
        .select('*', { count: 'exact', head: true })
        .gte('printed_at', todayStart.toISOString())
        .lte('printed_at', todayEnd.toISOString()),
      supabase
        .from('badges_printed')
        .select('*', { count: 'exact', head: true })
        .gte('printed_at', last7DaysStart.toISOString())
    ]);

    setStats({
      total: totalResult.count || 0,
      today: todayResult.count || 0,
      last7Days: last7DaysResult.count || 0
    });
  };

  const loadPrints = async () => {
    let query = supabase
      .from('badges_printed')
      .select('*')
      .order('printed_at', { ascending: false })
      .range(0, 99);

    if (searchName) {
      query = query.ilike('full_name', `%${searchName}%`);
    }

    if (startDate) {
      query = query.gte('printed_at', startOfDay(new Date(startDate)).toISOString());
    }

    if (endDate) {
      query = query.lte('printed_at', endOfDay(new Date(endDate)).toISOString());
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    setPrints((data || []) as BadgePrint[]);
  };

  const exportCSV = () => {
    const headers = ['Data/Hora', 'Nome', 'Função', 'Ação', 'Origem da Foto', 'URL da Foto'];
    const rows = prints.map(print => [
      format(new Date(print.printed_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR }),
      print.full_name,
      print.role_title,
      print.action === 'download' ? 'Download' : 'Impressão',
      print.photo_origin || 'unknown',
      print.photo_url || ''
    ]);

    const csvContent = [headers, ...rows]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `badges_printed_${format(new Date(), 'yyyyMMdd_HHmmss')}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Sucesso",
      description: "Arquivo CSV exportado com sucesso"
    });
  };

  const resetFilters = () => {
    setSearchName('');
    setStartDate('');
    setEndDate('');
  };

  if (!authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 to-primary/10">
        <Card className="w-full max-w-md mx-4">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              <FileText className="w-6 h-6" />
              Acesso Administrativo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              type="password"
              placeholder="Senha de acesso"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
            <Button onClick={handleLogin} className="w-full">
              Entrar
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 to-primary/10 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Relatório de Crachás Emitidos</h1>
            <p className="text-muted-foreground">Histórico completo de downloads e impressões</p>
          </div>
          <div className="flex gap-2">
            <Button onClick={loadData} variant="outline" disabled={loading}>
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
            <Button onClick={handleLogout} variant="destructive">
              Sair
            </Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Emitidos</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total}</div>
              <p className="text-xs text-muted-foreground">Desde o início</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Emitidos Hoje</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.today}</div>
              <p className="text-xs text-muted-foreground">Últimas 24 horas</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Últimos 7 Dias</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.last7Days}</div>
              <p className="text-xs text-muted-foreground">Tendência semanal</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Filtros
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <Input
                placeholder="Buscar por nome..."
                value={searchName}
                onChange={(e) => setSearchName(e.target.value)}
                className="flex-1"
              />
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full md:w-auto"
              />
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full md:w-auto"
              />
              <Button onClick={resetFilters} variant="outline">
                Limpar
              </Button>
              <Button onClick={exportCSV} disabled={prints.length === 0}>
                <Download className="w-4 h-4 mr-2" />
                Exportar CSV
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Table */}
        <Card>
          <CardHeader>
            <CardTitle>Histórico de Emissões ({prints.length} registros)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Nome</TableHead>
                    <TableHead>Função</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Foto</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {prints.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                        Nenhum registro encontrado
                      </TableCell>
                    </TableRow>
                  ) : (
                    prints.map((print) => (
                      <TableRow key={print.id}>
                        <TableCell className="font-mono text-sm">
                          {format(new Date(print.printed_at), 'dd/MM/yyyy HH:mm:ss', { locale: ptBR })}
                        </TableCell>
                        <TableCell className="font-medium">{print.full_name}</TableCell>
                        <TableCell>{print.role_title}</TableCell>
                        <TableCell>
                          <Badge variant={print.action === 'download' ? 'default' : 'secondary'}>
                            {print.action === 'download' ? 'Download' : 'Impressão'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {print.photo_url ? (
                            <div className="flex items-center gap-2">
                              <Badge variant="outline" className="text-xs">
                                {print.photo_origin}
                              </Badge>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => window.open(print.photo_url!, '_blank')}
                              >
                                Ver
                              </Button>
                            </div>
                          ) : (
                            <span className="text-muted-foreground text-sm">Sem foto</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}