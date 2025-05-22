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

interface TeacherItem {
  id: string;
  name: string;
  title_en: string;
  title_bg: string;
  bio_en: string;
  bio_bg: string;
  image?: string;
  email?: string;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

type SearchCategory = 'all' | 'name' | 'title' | 'email' | 'bio';
type PublishStatus = 'all' | 'published' | 'draft';

export default function TeachersManagementPage() {
  const [teachers, setTeachers] = useState<TeacherItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategory, setSearchCategory] = useState<SearchCategory>('all');
  const [publishFilter, setPublishFilter] = useState<PublishStatus>('all');
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedTeachers, setSelectedTeachers] = useState<string[]>([]);
  const [isAllSelected, setIsAllSelected] = useState(false);

  useEffect(() => {
    fetchTeachers();
  }, []);

  // Handle "select all" checkbox
  useEffect(() => {
    if (filteredTeachers.length > 0 && selectedTeachers.length === filteredTeachers.length) {
      setIsAllSelected(true);
    } else {
      setIsAllSelected(false);
    }
  }, [selectedTeachers, teachers, searchQuery, publishFilter]);

  async function fetchTeachers() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('teachers')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setTeachers(data || []);
      setSelectedTeachers([]);
    } catch (error) {
      console.error('Error fetching teachers:', error);
      toast({
        title: "Error",
        description: "Failed to load teachers",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this teacher?')) return;

    try {
      setIsDeleting(true);
      
      // Find the teacher
      const teacher = teachers.find(item => item.id === id);
      if (!teacher) throw new Error('Teacher not found');
      
      // Delete the image from storage if exists
      if (teacher.image) {
        const deleted = await deleteImage(teacher.image);
        if (deleted) {
          console.log('Successfully deleted image for teacher:', id);
        } else {
          console.warn('Failed to delete image for teacher:', id);
          // Continue with deletion anyway
        }
      }
      
      // Delete the teacher from the database
      const { error } = await supabase
        .from('teachers')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setTeachers(teachers.filter(item => item.id !== id));
      setSelectedTeachers(selectedTeachers.filter(teacherId => teacherId !== id));
      
      toast({
        title: "Success",
        description: "Teacher deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting teacher:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete teacher",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  async function handleBulkDelete() {
    if (selectedTeachers.length === 0) return;
    
    if (!confirm(`Are you sure you want to delete ${selectedTeachers.length} teacher(s)?`)) return;

    try {
      setIsDeleting(true);
      
      let deletePromises = [];
      
      // Process each selected teacher
      for (const id of selectedTeachers) {
        const teacher = teachers.find(item => item.id === id);
        if (!teacher) continue;
        
        // Delete image if exists
        if (teacher.image) {
          const imageDeletePromise = deleteImage(teacher.image);
          deletePromises.push(imageDeletePromise);
        }
        
        // Delete from database
        const dbDeletePromise = supabase
          .from('teachers')
          .delete()
          .eq('id', id);
          
        deletePromises.push(dbDeletePromise);
      }
      
      // Wait for all deletions to complete
      await Promise.all(deletePromises);
      
      // Update local state
      setTeachers(teachers.filter(item => !selectedTeachers.includes(item.id)));
      setSelectedTeachers([]);
      
      toast({
        title: "Success",
        description: `${selectedTeachers.length} teacher(s) deleted successfully`,
      });
    } catch (error: any) {
      console.error('Error in bulk delete:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete some teachers",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  async function togglePublishStatus(id: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from('teachers')
        .update({ published: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setTeachers(teachers.map(item => 
        item.id === id ? {...item, published: !currentStatus} : item
      ));
      
      toast({
        title: "Success",
        description: `Teacher ${!currentStatus ? 'published' : 'unpublished'} successfully`,
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
    if (selectedTeachers.length === 0) return;
    
    try {
      const { error } = await supabase
        .from('teachers')
        .update({ published: publish })
        .in('id', selectedTeachers);

      if (error) throw error;
      
      // Update local state
      setTeachers(teachers.map(item => 
        selectedTeachers.includes(item.id) ? {...item, published: publish} : item
      ));
      
      toast({
        title: "Success",
        description: `${selectedTeachers.length} teacher(s) ${publish ? 'published' : 'unpublished'} successfully`,
      });
    } catch (error: any) {
      console.error('Error in bulk publish:', error);
      toast({
        title: "Error",
        description: error.message || `Failed to ${publish ? 'publish' : 'unpublish'} teachers`,
        variant: "destructive",
      });
    }
  }

  function toggleSelectTeacher(id: string) {
    setSelectedTeachers(prev => 
      prev.includes(id) 
        ? prev.filter(item => item !== id)
        : [...prev, id]
    );
  }

  function toggleSelectAll() {
    if (isAllSelected) {
      setSelectedTeachers([]);
    } else {
      setSelectedTeachers(filteredTeachers.map(t => t.id));
    }
  }

  // Filter teachers based on publish status
  const statusFilteredTeachers = teachers.filter(item => {
    if (publishFilter === 'all') return true;
    if (publishFilter === 'published') return item.published;
    if (publishFilter === 'draft') return !item.published;
    return true;
  });

  // Filter teachers based on search category and query
  const filteredTeachers = searchQuery.trim() === '' 
    ? statusFilteredTeachers 
    : statusFilteredTeachers.filter(item => {
        const query = searchQuery.toLowerCase();
        
        switch(searchCategory) {
          case 'name':
            return item.name.toLowerCase().includes(query);
          case 'title':
            return item.title_en.toLowerCase().includes(query) || 
                   item.title_bg.toLowerCase().includes(query);
          case 'email':
            return item.email?.toLowerCase().includes(query) || false;
          case 'bio':
            return item.bio_en.toLowerCase().includes(query) || 
                   item.bio_bg.toLowerCase().includes(query);
          case 'all':
          default:
            return item.name.toLowerCase().includes(query) ||
                   item.title_en.toLowerCase().includes(query) ||
                   item.title_bg.toLowerCase().includes(query) ||
                   item.email?.toLowerCase().includes(query) ||
                   item.bio_en.toLowerCase().includes(query) ||
                   item.bio_bg.toLowerCase().includes(query);
        }
      });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Teachers Management</h1>
          <p className="text-muted-foreground">Manage school teachers and staff</p>
        </div>
        <Button asChild>
          <Link href="/admin/teachers/new" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>Add Teacher</span>
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>All Teachers</CardTitle>
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2">
                <div className="relative flex items-center gap-2">
                  <div className="flex items-center">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="search"
                      placeholder="Search teachers..."
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
                      <SelectItem value="name">Name</SelectItem>
                      <SelectItem value="title">Title</SelectItem>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="bio">Biography</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  variant="outline" 
                  size="icon"
                  onClick={fetchTeachers}
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
          
          {selectedTeachers.length > 0 && (
            <div className="flex items-center mb-4 bg-muted p-2 rounded-md">
              <span className="mr-2 font-medium">{selectedTeachers.length} selected</span>
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
                  onClick={() => setSelectedTeachers([])}
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
            filteredTeachers.length > 0 ? (
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
                      <TableHead>Name</TableHead>
                      <TableHead>Title</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredTeachers.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Checkbox 
                            checked={selectedTeachers.includes(item.id)}
                            onCheckedChange={() => toggleSelectTeacher(item.id)}
                            aria-label={`Select ${item.name}`}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="font-medium">{item.name}</div>
                        </TableCell>
                        <TableCell>{item.title_en}</TableCell>
                        <TableCell>
                          {item.email && (
                            <a 
                              href={`mailto:${item.email}`} 
                              className="text-blue-600 hover:underline"
                            >
                              {item.email}
                            </a>
                          )}
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
                        <TableCell>{item.sort_order}</TableCell>
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
                                  href={`/admin/teachers/${item.id}/edit`}
                                  className="flex items-center gap-2 cursor-pointer"
                                >
                                  <Pencil className="h-4 w-4" />
                                  <span>Edit</span>
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link 
                                  href={`/bg/team/${item.id}`}
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
                    <p className="mb-2">No teachers found matching "{searchQuery}"</p>
                    <Button variant="outline" onClick={() => setSearchQuery('')}>Clear Search</Button>
                  </div>
                ) : publishFilter !== 'all' ? (
                  <div>
                    <p className="mb-2">No {publishFilter} teachers found</p>
                    <Button variant="outline" onClick={() => setPublishFilter('all')}>Show All Teachers</Button>
                  </div>
                ) : (
                  <div>
                    <p className="mb-2">No teachers found</p>
                    <Button asChild variant="outline">
                      <Link href="/admin/teachers/new">Add your first teacher</Link>
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