import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getClients, createClient, updateClient, deleteClient } from '@/lib/clientsApi';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { RefreshCw, AlertCircle, ChevronsUpDown, ArrowUp, ArrowDown, PlusCircle, Trash2, Edit, Eye, Users, Plus, Search, Filter, Mail, Phone, MapPin } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Client, CreateClientData, UpdateClientData } from '@/lib/types';
import { format } from 'date-fns';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { Tooltip as UITooltip } from '@/components/ui/tooltip';
import KpiCard from '@/components/metrics/KpiCard';

// Sorting types
type SortDirection = 'asc' | 'desc';
type SortableClientKey = keyof Client;
interface SortConfig {
  key: SortableClientKey;
  direction: SortDirection;
}

function isValidDateString(date: any): boolean {
    return typeof date === 'string' && !isNaN(new Date(date).getTime());
}

const ClientsPage: React.FC = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [addClientDialogOpen, setAddClientDialogOpen] = useState(false);
    const [viewingClient, setViewingClient] = useState<Client | null>(null);
    const [editClient, setEditClient] = useState<Client | null>(null);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: 'name', direction: 'asc' });

    const queryClient = useQueryClient();

    // Fetch clients
    const { data: clients = [], isLoading, error } = useQuery({
        queryKey: ['clients'],
        queryFn: getClients,
    });

    // Create client mutation
    const createClientMutation = useMutation({
        mutationFn: createClient,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            setAddClientDialogOpen(false);
            toast({
                title: 'Success',
                description: 'Client created successfully.',
            });
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    // Update client mutation
    const updateClientMutation = useMutation({
        mutationFn: updateClient,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            setEditClient(null);
            toast({
                title: 'Success',
                description: 'Client updated successfully.',
            });
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    // Delete client mutation
    const deleteClientMutation = useMutation({
        mutationFn: deleteClient,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clients'] });
            toast({
                title: 'Success',
                description: 'Client deleted successfully.',
            });
        },
        onError: (error) => {
            toast({
                title: 'Error',
                description: error.message,
                variant: 'destructive',
            });
        },
    });

    const handleViewClient = (client: Client) => {
        setViewingClient(client);
    };

    const handleEditClient = (client: Client) => {
        setEditClient(client);
    };

    const handleDeleteClient = (client: Client) => {
        if (confirm(`Are you sure you want to delete client "${client.name}"?`)) {
            deleteClientMutation.mutate(client.id);
        }
    };

    const handleSort = (key: keyof Client) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    // Filter and sort clients
    const displayedClients = useMemo(() => {
        let filtered = clients.filter(client => {
            const matchesSearch = searchTerm === '' || 
                client.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                client.address?.toLowerCase().includes(searchTerm.toLowerCase());

            return matchesSearch;
        });

        // Sort
        filtered.sort((a, b) => {
            const aValue = a[sortConfig.key];
            const bValue = b[sortConfig.key];

            if (aValue === null || aValue === undefined) return 1;
            if (bValue === null || bValue === undefined) return -1;

            let comparison = 0;
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                // If sorting by a date field, compare as dates
                if (sortConfig.key === 'created_at' || sortConfig.key === 'updated_at') {
                    if (isValidDateString(aValue) && isValidDateString(bValue)) {
                        comparison = new Date(aValue).getTime() - new Date(bValue).getTime();
                    } else {
                        comparison = aValue.localeCompare(bValue);
                    }
                } else {
                    comparison = aValue.localeCompare(bValue);
                }
            } else if (typeof aValue === 'number' && typeof bValue === 'number') {
                comparison = aValue - bValue;
            }

            return sortConfig.direction === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }, [clients, searchTerm, sortConfig]);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg">Loading clients...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="text-lg text-red-600">Error loading clients: {error.message}</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Client Management</h1>
                    <p className="text-muted-foreground">
                        Manage client information and contact details.
                    </p>
                </div>
                <Button onClick={() => setAddClientDialogOpen(true)} className="bg-primary hover:bg-primary/90">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Client
                </Button>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-6">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                            <Input
                                placeholder="Search by name, email, phone, or address..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <KpiCard
                    title="Total Clients"
                    value={clients.length}
                    description="All clients"
                    icon={<Users className="h-4 w-4" />}
                />
                <KpiCard
                    title="Active Clients"
                    value={clients.filter(c => c.email || c.phone).length}
                    description="With contact info"
                    icon={<Mail className="h-4 w-4" />}
                />
                <KpiCard
                    title="Recent Clients"
                    value={clients.filter(c => {
                        const createdDate = new Date(c.created_at);
                        const thirtyDaysAgo = new Date();
                        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
                        return createdDate > thirtyDaysAgo;
                    }).length}
                    description="Added last 30 days"
                    icon={<Plus className="h-4 w-4" />}
                />
            </div>

            {/* Clients Table */}
            <Card>
                <CardHeader>
                    <CardTitle>Clients</CardTitle>
                    <CardDescription>
                        {displayedClients.length} of {clients.length} clients
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b">
                                    <th className="text-left p-2 font-medium cursor-pointer" onClick={() => handleSort('name')}>
                                        <div className="flex items-center gap-1">
                                            Name
                                            {sortConfig.key === 'name' && (
                                                sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                                            )}
                                        </div>
                                    </th>
                                    <th className="text-left p-2 font-medium">Email</th>
                                    <th className="text-left p-2 font-medium">Phone</th>
                                    <th className="text-left p-2 font-medium">Address</th>
                                    <th className="text-left p-2 font-medium cursor-pointer" onClick={() => handleSort('created_at')}>
                                        <div className="flex items-center gap-1">
                                            Created
                                            {sortConfig.key === 'created_at' && (
                                                sortConfig.direction === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />
                                            )}
                                        </div>
                                    </th>
                                    <th className="text-left p-2 font-medium">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {displayedClients.map((client) => (
                                    <tr key={client.id} className="border-b hover:bg-muted/50">
                                        <td className="p-2 font-medium">{client.name}</td>
                                        <td className="p-2">{client.email || '—'}</td>
                                        <td className="p-2">{client.phone || '—'}</td>
                                        <td className="p-2">{client.address || '—'}</td>
                                        <td className="p-2 text-sm text-muted-foreground">
                                            {client.created_at && !isNaN(new Date(client.created_at).getTime())
                                                ? format(new Date(client.created_at), "MMM dd, yyyy")
                                                : '—'}
                                        </td>
                                        <td className="p-2">
                                            <div className="flex items-center gap-2">
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleViewClient(client)}
                                                >
                                                    <Eye className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleEditClient(client)}
                                                >
                                                    <Edit className="h-4 w-4" />
                                                </Button>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleDeleteClient(client)}
                                                    className="text-red-600 hover:text-red-700"
                                                >
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>

            {/* Add Client Dialog */}
            <Dialog open={addClientDialogOpen} onOpenChange={setAddClientDialogOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Add New Client</DialogTitle>
                    </DialogHeader>
                    <ClientForm
                        onSubmit={(data) => createClientMutation.mutate(data)}
                        onCancel={() => setAddClientDialogOpen(false)}
                        isLoading={createClientMutation.isPending}
                    />
                </DialogContent>
            </Dialog>

            {/* Edit Client Dialog */}
            <Dialog open={!!editClient} onOpenChange={() => setEditClient(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Edit Client</DialogTitle>
                    </DialogHeader>
                    {editClient && (
                        <ClientForm
                            client={editClient}
                            onSubmit={(data) => updateClientMutation.mutate({ ...data, id: editClient.id })}
                            onCancel={() => setEditClient(null)}
                            isLoading={updateClientMutation.isPending}
                        />
                    )}
                </DialogContent>
            </Dialog>

            {/* View Client Dialog */}
            <Dialog open={!!viewingClient} onOpenChange={() => setViewingClient(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Client Details</DialogTitle>
                    </DialogHeader>
                    {viewingClient && (
                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium">Name</label>
                                <p className="text-lg">{viewingClient.name}</p>
                            </div>
                            {viewingClient.email && (
                                <div>
                                    <label className="text-sm font-medium">Email</label>
                                    <p className="text-lg">{viewingClient.email}</p>
                                </div>
                            )}
                            {viewingClient.phone && (
                                <div>
                                    <label className="text-sm font-medium">Phone</label>
                                    <p className="text-lg">{viewingClient.phone}</p>
                                </div>
                            )}
                            {viewingClient.address && (
                                <div>
                                    <label className="text-sm font-medium">Address</label>
                                    <p className="text-lg">{viewingClient.address}</p>
                                </div>
                            )}
                            <div>
                                <label className="text-sm font-medium">Created</label>
                                <p className="text-lg">{viewingClient.created_at && !isNaN(new Date(viewingClient.created_at).getTime()) ? format(new Date(viewingClient.created_at), "PPP") : '—'}</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium">Last Updated</label>
                                <p className="text-lg">{viewingClient.updated_at && !isNaN(new Date(viewingClient.updated_at).getTime()) ? format(new Date(viewingClient.updated_at), "PPP") : '—'}</p>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

// Client Form Component
interface ClientFormProps {
    client?: Client;
    onSubmit: (data: CreateClientData) => void;
    onCancel: () => void;
    isLoading?: boolean;
}

const ClientForm: React.FC<ClientFormProps> = ({ client, onSubmit, onCancel, isLoading }) => {
    const [formData, setFormData] = useState({
        name: client?.name || '',
        email: client?.email || '',
        phone: client?.phone || '',
        address: client?.address || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            toast({
                title: 'Error',
                description: 'Client name is required.',
                variant: 'destructive',
            });
            return;
        }
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="text-sm font-medium">Name *</label>
                <Input
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter client name"
                    required
                />
            </div>
            <div>
                <label className="text-sm font-medium">Email</label>
                <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="Enter email address"
                />
            </div>
            <div>
                <label className="text-sm font-medium">Phone</label>
                <Input
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    placeholder="Enter phone number"
                />
            </div>
            <div>
                <label className="text-sm font-medium">Address</label>
                <Input
                    value={formData.address}
                    onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Enter address"
                />
            </div>
            <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? 'Saving...' : client ? 'Update Client' : 'Add Client'}
                </Button>
            </div>
        </form>
    );
};

export default ClientsPage; 