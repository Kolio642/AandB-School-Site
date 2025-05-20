'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { PlusCircle, Pencil, Trash2, Search, RefreshCcw, ArrowUpDown } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
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
import { deleteImage } from '@/lib/storage-helpers';

interface Achievement {
  id: string;
  title_en: string;
  title_bg: string;
  description_en: string;
  description_bg: string;
  date: string;
  student_name: string | null;
  category: string;
  image: string | null;
  published: boolean;
  created_at: string;
  updated_at: string;
}

// Categories for achievements
const ACHIEVEMENT_CATEGORIES = [
  'academic',
  'sports',
  'arts',
  'science',
  'math',
  'language',
  'community'
];

type PublishFilter = 'all' | 'published' | 'unpublished';
type SortField = 'title' | 'date' | 'category' | 'created_at';
type SortOrder = 'asc' | 'desc';

export default function AchievementsPage() {
  const router = useRouter();
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [publishFilter, setPublishFilter] = useState<PublishFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortOrder, setSortOrder] = useState<SortOrder>('desc');
  
  // Added for multi-select functionality
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [isBulkProcessing, setIsBulkProcessing] = useState(false);

  useEffect(() => {
    fetchAchievements();
  }, []);
  
  // Clear selections when filters change
  useEffect(() => {
    setSelectedItems([]);
  }, [searchQuery, publishFilter, categoryFilter]);

  async function fetchAchievements() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAchievements(data || []);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast({
        title: "Error",
        description: "Failed to load achievements",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this achievement?')) return;

    try {
      setIsDeleting(true);
      
      // Find the achievement
      const achievement = achievements.find(item => item.id === id);
      if (!achievement) throw new Error('Achievement not found');
      
      // Delete the image from storage if exists
      if (achievement.image) {
        const deleted = await deleteImage(achievement.image);
        if (deleted) {
          console.log('Successfully deleted image for achievement:', id);
        } else {
          console.warn('Failed to delete image for achievement:', id);
          // Continue with deletion anyway
        }
      }
      
      // Delete the achievement from the database
      const { error } = await supabase
        .from('achievements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setAchievements(achievements.filter(item => item.id !== id));
      
      toast({
        title: "Success",
        description: "Achievement deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting achievement:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete achievement",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  async function togglePublishStatus(id: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from('achievements')
        .update({ published: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setAchievements(achievements.map(item => 
        item.id === id ? {...item, published: !currentStatus} : item
      ));
      
      toast({
        title: "Success",
        description: `Achievement ${!currentStatus ? 'published' : 'unpublished'} successfully`,
      });
    } catch (error: any) {
      console.error('Error updating publish status:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update publish status",
        variant: "destructive",
      });
    }
  }

  // New function for handling bulk delete
  async function handleBulkDelete() {
    if (selectedItems.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedItems.length} achievement(s)?`)) return;

    try {
      setIsBulkProcessing(true);
      
      // Process each selected item
      const errors = [];
      for (const id of selectedItems) {
        // Find the achievement
        const achievement = achievements.find(item => item.id === id);
        if (!achievement) {
          errors.push(`Item with ID ${id} not found`);
          continue;
        }
        
        // Delete the image from storage if exists
        if (achievement.image) {
          const deleted = await deleteImage(achievement.image);
          if (!deleted) {
            console.warn('Failed to delete image for achievement:', id);
          }
        }
        
        // Delete from database
        const { error } = await supabase
          .from('achievements')
          .delete()
          .eq('id', id);
          
        if (error) {
          errors.push(`Error deleting item ${id}: ${error.message}`);
        }
      }
      
      // Update local state - remove deleted items
      if (errors.length < selectedItems.length) {
        setAchievements(achievements.filter(item => !selectedItems.includes(item.id)));
        // Clear selection
        setSelectedItems([]);
        
        toast({
          title: "Success",
          description: `${selectedItems.length - errors.length} achievements deleted successfully`,
        });
      }
      
      // Show errors if any
      if (errors.length > 0) {
        console.error('Errors during bulk delete:', errors);
        toast({
          title: "Partial Success",
          description: `${errors.length} items failed to delete`,
          variant: "destructive",
        });
      }
    } catch (error: any) {
      console.error('Error in bulk delete:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete achievements",
        variant: "destructive",
      });
    } finally {
      setIsBulkProcessing(false);
    }
  }

  // New function for bulk publish/unpublish
  async function handleBulkPublish(publish: boolean) {
    if (selectedItems.length === 0) return;

    try {
      setIsBulkProcessing(true);
      
      // Update all selected items
      const { error } = await supabase
        .from('achievements')
        .update({ published: publish })
        .in('id', selectedItems);
        
      if (error) throw error;
      
      // Update local state
      setAchievements(achievements.map(item => 
        selectedItems.includes(item.id) ? {...item, published: publish} : item
      ));
      
      toast({
        title: "Success",
        description: `${selectedItems.length} achievements ${publish ? 'published' : 'unpublished'} successfully`,
      });
      
      // Clear selection
      setSelectedItems([]);
    } catch (error: any) {
      console.error(`Error in bulk ${publish ? 'publish' : 'unpublish'}:`, error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${publish ? 'publish' : 'unpublish'} achievements`,
        variant: "destructive",
      });
    } finally {
      setIsBulkProcessing(false);
    }
  }

  // Apply all filters and sorting
  const filteredAndSortedAchievements = achievements
    // First apply publish filter
    .filter(item => {
      if (publishFilter === 'all') return true;
      return publishFilter === 'published' ? item.published : !item.published;
    })
    // Then apply category filter
    .filter(item => {
      if (!categoryFilter || categoryFilter === 'all') return true;
      return item.category === categoryFilter;
    })
    // Then apply search query
    .filter(item => {
      if (searchQuery.trim() === '') return true;
      return (
        item.title_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.title_bg?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description_bg?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.student_name?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    })
    // Finally sort the results
    .sort((a, b) => {
      // Handle different sort fields
      let valueA: any;
      let valueB: any;

      if (sortField === 'title') {
        valueA = a.title_en || a.title_bg || '';
        valueB = b.title_en || b.title_bg || '';
      } else if (sortField === 'date') {
        valueA = new Date(a.date).getTime();
        valueB = new Date(b.date).getTime();
      } else if (sortField === 'category') {
        valueA = a.category;
        valueB = b.category;
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

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Toggle sort order or change sort field
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Toggle sort order if the same field is clicked
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Change sort field and reset to appropriate order (desc for dates, asc for titles)
      setSortField(field);
      setSortOrder(field === 'title' ? 'asc' : 'desc');
    }
  };

  // Capitalize first letter
  const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Handler for selecting all items
  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedItems(filteredAndSortedAchievements.map(item => item.id));
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

  // Check if all visible items are selected
  const areAllSelected = filteredAndSortedAchievements.length > 0 && 
    filteredAndSortedAchievements.every(item => selectedItems.includes(item.id));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Achievements</h1>
          <p className="text-muted-foreground">Manage school achievements and awards</p>
        </div>
        <Button asChild>
          <Link href="/admin/achievements/new" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>Add Achievement</span>
          </Link>
        </Button>
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
                onClick={() => handleBulkPublish(true)}
                disabled={isBulkProcessing}
                className="h-8"
              >
                Publish
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBulkPublish(false)}
                disabled={isBulkProcessing}
                className="h-8"
              >
                Unpublish
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
            <CardTitle>All Achievements</CardTitle>
            <div className="flex flex-col space-y-3 md:flex-row md:items-center md:space-x-2 md:space-y-0">
              {/* Publish filter dropdown */}
              <Select
                value={publishFilter}
                onValueChange={(value) => setPublishFilter(value as PublishFilter)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="published">Published</SelectItem>
                  <SelectItem value="unpublished">Unpublished</SelectItem>
                </SelectContent>
              </Select>

              {/* Category filter dropdown */}
              <Select
                value={categoryFilter}
                onValueChange={(value) => setCategoryFilter(value)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {ACHIEVEMENT_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>
                      {capitalize(category)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Search input */}
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search achievements..."
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
                    checked={sortField === 'title'} 
                    onCheckedChange={() => handleSort('title')}
                  >
                    Title {sortField === 'title' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem 
                    checked={sortField === 'date'}
                    onCheckedChange={() => handleSort('date')}
                  >
                    Event Date {sortField === 'date' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem 
                    checked={sortField === 'category'}
                    onCheckedChange={() => handleSort('category')}
                  >
                    Category {sortField === 'category' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem 
                    checked={sortField === 'created_at'}
                    onCheckedChange={() => handleSort('created_at')}
                  >
                    Created Date {sortField === 'created_at' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </DropdownMenuCheckboxItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Refresh button */}
              <Button 
                variant="outline" 
                size="icon" 
                onClick={fetchAchievements}
                disabled={isLoading}
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
                  <Skeleton className="h-12 w-12 rounded-md" />
                  <div className="space-y-2 flex-1">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                  <Skeleton className="h-8 w-24 rounded-md" />
                </div>
              ))}
            </div>
          ) : (
            filteredAndSortedAchievements.length > 0 ? (
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
                      <TableHead>Title</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedAchievements.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Checkbox 
                            checked={selectedItems.includes(item.id)}
                            onCheckedChange={(checked: boolean) => handleSelectItem(item.id, checked)}
                            aria-label={`Select ${item.title_en || item.title_bg}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium truncate max-w-[300px]">
                            {item.title_en || item.title_bg}
                          </div>
                          {item.student_name && (
                            <div className="text-sm text-muted-foreground">
                              Student: {item.student_name}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(item.date)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {capitalize(item.category)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={item.published ? "success" : "secondary"}
                            className="cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => togglePublishStatus(item.id, item.published)}
                          >
                            {item.published ? 'Published' : 'Draft'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="icon">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-more-vertical">
                                  <circle cx="12" cy="12" r="1" />
                                  <circle cx="12" cy="5" r="1" />
                                  <circle cx="12" cy="19" r="1" />
                                </svg>
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => togglePublishStatus(item.id, item.published)}>
                                {item.published ? 'Unpublish' : 'Publish'}
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/achievements/${item.id}/edit`}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit Achievement
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDelete(item.id)}
                                disabled={isDeleting}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Achievement
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
                <p className="text-muted-foreground">No achievements found with current filters.</p>
                {(publishFilter !== 'all' || categoryFilter || searchQuery) ? (
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => {
                      setPublishFilter('all');
                      setCategoryFilter('all');
                      setSearchQuery('');
                    }}
                  >
                    Clear Filters
                  </Button>
                ) : (
                  <Button asChild className="mt-4">
                    <Link href="/admin/achievements/new">Add Achievement</Link>
                  </Button>
                )}
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
} 