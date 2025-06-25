import React, { useState, useEffect } from 'react';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabaseClient';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from '@/components/ui/use-toast';
import { Target, Save, RefreshCw, AlertCircle, PlusCircle, Trash2, Edit, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { useAppContext } from '@/contexts/AppContext';
import { Checkbox } from '@/components/ui/checkbox';

// --- Types and Schema ---
interface Objective {
  text: string;
  completed: boolean;
}
const strategySchema = z.object({
    id: z.number().optional(),
    month: z.string().min(1, "Month is required"),
    title: z.string().min(3, 'Title must be at least 3 characters').max(100),
    description: z.string().optional(),
    status: z.enum(['Not Started', 'Planning', 'In Progress', 'Completed', 'On Hold']),
    priority: z.enum(['Low', 'Medium', 'High']),
    progress: z.number().min(0).max(100),
    objectives: z.array(z.any()).optional(),
    notes: z.string().optional(),
    people_involved: z.array(z.string()).optional(),
});

type Strategy = z.infer<typeof strategySchema>;

const MONTHS = [ "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December" ];
const CURRENT_YEAR = new Date().getFullYear();

// --- API Functions ---
const fetchStrategies = async (): Promise<Strategy[]> => {
    const { data, error } = await supabase.from('strategies').select('*').order('month', { ascending: true });
    if (error) throw new Error(error.message);
    return data as Strategy[];
};

const saveStrategy = async (strategy: Partial<Strategy>) => {
    const { error } = await supabase.from('strategies').upsert(strategy).select();
    if (error) throw new Error(error.message);
};

const deleteStrategy = async (id: number) => {
    const { error } = await supabase.from('strategies').delete().eq('id', id);
    if (error) throw new Error(error.message);
};

// --- Strategy Form Component ---
const StrategyForm: React.FC<{ strategy?: Strategy, onSave: (data: Strategy) => void, onCancel: () => void, isSaving: boolean }> = ({ strategy, onSave, onCancel, isSaving }) => {
    const { hasRole } = useAppContext();
    const isSuperAdmin = hasRole('super-admin');
    const [objectives, setObjectives] = useState<Objective[]>(() => {
      if (strategy?.objectives && strategy.objectives.length > 0) {
        return strategy.objectives.map((obj: any) =>
          typeof obj === 'string' ? { text: obj, completed: false } : obj
        );
      }
      return [{ text: '', completed: false }];
    });
    const form = useForm<Strategy>({
        resolver: zodResolver(strategySchema),
        defaultValues: {
            ...strategy,
            title: strategy?.title || '',
            description: strategy?.description || '',
            month: strategy?.month || `${MONTHS[new Date().getMonth()]} ${CURRENT_YEAR}`,
            status: strategy?.status || 'Not Started',
            priority: strategy?.priority || 'Medium',
            progress: strategy?.progress || 0,
            objectives: strategy?.objectives && strategy.objectives.length > 0 ? strategy.objectives : [''],
            notes: strategy?.notes || '',
            people_involved: strategy?.people_involved && strategy.people_involved.length > 0 ? strategy.people_involved : ['Franz'],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "objectives"
    });
    const [people, setPeople] = useState<string[]>(strategy?.people_involved || ['Franz']);
    const [personInput, setPersonInput] = useState('');

    // Sync objectives with form
    useEffect(() => {
      form.setValue('objectives', objectives);
    }, [objectives]);

    const handleObjectiveTextChange = (index: number, value: string) => {
      setObjectives(prev => prev.map((obj, i) => i === index ? { ...obj, text: value } : obj));
    };
    const handleObjectiveToggle = (index: number) => {
      setObjectives(prev => prev.map((obj, i) => i === index ? { ...obj, completed: !obj.completed } : obj));
    };
    const handleAddObjective = () => {
      setObjectives(prev => [...prev, { text: '', completed: false }]);
    };
    const handleRemoveObjective = (index: number) => {
      if (objectives.length <= 1) return;
      setObjectives(prev => prev.filter((_, i) => i !== index));
    };

    const handleAddPerson = () => {
        if (personInput && !people.includes(personInput)) {
            const newPeople = [...people, personInput];
            setPeople(newPeople);
            form.setValue('people_involved', newPeople);
            setPersonInput('');
        }
    };

    const handleRemovePerson = (personToRemove: string) => {
        const newPeople = people.filter(p => p !== personToRemove);
        setPeople(newPeople);
        form.setValue('people_involved', newPeople);
    };

    const onSubmit = (data: Strategy) => {
        onSave({ ...data, objectives, people_involved: people });
    };

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                    <FormField control={form.control} name="title" render={({ field }) => (
                        <FormItem><FormLabel>Strategy Title</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                    )} />
                     <FormField control={form.control} name="month" render={({ field }) => (
                        <FormItem><FormLabel>Month</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>{MONTHS.map(m => <SelectItem key={m} value={`${m} ${CURRENT_YEAR}`}>{`${m} ${CURRENT_YEAR}`}</SelectItem>)}</SelectContent>
                            </Select><FormMessage />
                        </FormItem>
                    )} />
                </div>
                <FormField control={form.control} name="description" render={({ field }) => (
                    <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea {...field} /></FormControl><FormMessage /></FormItem>
                )} />

                <div>
                    <FormLabel>Objectives</FormLabel>
                    <div className="space-y-2 mt-2">
                        {objectives.map((obj, index) => (
                          <div key={index} className="flex items-center gap-2">
                            {isSuperAdmin && (
                              <Checkbox
                                checked={obj.completed}
                                onCheckedChange={() => handleObjectiveToggle(index)}
                                className="mt-1 mr-2"
                              />
                            )}
                            <Input
                              value={obj.text}
                              onChange={e => handleObjectiveTextChange(index, e.target.value)}
                              placeholder="Enter an objective..."
                              className="flex-grow"
                            />
                            <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveObjective(index)} disabled={objectives.length <= 1}><Trash2 className="h-4 w-4" /></Button>
                          </div>
                        ))}
                    </div>
                    <Button type="button" variant="outline" size="sm" className="mt-2" onClick={handleAddObjective}><PlusCircle className="h-4 w-4 mr-2"/>Add Objective</Button>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                    <FormField control={form.control} name="status" render={({ field }) => (
                        <FormItem><FormLabel>Status</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>{['Not Started', 'Planning', 'In Progress', 'Completed', 'On Hold'].map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                            </Select><FormMessage />
                        </FormItem>
                    )} />
                    <FormField control={form.control} name="priority" render={({ field }) => (
                        <FormItem><FormLabel>Priority</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl><SelectTrigger><SelectValue /></SelectTrigger></FormControl>
                                <SelectContent>{['Low', 'Medium', 'High'].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent>
                            </Select><FormMessage />
                        </FormItem>
                    )} />
                     <FormField control={form.control} name="progress" render={({ field }) => (
                        <FormItem><FormLabel>Progress: {field.value}%</FormLabel><FormControl><Slider defaultValue={[field.value]} onValueChange={(value) => field.onChange(value[0])} /></FormControl><FormMessage /></FormItem>
                    )} />
                </div>
                
                <FormField control={form.control} name="notes" render={({ field }) => (
                    <FormItem><FormLabel>Notes</FormLabel><FormControl><Textarea {...field} placeholder="Add any relevant notes here..." /></FormControl><FormMessage /></FormItem>
                )} />

                <div>
                     <FormLabel>People Involved</FormLabel>
                     <div className="flex items-center gap-2 mt-2">
                         <Input value={personInput} onChange={e => setPersonInput(e.target.value)} placeholder="Add person..." />
                         <Button type="button" onClick={handleAddPerson}>Add</Button>
                     </div>
                     <div className="flex flex-wrap gap-2 mt-2">
                        {people.map(p => (
                            <Badge key={p} variant="secondary" className="flex items-center gap-1">
                                {p} <X className="h-3 w-3 cursor-pointer" onClick={() => handleRemovePerson(p)}/>
                            </Badge>
                        ))}
                     </div>
                </div>

                <DialogFooter>
                    <Button type="button" variant="ghost" onClick={onCancel}>Cancel</Button>
                    <Button type="submit" disabled={isSaving}>
                        {isSaving ? <><RefreshCw className="h-4 w-4 mr-2 animate-spin"/> Saving...</> : <><Save className="h-4 w-4 mr-2"/> Save Strategy</>}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
    );
}

// --- Main Page Component ---
const StrategyManagementPage: React.FC = () => {
    const queryClient = useQueryClient();
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingStrategy, setEditingStrategy] = useState<Strategy | undefined>(undefined);

    const { data: strategies = [], isLoading, isError, error, refetch } = useQuery({ queryKey: ['strategies'], queryFn: fetchStrategies });
    
    const saveMutation = useMutation({
        mutationFn: saveStrategy,
        onSuccess: () => {
            toast({ title: 'Success!', description: 'Strategy saved successfully.' });
            queryClient.invalidateQueries({ queryKey: ['strategies'] });
            setIsDialogOpen(false);
        },
        onError: (err) => toast({ variant: 'destructive', title: 'Error saving strategy', description: err.message }),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteStrategy,
        onSuccess: () => {
            toast({ title: 'Success!', description: 'Strategy deleted.' });
            queryClient.invalidateQueries({ queryKey: ['strategies'] });
        },
        onError: (err) => toast({ variant: 'destructive', title: 'Error deleting strategy', description: err.message }),
    });

    const handleAddNew = () => {
        setEditingStrategy(undefined);
        setIsDialogOpen(true);
    };

    const handleEdit = (strategy: Strategy) => {
        setEditingStrategy(strategy);
        setIsDialogOpen(true);
    };

    const handleDelete = (id?: number) => {
        if (id && window.confirm('Are you sure you want to delete this strategy?')) {
            deleteMutation.mutate(id);
        }
    };

    return (
        <div className="container mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Strategy Management</h1>
                    <p className="text-muted-foreground mt-1">Define, track, and manage all your monthly strategies.</p>
                </div>
                <div className="flex items-center gap-2">
                    <Button onClick={() => refetch()} variant="outline" size="sm"><RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} /></Button>
                    <Button onClick={handleAddNew}><PlusCircle className="mr-2 h-4 w-4"/> New Strategy</Button>
                </div>
            </div>
            
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingStrategy ? 'Edit Strategy' : 'Create New Strategy'}</DialogTitle>
                    </DialogHeader>
                    <StrategyForm 
                        strategy={editingStrategy}
                        onSave={(data) => saveMutation.mutate(data)}
                        onCancel={() => setIsDialogOpen(false)}
                        isSaving={saveMutation.isPending}
                    />
                </DialogContent>
            </Dialog>

            <Card>
                <CardHeader><CardTitle>All Strategies</CardTitle></CardHeader>
                <CardContent>
                    {isLoading && <div className="text-center p-4">Loading...</div>}
                    {isError && <div className="text-destructive p-4">Error: {error?.message}</div>}
                    {!isLoading && !isError && (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Month</TableHead>
                                    <TableHead>Title</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Priority</TableHead>
                                    <TableHead>Progress</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {strategies.map(s => (
                                    <TableRow key={s.id}>
                                        <TableCell>{s.month}</TableCell>
                                        <TableCell className="font-medium">{s.title}</TableCell>
                                        <TableCell>
                                            <Badge variant={
                                                s.status === 'Completed' ? 'success' :
                                                s.status === 'In Progress' ? 'info' :
                                                s.status === 'Planning' ? 'warning' :
                                                s.status === 'On Hold' ? 'secondary' :
                                                'outline'
                                            }>{s.status}</Badge>
                                        </TableCell>
                                        <TableCell><Badge variant={s.priority === 'High' ? 'destructive' : s.priority === 'Medium' ? 'secondary' : 'outline'}>{s.priority}</Badge></TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Progress value={s.progress} className="w-full" />
                                                <span className="text-muted-foreground text-xs">{s.progress}%</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <Button variant="ghost" size="icon" onClick={() => handleEdit(s)}><Edit className="h-4 w-4" /></Button>
                                            <Button variant="ghost" size="icon" onClick={() => handleDelete(s.id)}><Trash2 className="h-4 w-4" /></Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};

export default StrategyManagementPage;