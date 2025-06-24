import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FieldVisit, CreateFieldVisitData, UpdateFieldVisitData } from '@/lib/types';
import { CONSULTANTS, CROP_OPTIONS } from '@/lib/constants';

const fieldVisitSchema = z.object({
  farm_name: z.string().min(1, 'Farm name is required'),
  farmer_name: z.string().min(1, 'Farmer name is required'),
  agronomist: z.string().min(1, 'Agronomist is required'),
  visit_date: z.string().min(1, 'Visit date is required'),
  visit_type: z.enum(['routine', 'emergency', 'follow-up', 'initial']),
  crop_type: z.string().min(1, 'Crop type is required'),
  field_size: z.number().min(0.1, 'Field size must be greater than 0'),
  field_size_unit: z.enum(['hectares', 'acres']),
  soil_type: z.string().optional(),
  weather_conditions: z.string().optional(),
  observations: z.string().min(1, 'Observations are required'),
  recommendations: z.string().min(1, 'Recommendations are required'),
  next_visit_date: z.string().optional(),
  status: z.enum(['scheduled', 'in-progress', 'completed', 'cancelled']),
  location: z.object({
    latitude: z.number().optional(),
    longitude: z.number().optional(),
    address: z.string().optional(),
  }).optional(),
  photos: z.array(z.string()).optional(),
});

type FieldVisitFormData = z.infer<typeof fieldVisitSchema>;

interface FieldVisitFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: CreateFieldVisitData | UpdateFieldVisitData) => void;
  visit?: FieldVisit;
  isLoading?: boolean;
}

const FieldVisitFormDialog: React.FC<FieldVisitFormDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  visit,
  isLoading = false,
}) => {
  const form = useForm<FieldVisitFormData>({
    resolver: zodResolver(fieldVisitSchema),
    defaultValues: {
      farm_name: visit?.farm_name || '',
      farmer_name: visit?.farmer_name || '',
      agronomist: visit?.agronomist || '',
      visit_date: visit?.visit_date ? new Date(visit.visit_date).toISOString().split('T')[0] : '',
      visit_type: visit?.visit_type || 'routine',
      crop_type: visit?.crop_type || '',
      field_size: visit?.field_size || 0,
      field_size_unit: visit?.field_size_unit || 'hectares',
      soil_type: visit?.soil_type || '',
      weather_conditions: visit?.weather_conditions || '',
      observations: visit?.observations || '',
      recommendations: visit?.recommendations || '',
      next_visit_date: visit?.next_visit_date ? new Date(visit.next_visit_date).toISOString().split('T')[0] : '',
      status: visit?.status || 'scheduled',
      location: visit?.location || { address: '' },
      photos: visit?.photos || [],
    },
  });

  const handleSubmit = (data: FieldVisitFormData) => {
    const submitData = {
      ...data,
      field_size: Number(data.field_size),
      ...(visit && { id: visit.id }),
    };
    onSubmit(submitData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{visit ? 'Edit Field Visit' : 'Add New Field Visit'}</DialogTitle>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="farm_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Farm Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter farm name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="farmer_name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Farmer Name *</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter farmer name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="agronomist"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Agronomist *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select agronomist" />
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

              <FormField
                control={form.control}
                name="visit_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visit Date *</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="visit_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visit Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select visit type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="routine">Routine</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                        <SelectItem value="follow-up">Follow-up</SelectItem>
                        <SelectItem value="initial">Initial</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="scheduled">Scheduled</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="crop_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Crop Type *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select crop type" />
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

              <div className="grid grid-cols-2 gap-2">
                <FormField
                  control={form.control}
                  name="field_size"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Field Size *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.1" 
                          placeholder="0.0" 
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="field_size_unit"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Unit</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="hectares">Hectares</SelectItem>
                          <SelectItem value="acres">Acres</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="next_visit_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Next Visit Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="soil_type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Soil Type</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Sandy loam, Clay" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weather_conditions"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weather Conditions</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Sunny, 25°C, Light breeze" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="location.address"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter farm location address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observations *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter detailed observations about the field visit..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="recommendations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Recommendations *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter recommendations and next steps..."
                      className="min-h-[100px]"
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? 'Saving...' : (visit ? 'Update Visit' : 'Create Visit')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default FieldVisitFormDialog; 