'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, Pencil, Trash2, Search, EyeIcon, RefreshCcw, Check, MoreHorizontal, X, FilterIcon } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { toast } from '@/components/ui/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Checkbox } from '@/components/ui/checkbox';
import { deleteImage } from '@/lib/storage-helpers';

interface AchievementItem {
  id: string;
  title_en: string;
  title_bg: string;
  description_en: string;
  description_bg: string;
  date: string;
  image?: string;
  student_name?: string;
  category: string;
  published: boolean;
  created_at: string;
  updated_at: string;
}

type SearchCategory = 'all' | 'title' | 'description' | 'student' | 'category';
type PublishStatus = 'all' | 'published' | 'draft';

export default function AchievementsManagementPage() {
  const [achievements, setAchievements] = useState<AchievementItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState<SearchCategory>('all');
  const [publishFilter, setPublishFilter] = useState<PublishStatus>('all');
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedAchievements, setSelectedAchievements] = useState<string[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);

  useEffect(() => {
    fetchAchievements();
  }, []);

  // Handle "select all" checkbox
  useEffect(() => {
    if (filteredAchievements.length > 0 && selectedAchievements.length === filteredAchievements.length) {
      setIsAllSelected(true);
    } else {
      setIsAllSelected(false);
    }
  }, [selectedAchievements, achievements, searchQuery, publishFilter]);

  async function fetchAchievements() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAchievements(data || []);
      setSelectedAchievements([]);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      toast({
        title: "Error",
        description: "Failed to load achievement items",
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
      
      // Find the achievement item
      const achievementItem = achievements.find(item => item.id === id);
      if (!achievementItem) throw new Error('Achievement item not found');
      
      // Delete the image from storage if exists
      if (achievementItem.image) {
        const deleted = await deleteImage(achievementItem.image);
        if (deleted) {
          console.log('Successfully deleted image for achievement item:', id);
        } else {
          console.warn('Failed to delete image for achievement item:', id);
          // Continue with deletion anyway
        }
      }
      
      // Delete the achievement item from the database
      const { error } = await supabase
        .from('achievements')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setAchievements(achievements.filter(item => item.id !== id));
      setSelectedAchievements(selectedAchievements.filter(itemId => itemId !== id));
      
      toast({
        title: "Success",
        description: "Achievement item deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting achievement:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete achievement item",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleBulkDelete() {
    if (selectedAchievements.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedAchievements.length} achievement(s)?`)) return;

    try {
      setIsDeleting(true);
      
      let deletePromises = [];
      
      // Process each selected achievement
      for (const id of selectedAchievements) {
        const achievement = achievements.find(item => item.id === id);
        if (!achievement) continue;
        
        // Delete image if exists
        if (achievement.image) {
          const imageDeletePromise = deleteImage(achievement.image);
          deletePromises.push(imageDeletePromise);
        }
        
        // Delete from database
        const dbDeletePromise = supabase
          .from('achievements')
          .delete()
          .eq('id', id);
          
        deletePromises.push(dbDeletePromise);
      }
      
      // Wait for all deletions to complete
      await Promise.all(deletePromises);
      
      // Update local state
      setAchievements(achievements.filter(item => !selectedAchievements.includes(item.id)));
      setSelectedAchievements([]);
      
      toast({
        title: "Success",
        description: `${selectedAchievements.length} achievement(s) deleted successfully`,
      });
    } catch (error: any) {
      console.error('Error in bulk delete:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete some achievements",
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

  async function handleBulkPublish(publish: boolean) {
    if (selectedAchievements.length === 0) return;
    
    try {
      const { error } = await supabase
        .from('achievements')
        .update({ published: publish })
        .in('id', selectedAchievements);

      if (error) throw error;
      
      // Update local state
      setAchievements(achievements.map(item => 
        selectedAchievements.includes(item.id) ? {...item, published: publish} : item
      ));
      
      toast({
        title: "Success",
        description: `${selectedAchievements.length} achievement(s) ${publish ? 'published' : 'unpublished'} successfully`,
      });
    } catch (error: any) {
      console.error('Error in bulk publish:', error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${publish ? 'publish' : 'unpublish'} achievements`,
        variant: "destructive",
      });
    }
  }

  function toggleSelectAchievement(id: string) {
    setSelectedAchievements(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  }

  function toggleSelectAll() {
    if (isAllSelected) {
      setSelectedAchievements([]);
    } else {
      setSelectedAchievements(filteredAchievements.map(t => t.id));
    }
  }

  // Filter achievements based on publish status
  const statusFilteredAchievements = achievements.filter(item => {
    if (publishFilter === 'all') return true;
    if (publishFilter === 'published') return item.published;
    if (publishFilter === 'draft') return !item.published;
    return true;
  });

  // Filter achievements based on search category and query
  const filteredAchievements = searchQuery.trim() === '' 
    ? statusFilteredAchievements 
    : statusFilteredAchievements.filter(item => {
        const query = searchQuery.toLowerCase();
        
        switch(searchCategory) {
          case 'title':
            return item.title_en.toLowerCase().includes(query) || 
                   item.title_bg.toLowerCase().includes(query);
          case 'description':
            return item.description_en.toLowerCase().includes(query) || 
                   item.description_bg.toLowerCase().includes(query);
          case 'student':
            return item.student_name?.toLowerCase().includes(query) || false;
          case 'category':
            return item.category.toLowerCase().includes(query);
          case 'all':
          default:
            return item.title_en.toLowerCase().includes(query) ||
                   item.title_bg.toLowerCase().includes(query) ||
                   item.description_en.toLowerCase().includes(query) ||
                   item.description_bg.toLowerCase().includes(query) ||
                   item.student_name?.toLowerCase().includes(query) ||
                   item.category.toLowerCase().includes(query);
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

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Achievements Management</h1>
          <p className="text-muted-foreground">Manage student and school achievements</p>
        </div>
        <Button asChild>
          <Link href="/admin/achievements/new" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>Add Achievement</span>
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>All Achievements</CardTitle>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="relative flex items-center gap-2">
                  <div className="flex items-center">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search achievements..."
                      className="pl-8 w-[250px]"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>
                  <Select 
                    value={searchCategory} 
                    onValueChange={(value) => setSearchCategory(value as SearchCategory)}
                  >
                    <SelectTrigger className="w-[130px]">
                      <SelectValue placeholder="Search in..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Fields</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="description">Description</SelectItem>
                      <SelectItem value="student">Student</SelectItem>
                      <SelectItem value="category">Category</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
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
          </div>
        </CardHeader>
        <CardContent>
          <Tabs 
            defaultValue="all" 
            value={publishFilter}
            onValueChange={(value) => setPublishFilter(value as PublishStatus)}
            className="mb-4"
          >
            <TabsList>
              <TabsTrigger value="all" className="flex gap-2 items-center">
                <FilterIcon className="h-4 w-4" />
                All
              </TabsTrigger>
              <TabsTrigger value="published" className="flex gap-2 items-center">
                <Check className="h-4 w-4" />
                Published
              </TabsTrigger>
              <TabsTrigger value="draft" className="flex gap-2 items-center">
                <X className="h-4 w-4" />
                Drafts
              </TabsTrigger>
            </TabsList>
          </Tabs>
          
          {selectedAchievements.length > 0 && (
            <div className="flex items-center mb-4 bg-muted p-2 rounded-md">
              <span className="mr-2 font-medium">{selectedAchievements.length} selected</span>
              <div className="flex gap-2">
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={() => handleBulkPublish(true)}
                  disabled={isDeleting}
                >
                  <Check className="h-4 w-4 mr-1" /> Publish
                </Button>
                <Button 
                  size="sm" 
                  variant="secondary"
                  onClick={() => handleBulkPublish(false)}
                  disabled={isDeleting}
                >
                  <X className="h-4 w-4 mr-1" /> Unpublish
                </Button>
                <Button 
                  size="sm" 
                  variant="destructive"
                  onClick={handleBulkDelete}
                  disabled={isDeleting}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  onClick={() => setSelectedAchievements([])}
                >
                  Clear Selection
                </Button>
              </div>
            </div>
          )}
          
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="w-full flex items-center space-x-4">
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
            filteredAchievements.length > 0 ? (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[40px]">
                        <Checkbox 
                          checked={isAllSelected}
                          onCheckedChange={toggleSelectAll}
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
                    {filteredAchievements.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Checkbox 
                            checked={selectedAchievements.includes(item.id)}
                            onCheckedChange={() => toggleSelectAchievement(item.id)}
                            aria-label={`Select ${item.title_en || item.title_bg}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium truncate max-w-[300px]">{item.title_en || item.title_bg}</div>
                          {item.student_name && (
                            <div className="text-sm text-muted-foreground">
                              Student: {item.student_name}
                            </div>
                          )}
                        </TableCell>
                        <TableCell>{formatDate(item.date)}</TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {item.category}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={item.published ? "default" : "outline"}
                            className="cursor-pointer"
                            onClick={() => togglePublishStatus(item.id, item.published)}
                          >
                            {item.published ? "Published" : "Draft"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem asChild>
                                <Link 
                                  href={`/admin/achievements/${item.id}/edit`}
                                  className="flex items-center gap-2 cursor-pointer"
                                >
                                  <Pencil className="h-4 w-4" />
                                  <span>Edit</span>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link 
                                  href={`/achievements/${item.id}`}
                                  className="flex items-center gap-2 cursor-pointer"
                                  target="_blank"
                                >
                                  <EyeIcon className="h-4 w-4" />
                                  <span>View</span>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                onClick={() => togglePublishStatus(item.id, item.published)}
                                className="flex items-center gap-2 cursor-pointer"
                              >
                                {item.published ? (
                                  <>
                                    <X className="h-4 w-4" />
                                    <span>Unpublish</span>
                                  </>
                                ) : (
                                  <>
                                    <Check className="h-4 w-4" />
                                    <span>Publish</span>
                                  </>
                                )}
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className="flex items-center gap-2 text-red-600 focus:text-red-600 cursor-pointer"
                                onClick={() => handleDelete(item.id)}
                                disabled={isDeleting}
                              >
                                <Trash2 className="h-4 w-4" />
                                <span>Delete</span>
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
              <div className="text-center py-10 text-muted-foreground">
                {searchQuery.trim() !== '' ? (
                  <div>
                    <p className="mb-2">No achievements found matching "{searchQuery}"</p>
                    <Button variant="outline" onClick={() => setSearchQuery('')}>Clear Search</Button>
                  </div>
                ) : publishFilter !== 'all' ? (
                  <div>
                    <p className="mb-2">No {publishFilter} achievements found</p>
                    <Button variant="outline" onClick={() => setPublishFilter('all')}>Show All Achievements</Button>
                  </div>
                ) : (
                  <div>
                    <p className="mb-2">No achievements found</p>
                    <Button asChild variant="outline">
                      <Link href="/admin/achievements/new">Create your first achievement</Link>
                    </Button>
                  </div>
                )}
              </div>
            )
          )}
        </CardContent>
      </Card>
    </div>
  );
} 