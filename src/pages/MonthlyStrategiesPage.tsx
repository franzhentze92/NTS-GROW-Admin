import React, { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Target, CheckCircle, List, User, Users, FileText, Calendar, RefreshCw, AlertCircle } from 'lucide-react';
import { useAppContext } from '@/contexts/AppContext';
import { Checkbox } from '@/components/ui/checkbox';

// --- Types ---
interface Objective {
  text: string;
  completed: boolean;
}
interface Strategy {
    id: number;
    month: string;
    title: string;
    description: string;
    status: 'Not Started' | 'Planning' | 'In Progress' | 'Completed' | 'On Hold';
    progress: number;
    priority: 'Low' | 'Medium' | 'High';
    objectives?: (string | Objective)[];
    notes?: string;
    people_involved?: string[];
}

const MONTHS = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
const CURRENT_YEAR = new Date().getFullYear();
const ALL_MONTHS_OPTIONS = MONTHS.map(m => `${m} ${CURRENT_YEAR}`);

// --- API Functions ---
const fetchAllStrategies = async (): Promise<Strategy[]> => {
    const result = await supabase.from('strategies').select('*') as { data: Strategy[] | null, error: any };
    const { data, error } = result;
    if (error) throw new Error(error.message);
    return data || [];
};

// --- Helper: Status Badge Variant ---
const getStatusBadgeVariant = (status: Strategy['status']): 'success' | 'warning' | 'info' | 'secondary' | 'outline' => {
    switch (status) {
        case 'Completed': return 'success';
        case 'In Progress': return 'info';
        case 'Planning': return 'warning';
        case 'On Hold': return 'secondary';
        default: return 'outline';
    }
};

// --- Component ---
const MonthlyStrategiesPage: React.FC = () => {
    const [selectedMonth, setSelectedMonth] = useState(`${MONTHS[new Date().getMonth()]} ${CURRENT_YEAR}`);
    const { data: strategies = [], isLoading, isError, error, refetch } = useQuery({ queryKey: ['allStrategies'], queryFn: fetchAllStrategies });
    const { hasRole } = useAppContext();
    const isSuperAdmin = hasRole('super-admin');
    const [updating, setUpdating] = useState(false);
    const [localObjectives, setLocalObjectives] = useState<(Objective)[]>([]);

    const strategy = useMemo(() => {
        const found = strategies.find(s => s.month === selectedMonth);
        if (found) return found;
        return {
            id: 0,
            month: selectedMonth,
            title: 'No Strategy Defined',
            description: 'Use the Strategy Management page to define a strategy for this month.',
            status: 'Not Started' as const,
            progress: 0,
            priority: 'Low' as const,
            objectives: [],
            notes: '',
            people_involved: [],
        };
    }, [strategies, selectedMonth]);

    // Convert objectives to new format for local state
    React.useEffect(() => {
      let rawObjectives = strategy.objectives || [];
      // Fallback: parse if stringified
      if (typeof rawObjectives === 'string') {
        try {
          rawObjectives = JSON.parse(rawObjectives);
        } catch {
          rawObjectives = [];
        }
      }
      // If array of strings, convert to objects
      if (Array.isArray(rawObjectives) && rawObjectives.length > 0) {
        setLocalObjectives(
          rawObjectives.map(obj => {
            if (typeof obj === 'string') {
              try {
                // If stringified object
                const parsed = JSON.parse(obj);
                if (typeof parsed === 'object' && parsed.text) return parsed;
                return { text: obj, completed: false };
              } catch {
                return { text: obj, completed: false };
              }
            }
            return obj;
          })
        );
      } else {
        setLocalObjectives([]);
      }
    }, [strategy.objectives]);

    const handleToggleObjective = async (idx: number) => {
      if (!strategy.id) return;
      setUpdating(true);
      const updatedObjectives = localObjectives.map((obj, i) =>
        i === idx ? { ...obj, completed: !obj.completed } : obj
      );
      setLocalObjectives(updatedObjectives);
      // Persist to backend (do NOT stringify)
      await supabase
        .from('strategies')
        .update({ objectives: updatedObjectives })
        .eq('id', strategy.id);
      setUpdating(false);
      refetch();
    };

    if (isLoading) {
        return <div className="flex items-center justify-center h-full p-6"><RefreshCw className="h-6 w-6 animate-spin mr-2" /> Loading strategies...</div>;
    }

    if (isError) {
        return <div className="text-destructive p-6 flex items-center"><AlertCircle className="h-6 w-6 mr-2" />Error loading strategies: {error.message}</div>;
    }

    return (
        <div className="p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-foreground">Monthly Strategies</h1>
                    <p className="text-muted-foreground mt-1">A detailed view of the strategic initiative for each month.</p>
                </div>
                 <div className="w-full sm:w-auto">
                    <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                        <SelectTrigger className="w-full sm:w-[280px]">
                            <SelectValue placeholder="Select a month" />
                        </SelectTrigger>
                        <SelectContent>
                            {ALL_MONTHS_OPTIONS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}
                        </SelectContent>
                    </Select>
                </div>
            </div>
            
            <Card className="shadow-lg border-primary/20">
                <CardHeader>
                    <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                            <CardTitle className="text-2xl font-bold text-primary flex items-center gap-2">
                                <Calendar className="h-6 w-6"/> {strategy.month}
                            </CardTitle>
                             <p className="text-lg text-muted-foreground font-semibold">{strategy.title}</p>
                        </div>
                        <div className="flex flex-col items-end gap-2 text-sm">
                           <Badge variant={getStatusBadgeVariant(strategy.status)}>{strategy.status}</Badge>
                           <Badge variant={strategy.priority === 'High' ? 'destructive' : strategy.priority === 'Medium' ? 'warning' : 'success'}>
                                {strategy.priority} Priority
                           </Badge>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><Target className="h-5 w-5"/> Description</h3>
                        <p className="text-muted-foreground pl-7">{strategy.description}</p>
                    </div>

                    {strategy.id > 0 && (
                        <>
                           <div>
                                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><List className="h-5 w-5"/> Objectives</h3>
                                <ul className="list-none space-y-2 pl-7">
                                    {localObjectives && localObjectives.length > 0 ? localObjectives.map((obj, i) => (
                                        <li key={i} className="flex items-start gap-2 text-muted-foreground">
                                            {isSuperAdmin ? (
                                              <Checkbox
                                                checked={obj.completed}
                                                onCheckedChange={() => handleToggleObjective(i)}
                                                disabled={updating}
                                                className="mt-1 mr-2"
                                              />
                                            ) : obj.completed ? (
                                              <CheckCircle className="h-5 w-5 text-primary mt-1" />
                                            ) : (
                                              <span className="h-5 w-5 mt-1 inline-block border rounded-full border-muted-foreground" />
                                            )}
                                            <span style={{ textDecoration: obj.completed ? 'line-through' : 'none' }}>{obj.text}</span>
                                        </li>
                                    )) : <p className="text-muted-foreground">No objectives defined.</p>}
                                </ul>
                            </div>
                             <div>
                                <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><Users className="h-5 w-5"/> People Involved</h3>
                                <div className="flex flex-wrap gap-2 pl-7">
                                    {strategy.people_involved && strategy.people_involved.length > 0 ? strategy.people_involved.map((person) => (
                                        <Badge key={person} variant="secondary"><User className="h-3 w-3 mr-1"/>{person}</Badge>
                                    )) : <p className="text-muted-foreground">No people assigned.</p>}
                                </div>
                            </div>

                            {strategy.notes && (
                                <div>
                                    <h3 className="font-semibold text-lg mb-2 flex items-center gap-2"><FileText className="h-5 w-5"/> Notes</h3>
                                    <p className="text-muted-foreground p-3 bg-muted rounded-md text-sm pl-7">{strategy.notes}</p>
                                </div>
                            )}

                            <div>
                               <h3 className="font-semibold text-lg mb-2">Progress</h3>
                                <div className="flex items-center gap-3">
                                   <Progress value={strategy.progress} className="w-full" />
                                   <span className="font-bold text-primary">{strategy.progress}%</span>
                               </div>
                            </div>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default MonthlyStrategiesPage; 