import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { FieldVisit, CreateFieldVisitData, UpdateFieldVisitData } from '@/lib/types';
import { CONSULTANTS, CROP_OPTIONS, FARM_OPTIONS, PADDOCK_OPTIONS } from '@/lib/constants';
import { supabase } from '@/lib/supabaseClient';
import { useState, useEffect } from 'react';
import { Upload, X, Image as ImageIcon } from 'lucide-react';

const fieldVisitSchema = z.object({
  visit_date: z.string().min(1, 'Visit date is required'),
  consultant: z.string().min(1, 'Consultant is required'),
  client_id: z.string().min(1, 'Client is required').refine(val => val !== 'select', 'Client is required'),
  status: z.enum(['Scheduled', 'In Progress', 'Completed', 'Cancelled']).default('Scheduled'),
  farm: z.string().optional(),
  paddock: z.string().optional(),
  crop: z.string().optional(),
  visit_reason: z.string().optional(),
  soil_ph: z.coerce.number().optional(),
  soil_texture: z.string().optional(),
  plant_height: z.coerce.number().optional(),
  fruiting: z.string().optional(),
  sap_ph: z.coerce.number().optional(),
  sap_nitrate: z.coerce.number().optional(),
  sap_calcium: z.coerce.number().optional(),
  sap_magnesium: z.coerce.number().optional(),
  sap_potassium: z.coerce.number().optional(),
  sap_sodium: z.coerce.number().optional(),
  penetrometer: z.coerce.number().optional(),
  soil_electroconductivity: z.coerce.number().optional(),
  sap_electroconductivity: z.coerce.number().optional(),
  chlorophyll_reading: z.coerce.number().optional(),
  soil_paramagnetism: z.coerce.number().optional(),
  in_field_observations: z.string().optional(),
  general_comments: z.string().optional(),
  address: z.string().optional(),
  image_urls: z.array(z.string()).optional(),
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
  const [uploading, setUploading] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<string[]>([]);
  const [clients, setClients] = useState<{ id: string; name: string }[]>([]);

  // Fetch clients from Supabase
  useEffect(() => {
    async function fetchClients() {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/rest/v1/clients?select=id,name`, {
        headers: {
          'apikey': import.meta.env.VITE_SUPABASE_ANON_KEY,
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setClients(data);
      }
    }
    fetchClients();
  }, []);

  const form = useForm<FieldVisitFormData>({
    resolver: zodResolver(fieldVisitSchema),
    defaultValues: {
      visit_date: visit?.visit_date || '',
      consultant: visit?.consultant || '',
      client_id: (visit as any)?.client_id || (visit as any)?.client || 'select',
      status: visit?.status || 'Scheduled',
      farm: visit?.farm || '',
      paddock: visit?.paddock || '',
      crop: visit?.crop || '',
      visit_reason: visit?.visit_reason || '',
      soil_ph: visit?.soil_ph || 0,
      soil_texture: visit?.soil_texture || '',
      plant_height: visit?.plant_height || 0,
      fruiting: visit?.fruiting || '',
      sap_ph: visit?.sap_ph || 0,
      sap_nitrate: visit?.sap_nitrate || 0,
      sap_calcium: visit?.sap_calcium || 0,
      sap_magnesium: visit?.sap_magnesium || 0,
      sap_potassium: visit?.sap_potassium || 0,
      sap_sodium: visit?.sap_sodium || 0,
      penetrometer: visit?.penetrometer || 0,
      soil_electroconductivity: visit?.soil_electroconductivity || 0,
      sap_electroconductivity: visit?.sap_electroconductivity || 0,
      chlorophyll_reading: visit?.chlorophyll_reading || 0,
      soil_paramagnetism: visit?.soil_paramagnetism || 0,
      in_field_observations: visit?.in_field_observations || '',
      general_comments: visit?.general_comments || '',
      address: visit?.address || '',
      image_urls: visit?.image_urls || [],
    },
  });

  // Initialize uploaded images when editing
  React.useEffect(() => {
    if (visit?.image_urls && visit.image_urls.length > 0) {
      setUploadedImages(visit.image_urls);
    }
  }, [visit]);

  // Reset form values when editing a visit
  React.useEffect(() => {
    if (visit) {
      form.reset({
        visit_date: visit.visit_date || '',
        consultant: visit.consultant || '',
        client_id: (visit as any).client_id || (visit as any).client || 'select',
        status: visit.status || 'Scheduled',
        farm: visit.farm || '',
        paddock: visit.paddock || '',
        crop: visit.crop || '',
        visit_reason: visit.visit_reason || '',
        soil_ph: visit.soil_ph ?? 0,
        soil_texture: visit.soil_texture || '',
        plant_height: visit.plant_height ?? 0,
        fruiting: visit.fruiting || '',
        sap_ph: visit.sap_ph ?? 0,
        sap_nitrate: visit.sap_nitrate ?? 0,
        sap_calcium: visit.sap_calcium ?? 0,
        sap_magnesium: visit.sap_magnesium ?? 0,
        sap_potassium: visit.sap_potassium ?? 0,
        sap_sodium: visit.sap_sodium ?? 0,
        penetrometer: visit.penetrometer ?? 0,
        soil_electroconductivity: visit.soil_electroconductivity ?? 0,
        sap_electroconductivity: visit.sap_electroconductivity ?? 0,
        chlorophyll_reading: visit.chlorophyll_reading ?? 0,
        soil_paramagnetism: visit.soil_paramagnetism ?? 0,
        in_field_observations: visit.in_field_observations || '',
        general_comments: visit.general_comments || '',
        address: visit.address || '',
        image_urls: visit.image_urls || [],
      });
    } else {
      // Optionally reset to blank for new
      form.reset(form.getValues());
    }
  }, [visit]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    
    setUploading(true);
    const newImages: string[] = [];
    
    for (const file of Array.from(e.target.files)) {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}.${fileExt}`;
      const filePath = `field-visits/${fileName}`;
      
      const { error } = await supabase.storage.from('field-visits').upload(filePath, file);
      if (error) {
        alert(`Image upload failed: ${error.message}`);
        continue;
      }
      
      const publicUrl = (supabase.storage.from('field-visits') as any).getPublicUrl(filePath)?.data?.publicUrl;
      if (publicUrl) {
        newImages.push(publicUrl);
      }
    }
    
    const updatedImages = [...uploadedImages, ...newImages];
    setUploadedImages(updatedImages);
    form.setValue('image_urls', updatedImages);
    setUploading(false);
  };

  const handleRemoveImage = (indexToRemove: number) => {
    const updatedImages = uploadedImages.filter((_, index) => index !== indexToRemove);
    setUploadedImages(updatedImages);
    form.setValue('image_urls', updatedImages);
  };

  const handleSubmit = (data: FieldVisitFormData) => {
    // List of fields that should be numbers
    const numberFields = [
      'soil_ph', 'plant_height', 'sap_ph', 'sap_nitrate', 'sap_calcium', 'sap_magnesium',
      'sap_potassium', 'sap_sodium', 'penetrometer', 'soil_electroconductivity',
      'sap_electroconductivity', 'chlorophyll_reading', 'soil_paramagnetism'
    ];
    const convertedData = { ...data };
    
    // Convert numeric fields and handle empty values
    numberFields.forEach(field => {
      const value = convertedData[field];
      if (value !== undefined && value !== null && value !== '') {
        const numValue = Number(value);
        convertedData[field] = isNaN(numValue) ? null : numValue;
      } else {
        convertedData[field] = null;
      }
    });

    // Ensure status is set
    if (!convertedData.status) {
      convertedData.status = 'Scheduled';
    }

    if (visit) {
      // Update existing visit
      onSubmit({
        ...convertedData,
        client: convertedData.client_id,
        id: visit.id,
        image_urls: uploadedImages,
        updated_at: new Date().toISOString(),
      } as UpdateFieldVisitData);
    } else {
      // Create new visit
      onSubmit({
        ...convertedData,
        client: convertedData.client_id,
        image_urls: uploadedImages,
      } as CreateFieldVisitData);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{visit ? 'Edit Field Visit' : 'Add New Field Visit'}</DialogTitle>
          <DialogDescription>
            {visit ? 'Update the field visit details below.' : 'Fill in the field visit details below. All measurements are optional.'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        {CONSULTANTS.map((c) => (
                          <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="client_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a client" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="select">Select a client</SelectItem>
                          {clients.map(c => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Scheduled">Scheduled</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="Cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="farm"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Farm</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select farm" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {FARM_OPTIONS.map((farm) => (
                          <SelectItem key={farm.id} value={farm.name}>{farm.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paddock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Paddock</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select paddock" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PADDOCK_OPTIONS.map((paddock) => (
                          <SelectItem key={paddock.id} value={paddock.name}>{paddock.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                          <SelectItem key={crop.id} value={crop.name}>{crop.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="visit_reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Visit Reason</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select reason" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Routine">Routine</SelectItem>
                        <SelectItem value="Emergency">Emergency</SelectItem>
                        <SelectItem value="Follow-up">Follow-up</SelectItem>
                        <SelectItem value="Initial">Initial</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="soil_ph"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Soil pH</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="soil_texture"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Soil Texture</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select soil texture" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Sand">Sand</SelectItem>
                        <SelectItem value="Loam">Loam</SelectItem>
                        <SelectItem value="Clay">Clay</SelectItem>
                        <SelectItem value="Silt">Silt</SelectItem>
                        <SelectItem value="Peat">Peat</SelectItem>
                        <SelectItem value="Chalk">Chalk</SelectItem>
                        <SelectItem value="Gravel">Gravel</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="plant_height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Plant Height (cm)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="fruiting"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Fruiting</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sap_ph"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sap pH</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sap_nitrate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sap Nitrate</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sap_calcium"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sap Calcium</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sap_magnesium"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sap Magnesium</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sap_potassium"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sap Potassium</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sap_sodium"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sap Sodium</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="penetrometer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Penetrometer (PSI)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="soil_electroconductivity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Soil Electroconductivity (mS/cm)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sap_electroconductivity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sap Electroconductivity (mS/cm)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="chlorophyll_reading"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Chlorophyll Reading (SPAD)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="soil_paramagnetism"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Soil Paramagnetism (μT)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="in_field_observations"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>In Field Observations</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="general_comments"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>General Comments</FormLabel>
                    <FormControl>
                      <Textarea {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="address"
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

              {/* Image Upload Section */}
              <div className="space-y-4">
                <div>
                  <Label htmlFor="image-upload">Field Visit Images</Label>
                  <div className="mt-2">
                    <input
                      id="image-upload"
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                      disabled={uploading}
                    />
                    <label
                      htmlFor="image-upload"
                      className="cursor-pointer inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      {uploading ? 'Uploading...' : 'Upload Images'}
                    </label>
                  </div>
                </div>

                {/* Display uploaded images */}
                {uploadedImages.length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {uploadedImages.map((imageUrl, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={imageUrl}
                          alt={`Field visit image ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(index)}
                          className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : (visit ? 'Update Visit' : 'Create Visit')}
                </Button>
              </div>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default FieldVisitFormDialog; 