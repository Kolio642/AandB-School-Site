'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Trash2, Search, RefreshCcw, ArrowUpDown, Mail, CheckCircle, XCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  created_at: string;
  responded: boolean;
}

type StatusFilter = 'all' | 'responded' | 'pending';
type SortField = 'name' | 'email' | 'created_at';
type SortOrder = 'asc' | 'desc';

export default function ContactsManagementPage() {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortField, setSortField] = useState<SortField>('created_at');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
  // Multi-select functionality
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, []);
  
  // Clear selections when filters change
  useEffect(() => {
    setSelectedItems([]);
  }, [searchQuery, statusFilter]);

  async function fetchMessages() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('contact_messages')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMessages(data || []);
    } catch (error) {
      console.error('Error fetching contact messages:', error);
      toast({
        title: "Error",
        description: "Failed to load contact messages",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this message?')) return;

    try {
      setIsProcessing(true);
      
      // Delete from database
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setMessages(messages.filter(item => item.id !== id));
      
      toast({
        title: "Success",
        description: "Message deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting message:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete message",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  }

  async function toggleRespondedStatus(id: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from('contact_messages')
        .update({ responded: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setMessages(messages.map(item => 
        item.id === id ? {...item, responded: !currentStatus} : item
      ));
      
      toast({
        title: "Success",
        description: `Message marked as ${!currentStatus ? 'responded' : 'pending'}`,
      });
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update status",
        variant: "destructive",
      });
    }
  }

  // Bulk delete handler
  async function handleBulkDelete() {
    if (selectedItems.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedItems.length} message(s)?`)) return;

    try {
      setIsBulkProcessing(true);
      
      // Delete all selected items
      const { error } = await supabase
        .from('contact_messages')
        .delete()
        .in('id', selectedItems);
        
      if (error) throw error;
      
      // Update local state
      setMessages(messages.filter(item => !selectedItems.includes(item.id)));
      
      // Clear selection
      setSelectedItems([]);
      
      toast({
        title: "Success",
        description: `${selectedItems.length} messages deleted successfully`,
      });
    } catch (error: any) {
      console.error('Error in bulk delete:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete messages",
        variant: "destructive",
      });
    } finally {
      setIsBulkProcessing(false);
    }
  }

  // Bulk mark as responded/pending
  async function handleBulkMarkStatus(responded: boolean) {
    if (selectedItems.length === 0) return;

    try {
      setIsBulkProcessing(true);
      
      // Update all selected items
      const { error } = await supabase
        .from('contact_messages')
        .update({ responded })
        .in('id', selectedItems);
        
      if (error) throw error;
      
      // Update local state
      setMessages(messages.map(item => 
        selectedItems.includes(item.id) ? {...item, responded} : item
      ));
      
      toast({
        title: "Success",
        description: `${selectedItems.length} messages marked as ${responded ? 'responded' : 'pending'}`,
      });
      
      // Clear selection
      setSelectedItems([]);
    } catch (error: any) {
      console.error(`Error in bulk mark as ${responded ? 'responded' : 'pending'}:`, error);
      toast({
        title: "Error",
        description: error.message || `Failed to mark messages as ${responded ? 'responded' : 'pending'}`,
        variant: "destructive",
      });
    } finally {
      setIsBulkProcessing(false);
    }
  }

  // Handler for selecting all items
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(filteredAndSortedMessages.map(item => item.id));
    } else {
      setSelectedItems([]);
    }
  };

  // Handler for selecting a single item
  const handleSelectItem = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedItems([...selectedItems, id]);
    } else {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    }
  };

  // Apply all filters and sorting
  const filteredAndSortedMessages = messages
    // First apply status filter
    .filter(item => {
      if (statusFilter === 'all') return true;
      return statusFilter === 'responded' ? item.responded : !item.responded;
    })
    // Then apply search query
    .filter(item => {
      if (searchQuery.trim() === '') return true;
      return (
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.message.toLowerCase().includes(searchQuery.toLowerCase())
      );
    })
    // Finally sort the results
    .sort((a, b) => {
      // Handle different sort fields
      let valueA: any;
      let valueB: any;

      if (sortField === 'name') {
        valueA = a.name;
        valueB = b.name;
      } else if (sortField === 'email') {
        valueA = a.email;
        valueB = b.email;
      } else {
        // Default to created_at
        valueA = new Date(a.created_at).getTime();
        valueB = new Date(b.created_at).getTime();
      }

      // Apply sort order
      if (sortOrder === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

  // Check if all visible items are selected
  const areAllSelected = filteredAndSortedMessages.length > 0 && 
    filteredAndSortedMessages.every(item => selectedItems.includes(item.id));

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Toggle sort order or change sort field
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Toggle sort order if the same field is clicked
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Change sort field and reset to appropriate order
      setSortField(field);
      setSortOrder(field === 'created_at' ? 'desc' : 'asc');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Contact Messages</h1>
          <p className="text-muted-foreground">Manage contact form submissions</p>
        </div>
      </div>

      {/* Bulk actions bar - shown when items are selected */}
      {selectedItems.length > 0 && (
        <Card className="bg-muted/50">
          <CardContent className="py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="font-medium">{selectedItems.length} items selected</span>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setSelectedItems([])}
                className="h-8"
              >
                Clear
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkMarkStatus(true)}
                disabled={isBulkProcessing}
                className="h-8"
              >
                Mark Responded
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkMarkStatus(false)}
                disabled={isBulkProcessing}
                className="h-8"
              >
                Mark Pending
              </Button>
              <Button
                variant="destructive"
                size="sm"
                onClick={handleBulkDelete}
                disabled={isBulkProcessing}
                className="h-8"
              >
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
            <CardTitle>Contact Messages</CardTitle>
            <div className="flex flex-col space-y-3 md:flex-row md:items-center md:space-x-2 md:space-y-0">
              {/* Status filter dropdown */}
              <Select
                value={statusFilter}
                onValueChange={(value) => setStatusFilter(value as StatusFilter)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="responded">Responded</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>

              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search messages..."
                  className="pl-8 w-full md:w-[200px]"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>

              {/* Sort dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="ml-auto h-8 flex items-center gap-1">
                    <ArrowUpDown className="h-3.5 w-3.5" />
                    <span>Sort</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-[180px]">
                  <DropdownMenuLabel>Sort by</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuCheckboxItem 
                    checked={sortField === 'name'} 
                    onCheckedChange={() => handleSort('name')}
                  >
                    Name {sortField === 'name' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem 
                    checked={sortField === 'email'}
                    onCheckedChange={() => handleSort('email')}
                  >
                    Email {sortField === 'email' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem 
                    checked={sortField === 'created_at'}
                    onCheckedChange={() => handleSort('created_at')}
                  >
                    Date {sortField === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Button 
                variant="outline" 
                size="icon" 
                onClick={fetchMessages}
                disabled={isLoading}
                className="h-8 w-8"
              >
                <RefreshCcw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                <span className="sr-only">Refresh</span>
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-full flex items-center space-x-4">
                  <Skeleton className="h-4 w-4 rounded-sm" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                  <Skeleton className="h-8 w-24 rounded-md" />
                </div>
              ))}
            </div>
          ) : (
            filteredAndSortedMessages.length > 0 ? (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-10">
                        <Checkbox 
                          checked={areAllSelected}
                          onCheckedChange={(checked: boolean) => handleSelectAll(checked)}
                          aria-label="Select all"
                        />
                      </TableHead>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedMessages.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Checkbox 
                            checked={selectedItems.includes(item.id)}
                            onCheckedChange={(checked: boolean) => handleSelectItem(item.id, checked)}
                            aria-label={`Select message from ${item.name}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium truncate max-w-[100px]">{item.name}</div>
                        </TableCell>
                        <TableCell>
                          <div className="truncate max-w-[150px]">
                            <a 
                              href={`mailto:${item.email}`} 
                              className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <Mail className="h-3 w-3" />
                              {item.email}
                            </a>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="truncate max-w-[200px]">{item.message}</div>
                        </TableCell>
                        <TableCell>{formatDate(item.created_at)}</TableCell>
                        <TableCell>
                          <Badge 
                            variant={item.responded ? "success" : "secondary"}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => toggleRespondedStatus(item.id, item.responded)}
                          >
                            {item.responded ? 'Responded' : 'Pending'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                Actions
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => toggleRespondedStatus(item.id, item.responded)}>
                                {item.responded ? (
                                  <>
                                    <XCircle className="h-4 w-4 mr-2" />
                                    Mark as Pending
                                  </>
                                ) : (
                                  <>
                                    <CheckCircle className="h-4 w-4 mr-2" />
                                    Mark as Responded
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <a href={`mailto:${item.email}`} target="_blank" rel="noopener noreferrer">
                                  <Mail className="h-4 w-4 mr-2" />
                                  Send Email
                                </a>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDelete(item.id)}
                                disabled={isProcessing}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-muted-foreground">No contact messages found with current filters.</p>
                {(statusFilter !== 'all' || searchQuery) ? (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setStatusFilter('all');
                      setSearchQuery('');
                    }}
                  >
                    Clear Filters
                  </Button>
                ) : null}
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
} 