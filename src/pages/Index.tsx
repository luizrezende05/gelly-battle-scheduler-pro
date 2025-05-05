
import React, { useState } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "@/components/ui/use-toast";

interface Match {
  id: string;
  date: Date;
  time: string;
  customerName: string;
  playerCount: number;
  notes: string;
  matchType: "paintball" | "gellyball";
}

const Index = () => {
  const [matches, setMatches] = useState<Match[]>([]);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [time, setTime] = useState("08:00");
  const [customerName, setCustomerName] = useState("");
  const [playerCount, setPlayerCount] = useState<number>(10);
  const [notes, setNotes] = useState("");
  const [matchType, setMatchType] = useState<"paintball" | "gellyball">("paintball");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  
  const handleAddMatch = () => {
    if (!date || !customerName || !time) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos obrigatórios",
        variant: "destructive",
      });
      return;
    }
    
    const newMatch: Match = {
      id: crypto.randomUUID(),
      date: date,
      time,
      customerName,
      playerCount,
      notes,
      matchType,
    };
    
    setMatches([...matches, newMatch].sort((a, b) => {
      // Sort by date first
      const dateComparison = a.date.getTime() - b.date.getTime();
      if (dateComparison !== 0) return dateComparison;
      
      // If dates are the same, sort by time
      return a.time.localeCompare(b.time);
    }));
    
    // Reset form
    setTime("08:00");
    setCustomerName("");
    setPlayerCount(10);
    setNotes("");
    setMatchType("paintball");
    
    setIsDialogOpen(false);
    
    toast({
      title: "Partida adicionada",
      description: `Partida para ${customerName} adicionada com sucesso!`,
    });
  };
  
  const handleRemoveMatch = (id: string) => {
    setMatches(matches.filter(match => match.id !== id));
    toast({
      title: "Partida removida",
      description: "A partida foi removida com sucesso",
    });
  };
  
  const formatMatchDate = (date: Date) => {
    return format(date, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50">
      <div className="container mx-auto py-8 px-4">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-blue-800">Agenda de Partidas</h1>
            <p className="text-gray-600">Campo de Paintball e Gellyball</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="mr-2 h-4 w-4" />
                Nova Partida
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader>
                <DialogTitle>Adicionar Nova Partida</DialogTitle>
                <DialogDescription>
                  Preencha os detalhes da nova partida.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="date" className="text-right">
                    Data
                  </Label>
                  <div className="col-span-3">
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "w-full justify-start text-left font-normal",
                            !date && "text-muted-foreground"
                          )}
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {date ? format(date, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={date}
                          onSelect={setDate}
                          initialFocus
                          locale={ptBR}
                          className={cn("p-3 pointer-events-auto")}
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="time" className="text-right">
                    Horário
                  </Label>
                  <Input
                    id="time"
                    type="time"
                    value={time}
                    onChange={(e) => setTime(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="name" className="text-right">
                    Nome do Cliente
                  </Label>
                  <Input
                    id="name"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="players" className="text-right">
                    Jogadores
                  </Label>
                  <Input
                    id="players"
                    type="number"
                    min="1"
                    value={playerCount}
                    onChange={(e) => setPlayerCount(Number(e.target.value))}
                    className="col-span-3"
                  />
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="type" className="text-right">
                    Tipo de Jogo
                  </Label>
                  <Select
                    value={matchType}
                    onValueChange={(value: "paintball" | "gellyball") => setMatchType(value)}
                  >
                    <SelectTrigger className="col-span-3">
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="paintball">Paintball</SelectItem>
                      <SelectItem value="gellyball">Gellyball</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid grid-cols-4 items-center gap-4">
                  <Label htmlFor="notes" className="text-right">
                    Observações
                  </Label>
                  <Textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="col-span-3"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={handleAddMatch}>Adicionar</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        
        {matches.length === 0 ? (
          <Card>
            <CardContent className="pt-6 text-center">
              <p className="text-gray-500">Nenhuma partida agendada. Clique em "Nova Partida" para adicionar.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {Array.from(new Set(matches.map(match => match.date.toDateString()))).map(dateString => {
              const matchDate = new Date(dateString);
              const dateMatches = matches.filter(match => match.date.toDateString() === dateString)
                .sort((a, b) => a.time.localeCompare(b.time));
              
              return (
                <Card key={dateString} className="overflow-hidden border-l-4 border-l-blue-500">
                  <CardHeader className="bg-blue-50">
                    <CardTitle className="text-xl text-blue-800">
                      {formatMatchDate(matchDate)}
                    </CardTitle>
                    <CardDescription>
                      {dateMatches.length} {dateMatches.length === 1 ? 'partida' : 'partidas'} agendadas
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="p-0">
                    <div className="divide-y">
                      {dateMatches.map(match => (
                        <div key={match.id} className="p-4 hover:bg-gray-50">
                          <div className="flex justify-between">
                            <div className="flex items-center gap-3">
                              <div className={cn(
                                "w-2 h-2 rounded-full",
                                match.matchType === "paintball" ? "bg-blue-500" : "bg-green-500"
                              )} />
                              <span className="font-medium">{match.time}</span>
                              <span className="font-semibold">{match.customerName}</span>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleRemoveMatch(match.id)}
                              className="text-red-500 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="ml-5 pl-5 border-l border-gray-200 mt-2">
                            <div className="text-sm">
                              <span className="text-gray-500">Tipo: </span>
                              <span className="font-medium">
                                {match.matchType === "paintball" ? "Paintball" : "Gellyball"}
                              </span>
                            </div>
                            <div className="text-sm">
                              <span className="text-gray-500">Jogadores: </span>
                              <span className="font-medium">{match.playerCount}</span>
                            </div>
                            {match.notes && (
                              <div className="text-sm mt-1">
                                <span className="text-gray-500">Observações: </span>
                                <span>{match.notes}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Index;
