
import { useEffect, useState } from 'react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import { CalendarIcon, Trash2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Toaster } from "@/components/ui/sonner";
import { toast } from "sonner";

type Match = {
  id: string;
  date: Date;
  time: string;
  customerName: string;
  playerCount: number;
  additionalInfo: string;
};

function App() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState<string>("");
  const [customerName, setCustomerName] = useState<string>("");
  const [playerCount, setPlayerCount] = useState<number>(10);
  const [additionalInfo, setAdditionalInfo] = useState<string>("");
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [matchToDelete, setMatchToDelete] = useState<string | null>(null);

  useEffect(() => {
    const savedMatches = localStorage.getItem('matches');
    if (savedMatches) {
      const parsedMatches = JSON.parse(savedMatches);
      // Convert string dates back to Date objects
      const matchesWithDates = parsedMatches.map((match: any) => ({
        ...match,
        date: new Date(match.date)
      }));
      setMatches(matchesWithDates);
    }
  }, []);

  useEffect(() => {
    // Save to localStorage whenever matches change
    if (matches.length > 0) {
      localStorage.setItem('matches', JSON.stringify(matches));
    }
  }, [matches]);

  const addMatch = () => {
    if (!date || !time || !customerName) {
      toast.error("Por favor preencha todos os campos obrigatórios");
      return;
    }

    const newMatch: Match = {
      id: Date.now().toString(),
      date,
      time,
      customerName,
      playerCount,
      additionalInfo
    };

    // Add the new match and sort all matches by date and time
    const updatedMatches = [...matches, newMatch].sort((a, b) => {
      // First compare by date
      const dateComparison = a.date.getTime() - b.date.getTime();
      if (dateComparison !== 0) return dateComparison;
      
      // If dates are the same, compare by time
      return a.time.localeCompare(b.time);
    });

    setMatches(updatedMatches);
    resetForm();
    setIsDialogOpen(false);
    toast.success("Partida adicionada com sucesso!");
  };

  const deleteMatch = (id: string) => {
    setMatchToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (matchToDelete) {
      const updatedMatches = matches.filter(match => match.id !== matchToDelete);
      setMatches(updatedMatches);
      setIsDeleteDialogOpen(false);
      setMatchToDelete(null);
      
      // If matches are empty, clear localStorage
      if (updatedMatches.length === 0) {
        localStorage.removeItem('matches');
      }
      
      toast.success("Partida removida com sucesso!");
    }
  };

  const resetForm = () => {
    setDate(new Date());
    setTime("");
    setCustomerName("");
    setPlayerCount(10);
    setAdditionalInfo("");
  };

  // Group matches by date for display
  const matchesByDate = matches.reduce((groups, match) => {
    const dateKey = format(match.date, 'yyyy-MM-dd');
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(match);
    return groups;
  }, {} as Record<string, Match[]>);

  return (
    <div className="min-h-screen bg-gradient-to-b from-red-50 to-white">
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold text-red-800 mb-8 text-center">Agenda de Partidas</h1>
        
        <div className="flex justify-end mb-6">
          <Button 
            onClick={() => setIsDialogOpen(true)}
            className="bg-red-600 hover:bg-red-700"
          >
            Nova Partida
          </Button>
        </div>

        {matches.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm border border-red-100">
            <p className="text-gray-500">Nenhuma partida agendada</p>
            <Button 
              onClick={() => setIsDialogOpen(true)} 
              variant="link" 
              className="mt-2 text-red-600"
            >
              Agendar agora
            </Button>
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(matchesByDate).map(([dateKey, dateMatches]) => (
              <div key={dateKey} className="bg-white rounded-lg shadow-sm p-4 border border-red-100">
                <h2 className="text-xl font-medium mb-4 pb-2 border-b border-red-100 text-red-700">
                  {format(new Date(dateKey), 'EEEE, dd/MM/yyyy', { locale: ptBR })}
                </h2>
                <div className="space-y-4">
                  {dateMatches.map(match => (
                    <div key={match.id} className="flex items-start justify-between p-3 hover:bg-red-50 rounded-md transition-colors">
                      <div>
                        <div className="flex items-center gap-3 mb-1">
                          <span className="text-lg font-medium">{match.time}</span>
                          <span className="font-medium">{match.customerName}</span>
                          <span className="bg-red-100 text-red-800 text-xs px-2 py-1 rounded-full">
                            {match.playerCount} jogadores
                          </span>
                        </div>
                        {match.additionalInfo && (
                          <p className="text-sm text-gray-600 mt-1">{match.additionalInfo}</p>
                        )}
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => deleteMatch(match.id)}
                        className="text-red-600 hover:text-red-800 hover:bg-red-100"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Match Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Agendar Nova Partida</DialogTitle>
              <DialogDescription>
                Preencha os detalhes da partida abaixo.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="date">Data*</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="date"
                      variant="outline"
                      className={cn(
                        "justify-start text-left font-normal border-red-200",
                        !date && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, 'dd/MM/yyyy') : <span>Selecione uma data</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="time">Horário*</Label>
                <Select value={time} onValueChange={setTime}>
                  <SelectTrigger id="time" className="border-red-200">
                    <SelectValue placeholder="Selecione um horário" />
                  </SelectTrigger>
                  <SelectContent>
                    {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00'].map(t => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="customerName">Nome do Cliente*</Label>
                <Input 
                  id="customerName" 
                  value={customerName} 
                  onChange={(e) => setCustomerName(e.target.value)} 
                  className="border-red-200"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="playerCount">Número de Jogadores</Label>
                <Input 
                  id="playerCount" 
                  type="number" 
                  min={1}
                  value={playerCount} 
                  onChange={(e) => setPlayerCount(Number(e.target.value))} 
                  className="border-red-200"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="additionalInfo">Informações Adicionais</Label>
                <Textarea 
                  id="additionalInfo" 
                  value={additionalInfo} 
                  onChange={(e) => setAdditionalInfo(e.target.value)} 
                  className="border-red-200"
                />
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsDialogOpen(false)}
                className="border-red-200 text-red-700 hover:bg-red-50"
              >
                Cancelar
              </Button>
              <Button onClick={addMatch} className="bg-red-600 hover:bg-red-700">
                Adicionar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Confirmar Exclusão</DialogTitle>
              <DialogDescription>
                Tem certeza que deseja remover esta partida da agenda?
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsDeleteDialogOpen(false)}
                className="border-red-200 text-red-700 hover:bg-red-50"
              >
                Cancelar
              </Button>
              <Button 
                onClick={confirmDelete} 
                variant="destructive"
                className="bg-red-600 hover:bg-red-700"
              >
                Excluir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        
        <Toaster />
      </div>
    </div>
  );
}

export default App;
