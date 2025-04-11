import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useLocation } from "wouter";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Pencil,
  Trash2,
  Loader2,
  FileText,
  PlusCircle,
  Clock,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";

type PropertyDraft = {
  id: number;
  userId: number;
  name: string;
  formData: any;
  createdAt: string;
  updatedAt: string;
};

export default function PropertyDrafts() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [, navigate] = useLocation();
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState<boolean>(false);
  const [draftToDelete, setDraftToDelete] = useState<PropertyDraft | null>(null);

  // Fetch user's property drafts
  const { data: drafts, isLoading } = useQuery<PropertyDraft[]>({
    queryKey: ["/api/property-drafts"],
    enabled: !!user,
  });

  // Delete draft mutation
  const deleteDraftMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/property-drafts/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Draft deleted",
        description: "Your property draft has been deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/property-drafts"] });
      setIsDeleteConfirmOpen(false);
      setDraftToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error deleting draft",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Open delete confirmation dialog
  const handleDeleteClick = (draft: PropertyDraft) => {
    setDraftToDelete(draft);
    setIsDeleteConfirmOpen(true);
  };

  // Confirm draft deletion
  const confirmDelete = () => {
    if (draftToDelete) {
      deleteDraftMutation.mutate(draftToDelete.id);
    }
  };

  // Continue editing a draft
  const handleEditDraft = (draft: PropertyDraft) => {
    navigate(`/add-property?draft=${draft.id}`);
  };

  // Create a new property
  const handleAddProperty = () => {
    navigate('/add-property');
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'MMM d, yyyy • h:mm a');
    } catch (e) {
      return dateString;
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-primary-800">Property Drafts</h1>
          <p className="text-primary-600">Manage your saved property drafts</p>
        </div>
        
        <Button onClick={handleAddProperty} className="bg-secondary-500 hover:bg-secondary-600">
          <PlusCircle className="h-4 w-4 mr-2" />
          Add New Property
        </Button>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-secondary-500" />
        </div>
      ) : (
        <div>
          {drafts && drafts.length > 0 ? (
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Draft Name</TableHead>
                    <TableHead>Last Updated</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {drafts.map((draft) => (
                    <TableRow key={draft.id}>
                      <TableCell className="font-medium flex items-center">
                        <FileText className="h-5 w-5 mr-2 text-primary-500" />
                        <span>{draft.name}</span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Clock className="h-3 w-3 mr-1" />
                          {formatDate(draft.updatedAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center text-sm text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(draft.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditDraft(draft)}
                          className="mr-1"
                        >
                          <Pencil className="h-4 w-4 mr-1" />
                          Continue
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(draft)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <Card className="text-center py-12">
              <CardContent>
                <div className="mb-4 text-primary-400">
                  <FileText className="h-12 w-12 mx-auto" />
                </div>
                <h3 className="text-xl font-medium text-primary-800 mb-2">No property drafts yet</h3>
                <p className="text-primary-600 mb-6">
                  When adding a property, you can save your progress to continue later
                </p>
                <Button onClick={handleAddProperty} className="bg-secondary-500 hover:bg-secondary-600">
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add a Property
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the draft "{draftToDelete?.name}"? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsDeleteConfirmOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={confirmDelete}
              disabled={deleteDraftMutation.isPending}
            >
              {deleteDraftMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>Delete</>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}