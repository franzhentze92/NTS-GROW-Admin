import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useMutation, useQueryClient, useQuery } from '@tanstack/react-query';
import { createAnalysis } from '@/lib/analysisApi';
import { getClients } from '@/lib/clientsApi';
import { toast } from '@/components/ui/use-toast';
import { useAppContext } from '@/contexts/AppContext';
import { AnalysisForCreate, Client } from '@/lib/types';
import { CONSULTANTS, CROP_OPTIONS, CATEGORY_OPTIONS } from '@/lib/constants';

const analysisSchema = z.object({
  client_name: z.string().min(1, "Client is required"),
  consultant: z.string().min(1, "Consultant is required"),
  analysis_type: z.enum(['soil', 'leaf']),
  crop: z.string().min(1, "Crop is required"),
  category: z.string().min(1, "Category is required"),
  eal_lab_no: z.string().optional(),
  test_count: z.coerce.number().optional(),
  notes: z.string().optional(),
  sample_no: z.string().optional(),
});

interface AddAnalysisDialogProps {
  children: React.ReactNode;
}

export const AddAnalysisDialog: React.FC<AddAnalysisDialogProps> = ({ children }) => {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const { currentUser } = useAppContext();

  // Fetch clients
  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ['clients'],
    queryFn: getClients,
  });

  const form = useForm<z.infer<typeof analysisSchema>>({
    resolver: zodResolver(analysisSchema),
    defaultValues: {
      client_name: '',
      consultant: '',
      analysis_type: 'soil',
      crop: '',
      category: '',
      eal_lab_no: '',
      test_count: 0,
      notes: '',
      sample_no: '',
    },
  });

  const mutation = useMutation({
    mutationFn: createAnalysis,
    onSuccess: () => {
      toast({ title: "Success", description: "New analysis has been created." });
      queryClient.invalidateQueries({ queryKey: ['analyses'] });
      setOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({ title: "Error", description: error.message, variant: 'destructive' });
    },
  });

  const onSubmit = (values: z.infer<typeof analysisSchema>) => {
    if (!currentUser) {
      toast({ title: "Error", description: "You must be logged in to create an analysis.", variant: 'destructive' });
      return;
    }

    const newAnalysis: AnalysisForCreate = {
      client_name: values.client_name,
      consultant: values.consultant,
      analysis_type: values.analysis_type,
      crop: values.crop,
      category: values.category,
      status: 'Draft',
      updated_by: currentUser.id,
      eal_lab_no: values.eal_lab_no,
      test_count: values.test_count,
      notes: values.notes,
      sample_no: values.sample_no,
    };

    mutation.mutate(newAnalysis);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>Add New Analysis</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new analysis record.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="client_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {clientsLoading ? (
                          <SelectItem value="loading" disabled>Loading clients...</SelectItem>
                        ) : (
                          clients.map((client) => (
                            <SelectItem key={client.id} value={client.name}>
                              {client.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="consultant"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Consultant</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select consultant" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CONSULTANTS.map((consultant) => (
                          <SelectItem key={consultant.id} value={consultant.name}>
                            {consultant.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="analysis_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Analysis Type</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="soil">Soil</SelectItem>
                        <SelectItem value="leaf">Leaf</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORY_OPTIONS.map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="crop"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Crop</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select crop" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CROP_OPTIONS.map((crop) => (
                          <SelectItem key={crop.id} value={crop.name}>
                            {crop.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="eal_lab_no"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>EAL Lab No.</FormLabel>
                    <FormControl>
                      <Input placeholder="1234" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
             <FormField
                control={form.control}
                name="test_count"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>No. of Tests</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            <FormField
              control={form.control}
              name="sample_no"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sample No.</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., SAMPLE-001" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Add any relevant notes..." {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={mutation.isPending}>
              {mutation.isPending ? 'Creating...' : 'Create Analysis'}
            </Button>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}; 