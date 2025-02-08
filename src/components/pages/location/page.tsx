'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { ColumnDef } from "@tanstack/react-table";
import { DataTable } from "@/components/data-table";
import { ActionDropdown } from "@/components/ui/action-dropdown";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus } from 'lucide-react';
import { toast } from "sonner";

interface Location {
  id: number;
  name: string;
  description: string;
  latitude: number;
  longitude: number;
}

interface LocationPaginationResponse {
  data: {
    limit: number;
    page: number;
    data: Location[];
    totalPages: number;
    total: number;
  };
  status: boolean;
  error?: string;
}

interface LocationManagementProps {
  session: any;
}

export default function LocationManagement({ session }: LocationManagementProps) {
  const [limit, setLimit] = useState(10);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalRows, setTotalRows] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [Locations, setLocations] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<Partial<Location>>({});
  const [isEditing, setIsEditing] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [LocationToDelete, setLocationToDelete] = useState<Location | null>(null);
  const [nameFilter, setNameFilter] = useState('');

  const columns = useMemo<ColumnDef<Location>[]>(() => [
    {
      accessorKey: 'id',
      header: 'ID',
    },
    {
      accessorKey: 'name',
      header: 'Name',
    },
    {
        accessorKey: 'description',
        header: 'Description',
    },
    {
        accessorKey: 'latitude',
        header: 'Latitude',
    },
    {
        accessorKey: 'longitude',
        header: 'Longitude',
    },
    {
      id: 'actions',
      header: 'Actions',
      cell: ({ row }) => {
        const Location = row.original;

        const handleEdit = () => {
          setCurrentLocation(Location);
          setIsEditing(true);
          setIsDialogOpen(true);
        };

        const handleDeleteConfirmation = () => {
          setLocationToDelete(Location);
          setIsDeleteDialogOpen(true);
        };

        return (
          <ActionDropdown
            onEdit={handleEdit}
            onDelete={handleDeleteConfirmation}
          />
        );
      },
    }
  ], []);

  // Fetch Locations
  const fetchLocations = async (limit: number = 10, page: number = 1, nameFilter: string = '') => {
    try {
      setIsLoading(true);
      const queryParams = new URLSearchParams({
        limit: limit.toString(),
        page: page.toString(),
        ...(nameFilter && { name: nameFilter })
      });

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/active-locations/all?${queryParams}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`,
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch Locations');
      }

      const result: LocationPaginationResponse = await response.json();

      if (result.status && result.data) {
        setLocations(result.data.data);
        setTotalPages(result.data.totalPages);
        setTotalRows(result.data.total);
        setCurrentPage(result.data.page);
      } else {
        toast.error(result.error || "Failed to fetch Locations");
        setLocations([]);
        setTotalPages(0);
        setTotalRows(0);
        setCurrentPage(1);
      }
    } catch (error) {
      console.error('Error fetching Locations:', error);
      toast.error("Network error occurred");
      setLocations([]);
      setTotalPages(0);
      setTotalRows(0);
      setCurrentPage(1);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations(limit, page, nameFilter);
  }, [limit, page, nameFilter]);

  // Create or update Location
  const handleSaveLocation = async () => {
    try {
      if (!currentLocation.name?.trim()) {
        toast.error("Location name is required");
        return;
      }

      const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/active-locations${isEditing ? `/${currentLocation.id}` : ''}`;
      const method = isEditing ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`,
        },
        body: JSON.stringify({
          name: currentLocation.name?.trim() || '',
          latitude: currentLocation.latitude,
          longitude: currentLocation.longitude,
          description: currentLocation.description?.trim() || '',
          ...(isEditing && { id: currentLocation.id })
        })
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Operation failed: ${errorBody}`);
      }

      const result = await response.json();

      if (result.status) {
        toast.success(isEditing ? "Location updated successfully" : "Location created successfully");
        fetchLocations(limit, page, nameFilter);
        setIsDialogOpen(false);
        setCurrentLocation({});
        setIsEditing(false);
      } else {
        toast.error(result.error || "Operation failed");
      }
    } catch (error) {
      console.error('Error saving Location:', error);
      toast.error(error instanceof Error ? error.message : "Network error occurred");
    }
  };

  // Delete Location
  const handleDeleteLocation = async (id: string) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/active-locations/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.user.accessToken}`,
        }
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`Deletion failed: ${errorBody}`);
      }

      const result = await response.json();

      if (result.status) {
        toast.success("Location deleted successfully");
        fetchLocations(limit, page, nameFilter);
        setIsDeleteDialogOpen(false);
        setLocationToDelete(null);
      } else {
        toast.error(result.error || "Deletion failed");
      }
    } catch (error) {
      console.error('Error deleting Location:', error);
      toast.error(error instanceof Error ? error.message : "Network error occurred");
    }
  };

  // Open create dialog
  const openCreateDialog = () => {
    setCurrentLocation({});
    setIsEditing(false);
    setIsDialogOpen(true);
  };

  return (
    <div className="p-4 sm:p-8 space-y-4">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <h1 className="text-xl sm:text-2xl font-bold w-full text-center sm:text-left">Location Management</h1>
        <Button onClick={openCreateDialog} className="flex items-center gap-2">
          <Plus size={16} /> Create Location
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={Locations || []}
        pageSize={limit}
        currentPage={page}
        totalPages={totalPages}
        onPageSizeChange={setLimit}
        onPageChange={setPage}
      />

      <Dialog
        open={isDialogOpen}
        onOpenChange={(open) => {
          setIsDialogOpen(open);
          if (!open) {
            setCurrentLocation({});
            setIsEditing(false);
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {isEditing ? 'Edit Location' : 'Create Location'}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={currentLocation.name || ''}
                onChange={(e) =>
                  setCurrentLocation(prev => ({ ...prev, name: e.target.value }))
                }
                className="col-span-3"
                placeholder="Enter Location name"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Description
              </Label>
              <Input
                id="description"
                value={currentLocation.description || ''}
                onChange={(e) =>
                  setCurrentLocation(prev => ({ ...prev, description: e.target.value }))
                }
                className="col-span-3"
                placeholder="Enter Location description"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Latitude
              </Label>
              <Input
                id="latitude"
                value={currentLocation.latitude || ''}
                onChange={(e) =>
                  setCurrentLocation(prev => ({ ...prev, latitude: parseFloat(e.target.value) }))
                }
                className="col-span-3"
                placeholder="Enter Location latitude"
                type='number'
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Longitude
              </Label>
              <Input
                id="longitude"
                value={currentLocation.longitude || ''}
                onChange={(e) =>
                  setCurrentLocation(prev => ({ ...prev, longitude: parseFloat(e.target.value) }))
                }
                className="col-span-3"
                placeholder="Enter Location longitude"
                type='number'
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveLocation}
              disabled={!currentLocation.name}
            >
              Save
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              Are you sure?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the Location.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => LocationToDelete && handleDeleteLocation(LocationToDelete.id.toString())}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <div className="mt-4 text-sm text-muted-foreground text-center">
        Page {currentPage} of {totalPages} • Total Rows: {totalRows}
      </div>
    </div>
  );
}
