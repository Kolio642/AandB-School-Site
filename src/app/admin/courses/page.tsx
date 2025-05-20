'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { PlusCircle, Pencil, Trash2, Search, EyeIcon, RefreshCcw, ArrowUpDown, Filter } from 'lucide-react';
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
  DropdownMenuCheckboxItem,
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
import { deleteImage } from '@/lib/storage-helpers';

interface Course {
  id: string;
  title_en: string;
  title_bg: string;
  description_en: string;
  description_bg: string;
  category: string;
  image: string | null;
  published: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

// Course categories
const COURSE_CATEGORIES = [
  'language',
  'science',
  'math',
  'arts',
  'technology',
  'sports',
  'humanities'
];

type PublishFilter = 'all' | 'published' | 'unpublished';
type SortField = 'title' | 'category' | 'sort_order' | 'created_at';
type SortOrder = 'asc' | 'desc';

export default function CoursesManagementPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDeleting, setIsDeleting] = useState(false);
  const [publishFilter, setPublishFilter] = useState<PublishFilter>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('sort_order');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  useEffect(() => {
    fetchCourses();
  }, []);

  async function fetchCourses() {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('sort_order', { ascending: true });

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Are you sure you want to delete this course?')) return;

    try {
      setIsDeleting(true);
      
      // Find the course item
      const courseItem = courses.find(item => item.id === id);
      if (!courseItem) throw new Error('Course not found');
      
      // Delete the image from storage if exists
      if (courseItem.image) {
        const deleted = await deleteImage(courseItem.image);
        if (deleted) {
          console.log('Successfully deleted image for course:', id);
        } else {
          console.warn('Failed to delete image for course:', id);
          // Continue with deletion anyway
        }
      }
      
      // Delete the course from the database
      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setCourses(courses.filter(item => item.id !== id));
      
      toast({
        title: "Success",
        description: "Course deleted successfully",
      });
    } catch (error: any) {
      console.error('Error deleting course:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete course",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  }

  async function togglePublishStatus(id: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from('courses')
        .update({ published: !currentStatus })
        .eq('id', id);

      if (error) throw error;
      
      // Update local state
      setCourses(courses.map(item => 
        item.id === id ? {...item, published: !currentStatus} : item
      ));
      
      toast({
        title: "Success",
        description: `Course ${!currentStatus ? 'published' : 'unpublished'} successfully`,
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

  // Apply all filters and sorting
  const filteredAndSortedCourses = courses
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
        item.title_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.title_bg.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description_bg?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase())
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
      } else if (sortField === 'category') {
        valueA = a.category;
        valueB = b.category;
      } else if (sortField === 'created_at') {
        valueA = new Date(a.created_at).getTime();
        valueB = new Date(b.created_at).getTime();
      } else {
        // Default to sort_order
        valueA = a.sort_order;
        valueB = b.sort_order;
      }

      // Apply sort order
      if (sortOrder === 'asc') {
        return valueA > valueB ? 1 : -1;
      } else {
        return valueA < valueB ? 1 : -1;
      }
    });

  // Helper function to capitalize first letter
  const capitalize = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  // Toggle sort order or change sort field
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      // Toggle sort order if the same field is clicked
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Change sort field and reset to ascending
      setSortField(field);
      setSortOrder('asc');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Courses Management</h1>
          <p className="text-muted-foreground">Manage courses for the website</p>
        </div>
        <Button asChild>
          <Link href="/admin/courses/new" className="flex items-center gap-2">
            <PlusCircle className="h-4 w-4" />
            <span>Add Course</span>
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col space-y-3 md:flex-row md:items-center md:justify-between md:space-y-0">
            <CardTitle>All Courses</CardTitle>
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
                  {COURSE_CATEGORIES.map(category => (
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
                  placeholder="Search courses..."
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
                    checked={sortField === 'category'}
                    onCheckedChange={() => handleSort('category')}
                  >
                    Category {sortField === 'category' && (sortOrder === 'asc' ? '↑' : '↓')}
                  </DropdownMenuCheckboxItem>
                  <DropdownMenuCheckboxItem 
                    checked={sortField === 'sort_order'}
                    onCheckedChange={() => handleSort('sort_order')}
                  >
                    Sort Order {sortField === 'sort_order' && (sortOrder === 'asc' ? '↑' : '↓')}
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
                onClick={fetchCourses}
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
            filteredAndSortedCourses.length > 0 ? (
              <div className="border rounded-md">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Title</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Sort Order</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedCourses.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <div className="font-medium truncate max-w-[300px]">{item.title_en || item.title_bg}</div>
                          <div className="text-sm text-muted-foreground truncate max-w-[300px]">
                            {item.description_en?.substring(0, 50) || item.description_bg?.substring(0, 50)}
                            {(item.description_en?.length > 50 || item.description_bg?.length > 50) ? '...' : ''}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {capitalize(item.category)}
                          </Badge>
                        </TableCell>
                        <TableCell>{item.sort_order}</TableCell>
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
                                <EyeIcon className="h-4 w-4" />
                                <span className="sr-only">Actions</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
                              <DropdownMenuItem onClick={() => togglePublishStatus(item.id, item.published)}>
                                {item.published ? 'Unpublish' : 'Publish'}
                              </DropdownMenuItem>
                              <DropdownMenuItem asChild>
                                <Link href={`/admin/courses/${item.id}/edit`}>
                                  <Pencil className="h-4 w-4 mr-2" />
                                  Edit Course
                                </Link>
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDelete(item.id)}
                                disabled={isDeleting}
                              >
                                <Trash2 className="h-4 w-4 mr-2" />
                                Delete Course
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
                <p className="text-muted-foreground">No courses found with current filters.</p>
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
                    <Link href="/admin/courses/new">Add Course</Link>
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