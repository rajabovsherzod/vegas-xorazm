/**
 * Frontend Errors Dashboard
 * 
 * Faqat frontend xatoliklari
 */

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logsService, ErrorLog } from '@/lib/services/logs.service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, AlertTriangle, Info, Trash2, RefreshCw, Loader2, Monitor } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function FrontendErrorsPage() {
  const [filter, setFilter] = useState<'all' | 'error' | 'warning' | 'info'>('all');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  // Get frontend error logs from backend
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['frontend-errors', filter, page],
    queryFn: () => logsService.getAll({ source: 'frontend', level: filter, page, limit: 50 }),
    refetchInterval: 5000, // Har 5 soniyada yangilash
  });

  // Get stats (faqat frontend uchun)
  const { data: statsData } = useQuery({
    queryKey: ['frontend-errors-stats', filter],
    queryFn: async () => {
      const res = await logsService.getAll({ source: 'frontend', level: filter, limit: 1000 });
      const logs = res.logs;
      return {
        total: logs.length,
        errors: logs.filter(e => e.level === 'error').length,
        warnings: logs.filter(e => e.level === 'warning').length,
        info: logs.filter(e => e.level === 'info').length,
      };
    },
    refetchInterval: 10000,
    retry: 2,
    staleTime: 5000,
  });

  // Delete single error mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => logsService.delete(id),
    onSuccess: () => {
      toast.success('Xatolik o\'chirildi');
      queryClient.invalidateQueries({ queryKey: ['frontend-errors'] });
      queryClient.invalidateQueries({ queryKey: ['frontend-errors-stats'] });
    },
    onError: () => {
      toast.error('Xatolikni o\'chirishda xatolik yuz berdi');
    },
  });

  const handleDelete = (id: number) => {
    if (confirm('Bu xatolikni o\'chirmoqchimisiz?')) {
      deleteMutation.mutate(id);
    }
  };

  const errors = data?.logs || [];
  const stats = statsData || {
    total: 0,
    errors: 0,
    warnings: 0,
    info: 0,
  };

  const getIcon = (level: string) => {
    switch (level) {
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info': return <Info className="w-5 h-5 text-blue-500" />;
      default: return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getLevelBadge = (level: string) => {
    const colors = {
      error: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    };
    return colors[level as keyof typeof colors] || colors.error;
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Monitor className="w-8 h-8 text-[#00B8D9]" />
            <div>
              <h1 className="text-3xl font-bold text-[#212B36] dark:text-white">
                Frontend Errors
              </h1>
              <p className="text-muted-foreground mt-1">
                Frontend xatoliklari monitoring dashboard
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Yangilash
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1C2C30] rounded-xl p-6 shadow-sm border">
          <div className="text-sm text-muted-foreground mb-1">Jami</div>
          <div className="text-3xl font-bold text-[#212B36] dark:text-white">
            {stats.total}
          </div>
        </div>
        <div className="bg-white dark:bg-[#1C2C30] rounded-xl p-6 shadow-sm border">
          <div className="text-sm text-muted-foreground mb-1">Errors</div>
          <div className="text-3xl font-bold text-red-600">
            {stats.errors}
          </div>
        </div>
        <div className="bg-white dark:bg-[#1C2C30] rounded-xl p-6 shadow-sm border">
          <div className="text-sm text-muted-foreground mb-1">Warnings</div>
          <div className="text-3xl font-bold text-yellow-600">
            {stats.warnings}
          </div>
        </div>
        <div className="bg-white dark:bg-[#1C2C30] rounded-xl p-6 shadow-sm border">
          <div className="text-sm text-muted-foreground mb-1">Info</div>
          <div className="text-3xl font-bold text-blue-600">
            {stats.info}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          onClick={() => { setFilter('all'); setPage(1); }}
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
        >
          Barchasi ({stats.total})
        </Button>
        <Button
          onClick={() => { setFilter('error'); setPage(1); }}
          variant={filter === 'error' ? 'default' : 'outline'}
          size="sm"
          className={filter === 'error' ? 'bg-red-600 hover:bg-red-700' : ''}
        >
          Errors ({stats.errors})
        </Button>
        <Button
          onClick={() => { setFilter('warning'); setPage(1); }}
          variant={filter === 'warning' ? 'default' : 'outline'}
          size="sm"
          className={filter === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
        >
          Warnings ({stats.warnings})
        </Button>
        <Button
          onClick={() => { setFilter('info'); setPage(1); }}
          variant={filter === 'info' ? 'default' : 'outline'}
          size="sm"
          className={filter === 'info' ? 'bg-blue-600 hover:bg-blue-700' : ''}
        >
          Info ({stats.info})
        </Button>
      </div>

      {/* Error List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white dark:bg-[#1C2C30] rounded-xl p-12 text-center shadow-sm border">
            <Loader2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Yuklanmoqda...</p>
          </div>
        ) : errors.length === 0 ? (
          <div className="bg-white dark:bg-[#1C2C30] rounded-xl p-12 text-center shadow-sm border">
            <Info className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              {filter === 'all' ? 'Hech qanday frontend xatolik yo\'q' : `${filter} xatoliklari yo'q`}
            </p>
          </div>
        ) : (
          <>
            {errors.map((error) => (
              <div
                key={error.id}
                className="bg-white dark:bg-[#1C2C30] rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                  {getIcon(error.level)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getLevelBadge(error.level)}>
                        {error.level.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(error.createdAt), 'dd.MM.yyyy HH:mm:ss')}
                      </span>
                      {error.ip && (
                        <span className="text-xs text-muted-foreground">
                          IP: {error.ip}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-[#212B36] dark:text-white">
                      {error.message}
                    </h3>
                  </div>
                  <Button
                    onClick={() => handleDelete(error.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <span className="text-muted-foreground">URL:</span>
                    <span className="text-[#212B36] dark:text-white break-all">
                      {error.url}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-muted-foreground">User Agent:</span>
                    <span className="text-[#212B36] dark:text-white break-all">
                      {error.userAgent}
                    </span>
                  </div>
                  {error.userId && (
                    <div className="flex gap-2">
                      <span className="text-muted-foreground">User ID:</span>
                      <span className="text-[#212B36] dark:text-white">
                        {error.userId}
                      </span>
                    </div>
                  )}
                </div>

                {/* Stack Trace */}
                {error.stack && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium text-[#00B8D9] hover:underline">
                      Stack Trace
                    </summary>
                    <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto">
                      {error.stack}
                    </pre>
                  </details>
                )}

                {/* Context */}
                {error.context && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium text-[#00B8D9] hover:underline">
                      Context
                    </summary>
                    <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto">
                      {JSON.stringify(error.context, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}

            {/* Pagination */}
            {data?.pagination && data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                >
                  Oldingi
                </Button>
                <span className="text-sm text-muted-foreground">
                  {page} / {data.pagination.totalPages}
                </span>
                <Button
                  onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                  variant="outline"
                  size="sm"
                  disabled={page === data.pagination.totalPages}
                >
                  Keyingi
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}







 * Frontend Errors Dashboard
 * 
 * Faqat frontend xatoliklari
 */

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logsService, ErrorLog } from '@/lib/services/logs.service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, AlertTriangle, Info, Trash2, RefreshCw, Loader2, Monitor } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function FrontendErrorsPage() {
  const [filter, setFilter] = useState<'all' | 'error' | 'warning' | 'info'>('all');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  // Get frontend error logs from backend
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['frontend-errors', filter, page],
    queryFn: () => logsService.getAll({ source: 'frontend', level: filter, page, limit: 50 }),
    refetchInterval: 5000, // Har 5 soniyada yangilash
  });

  // Get stats (faqat frontend uchun)
  const { data: statsData } = useQuery({
    queryKey: ['frontend-errors-stats', filter],
    queryFn: async () => {
      const res = await logsService.getAll({ source: 'frontend', level: filter, limit: 1000 });
      const logs = res.logs;
      return {
        total: logs.length,
        errors: logs.filter(e => e.level === 'error').length,
        warnings: logs.filter(e => e.level === 'warning').length,
        info: logs.filter(e => e.level === 'info').length,
      };
    },
    refetchInterval: 10000,
    retry: 2,
    staleTime: 5000,
  });

  // Delete single error mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => logsService.delete(id),
    onSuccess: () => {
      toast.success('Xatolik o\'chirildi');
      queryClient.invalidateQueries({ queryKey: ['frontend-errors'] });
      queryClient.invalidateQueries({ queryKey: ['frontend-errors-stats'] });
    },
    onError: () => {
      toast.error('Xatolikni o\'chirishda xatolik yuz berdi');
    },
  });

  const handleDelete = (id: number) => {
    if (confirm('Bu xatolikni o\'chirmoqchimisiz?')) {
      deleteMutation.mutate(id);
    }
  };

  const errors = data?.logs || [];
  const stats = statsData || {
    total: 0,
    errors: 0,
    warnings: 0,
    info: 0,
  };

  const getIcon = (level: string) => {
    switch (level) {
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info': return <Info className="w-5 h-5 text-blue-500" />;
      default: return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getLevelBadge = (level: string) => {
    const colors = {
      error: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    };
    return colors[level as keyof typeof colors] || colors.error;
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Monitor className="w-8 h-8 text-[#00B8D9]" />
            <div>
              <h1 className="text-3xl font-bold text-[#212B36] dark:text-white">
                Frontend Errors
              </h1>
              <p className="text-muted-foreground mt-1">
                Frontend xatoliklari monitoring dashboard
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Yangilash
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1C2C30] rounded-xl p-6 shadow-sm border">
          <div className="text-sm text-muted-foreground mb-1">Jami</div>
          <div className="text-3xl font-bold text-[#212B36] dark:text-white">
            {stats.total}
          </div>
        </div>
        <div className="bg-white dark:bg-[#1C2C30] rounded-xl p-6 shadow-sm border">
          <div className="text-sm text-muted-foreground mb-1">Errors</div>
          <div className="text-3xl font-bold text-red-600">
            {stats.errors}
          </div>
        </div>
        <div className="bg-white dark:bg-[#1C2C30] rounded-xl p-6 shadow-sm border">
          <div className="text-sm text-muted-foreground mb-1">Warnings</div>
          <div className="text-3xl font-bold text-yellow-600">
            {stats.warnings}
          </div>
        </div>
        <div className="bg-white dark:bg-[#1C2C30] rounded-xl p-6 shadow-sm border">
          <div className="text-sm text-muted-foreground mb-1">Info</div>
          <div className="text-3xl font-bold text-blue-600">
            {stats.info}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          onClick={() => { setFilter('all'); setPage(1); }}
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
        >
          Barchasi ({stats.total})
        </Button>
        <Button
          onClick={() => { setFilter('error'); setPage(1); }}
          variant={filter === 'error' ? 'default' : 'outline'}
          size="sm"
          className={filter === 'error' ? 'bg-red-600 hover:bg-red-700' : ''}
        >
          Errors ({stats.errors})
        </Button>
        <Button
          onClick={() => { setFilter('warning'); setPage(1); }}
          variant={filter === 'warning' ? 'default' : 'outline'}
          size="sm"
          className={filter === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
        >
          Warnings ({stats.warnings})
        </Button>
        <Button
          onClick={() => { setFilter('info'); setPage(1); }}
          variant={filter === 'info' ? 'default' : 'outline'}
          size="sm"
          className={filter === 'info' ? 'bg-blue-600 hover:bg-blue-700' : ''}
        >
          Info ({stats.info})
        </Button>
      </div>

      {/* Error List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white dark:bg-[#1C2C30] rounded-xl p-12 text-center shadow-sm border">
            <Loader2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Yuklanmoqda...</p>
          </div>
        ) : errors.length === 0 ? (
          <div className="bg-white dark:bg-[#1C2C30] rounded-xl p-12 text-center shadow-sm border">
            <Info className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              {filter === 'all' ? 'Hech qanday frontend xatolik yo\'q' : `${filter} xatoliklari yo'q`}
            </p>
          </div>
        ) : (
          <>
            {errors.map((error) => (
              <div
                key={error.id}
                className="bg-white dark:bg-[#1C2C30] rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                  {getIcon(error.level)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getLevelBadge(error.level)}>
                        {error.level.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(error.createdAt), 'dd.MM.yyyy HH:mm:ss')}
                      </span>
                      {error.ip && (
                        <span className="text-xs text-muted-foreground">
                          IP: {error.ip}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-[#212B36] dark:text-white">
                      {error.message}
                    </h3>
                  </div>
                  <Button
                    onClick={() => handleDelete(error.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <span className="text-muted-foreground">URL:</span>
                    <span className="text-[#212B36] dark:text-white break-all">
                      {error.url}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-muted-foreground">User Agent:</span>
                    <span className="text-[#212B36] dark:text-white break-all">
                      {error.userAgent}
                    </span>
                  </div>
                  {error.userId && (
                    <div className="flex gap-2">
                      <span className="text-muted-foreground">User ID:</span>
                      <span className="text-[#212B36] dark:text-white">
                        {error.userId}
                      </span>
                    </div>
                  )}
                </div>

                {/* Stack Trace */}
                {error.stack && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium text-[#00B8D9] hover:underline">
                      Stack Trace
                    </summary>
                    <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto">
                      {error.stack}
                    </pre>
                  </details>
                )}

                {/* Context */}
                {error.context && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium text-[#00B8D9] hover:underline">
                      Context
                    </summary>
                    <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto">
                      {JSON.stringify(error.context, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}

            {/* Pagination */}
            {data?.pagination && data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                >
                  Oldingi
                </Button>
                <span className="text-sm text-muted-foreground">
                  {page} / {data.pagination.totalPages}
                </span>
                <Button
                  onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                  variant="outline"
                  size="sm"
                  disabled={page === data.pagination.totalPages}
                >
                  Keyingi
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}








 * Frontend Errors Dashboard
 * 
 * Faqat frontend xatoliklari
 */

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logsService, ErrorLog } from '@/lib/services/logs.service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, AlertTriangle, Info, Trash2, RefreshCw, Loader2, Monitor } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function FrontendErrorsPage() {
  const [filter, setFilter] = useState<'all' | 'error' | 'warning' | 'info'>('all');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  // Get frontend error logs from backend
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['frontend-errors', filter, page],
    queryFn: () => logsService.getAll({ source: 'frontend', level: filter, page, limit: 50 }),
    refetchInterval: 5000, // Har 5 soniyada yangilash
  });

  // Get stats (faqat frontend uchun)
  const { data: statsData } = useQuery({
    queryKey: ['frontend-errors-stats', filter],
    queryFn: async () => {
      const res = await logsService.getAll({ source: 'frontend', level: filter, limit: 1000 });
      const logs = res.logs;
      return {
        total: logs.length,
        errors: logs.filter(e => e.level === 'error').length,
        warnings: logs.filter(e => e.level === 'warning').length,
        info: logs.filter(e => e.level === 'info').length,
      };
    },
    refetchInterval: 10000,
    retry: 2,
    staleTime: 5000,
  });

  // Delete single error mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => logsService.delete(id),
    onSuccess: () => {
      toast.success('Xatolik o\'chirildi');
      queryClient.invalidateQueries({ queryKey: ['frontend-errors'] });
      queryClient.invalidateQueries({ queryKey: ['frontend-errors-stats'] });
    },
    onError: () => {
      toast.error('Xatolikni o\'chirishda xatolik yuz berdi');
    },
  });

  const handleDelete = (id: number) => {
    if (confirm('Bu xatolikni o\'chirmoqchimisiz?')) {
      deleteMutation.mutate(id);
    }
  };

  const errors = data?.logs || [];
  const stats = statsData || {
    total: 0,
    errors: 0,
    warnings: 0,
    info: 0,
  };

  const getIcon = (level: string) => {
    switch (level) {
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info': return <Info className="w-5 h-5 text-blue-500" />;
      default: return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getLevelBadge = (level: string) => {
    const colors = {
      error: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    };
    return colors[level as keyof typeof colors] || colors.error;
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Monitor className="w-8 h-8 text-[#00B8D9]" />
            <div>
              <h1 className="text-3xl font-bold text-[#212B36] dark:text-white">
                Frontend Errors
              </h1>
              <p className="text-muted-foreground mt-1">
                Frontend xatoliklari monitoring dashboard
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Yangilash
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1C2C30] rounded-xl p-6 shadow-sm border">
          <div className="text-sm text-muted-foreground mb-1">Jami</div>
          <div className="text-3xl font-bold text-[#212B36] dark:text-white">
            {stats.total}
          </div>
        </div>
        <div className="bg-white dark:bg-[#1C2C30] rounded-xl p-6 shadow-sm border">
          <div className="text-sm text-muted-foreground mb-1">Errors</div>
          <div className="text-3xl font-bold text-red-600">
            {stats.errors}
          </div>
        </div>
        <div className="bg-white dark:bg-[#1C2C30] rounded-xl p-6 shadow-sm border">
          <div className="text-sm text-muted-foreground mb-1">Warnings</div>
          <div className="text-3xl font-bold text-yellow-600">
            {stats.warnings}
          </div>
        </div>
        <div className="bg-white dark:bg-[#1C2C30] rounded-xl p-6 shadow-sm border">
          <div className="text-sm text-muted-foreground mb-1">Info</div>
          <div className="text-3xl font-bold text-blue-600">
            {stats.info}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          onClick={() => { setFilter('all'); setPage(1); }}
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
        >
          Barchasi ({stats.total})
        </Button>
        <Button
          onClick={() => { setFilter('error'); setPage(1); }}
          variant={filter === 'error' ? 'default' : 'outline'}
          size="sm"
          className={filter === 'error' ? 'bg-red-600 hover:bg-red-700' : ''}
        >
          Errors ({stats.errors})
        </Button>
        <Button
          onClick={() => { setFilter('warning'); setPage(1); }}
          variant={filter === 'warning' ? 'default' : 'outline'}
          size="sm"
          className={filter === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
        >
          Warnings ({stats.warnings})
        </Button>
        <Button
          onClick={() => { setFilter('info'); setPage(1); }}
          variant={filter === 'info' ? 'default' : 'outline'}
          size="sm"
          className={filter === 'info' ? 'bg-blue-600 hover:bg-blue-700' : ''}
        >
          Info ({stats.info})
        </Button>
      </div>

      {/* Error List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white dark:bg-[#1C2C30] rounded-xl p-12 text-center shadow-sm border">
            <Loader2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Yuklanmoqda...</p>
          </div>
        ) : errors.length === 0 ? (
          <div className="bg-white dark:bg-[#1C2C30] rounded-xl p-12 text-center shadow-sm border">
            <Info className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              {filter === 'all' ? 'Hech qanday frontend xatolik yo\'q' : `${filter} xatoliklari yo'q`}
            </p>
          </div>
        ) : (
          <>
            {errors.map((error) => (
              <div
                key={error.id}
                className="bg-white dark:bg-[#1C2C30] rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                  {getIcon(error.level)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getLevelBadge(error.level)}>
                        {error.level.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(error.createdAt), 'dd.MM.yyyy HH:mm:ss')}
                      </span>
                      {error.ip && (
                        <span className="text-xs text-muted-foreground">
                          IP: {error.ip}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-[#212B36] dark:text-white">
                      {error.message}
                    </h3>
                  </div>
                  <Button
                    onClick={() => handleDelete(error.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <span className="text-muted-foreground">URL:</span>
                    <span className="text-[#212B36] dark:text-white break-all">
                      {error.url}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-muted-foreground">User Agent:</span>
                    <span className="text-[#212B36] dark:text-white break-all">
                      {error.userAgent}
                    </span>
                  </div>
                  {error.userId && (
                    <div className="flex gap-2">
                      <span className="text-muted-foreground">User ID:</span>
                      <span className="text-[#212B36] dark:text-white">
                        {error.userId}
                      </span>
                    </div>
                  )}
                </div>

                {/* Stack Trace */}
                {error.stack && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium text-[#00B8D9] hover:underline">
                      Stack Trace
                    </summary>
                    <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto">
                      {error.stack}
                    </pre>
                  </details>
                )}

                {/* Context */}
                {error.context && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium text-[#00B8D9] hover:underline">
                      Context
                    </summary>
                    <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto">
                      {JSON.stringify(error.context, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}

            {/* Pagination */}
            {data?.pagination && data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                >
                  Oldingi
                </Button>
                <span className="text-sm text-muted-foreground">
                  {page} / {data.pagination.totalPages}
                </span>
                <Button
                  onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                  variant="outline"
                  size="sm"
                  disabled={page === data.pagination.totalPages}
                >
                  Keyingi
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}







 * Frontend Errors Dashboard
 * 
 * Faqat frontend xatoliklari
 */

'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { logsService, ErrorLog } from '@/lib/services/logs.service';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, AlertTriangle, Info, Trash2, RefreshCw, Loader2, Monitor } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

export default function FrontendErrorsPage() {
  const [filter, setFilter] = useState<'all' | 'error' | 'warning' | 'info'>('all');
  const [page, setPage] = useState(1);
  const queryClient = useQueryClient();

  // Get frontend error logs from backend
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['frontend-errors', filter, page],
    queryFn: () => logsService.getAll({ source: 'frontend', level: filter, page, limit: 50 }),
    refetchInterval: 5000, // Har 5 soniyada yangilash
  });

  // Get stats (faqat frontend uchun)
  const { data: statsData } = useQuery({
    queryKey: ['frontend-errors-stats', filter],
    queryFn: async () => {
      const res = await logsService.getAll({ source: 'frontend', level: filter, limit: 1000 });
      const logs = res.logs;
      return {
        total: logs.length,
        errors: logs.filter(e => e.level === 'error').length,
        warnings: logs.filter(e => e.level === 'warning').length,
        info: logs.filter(e => e.level === 'info').length,
      };
    },
    refetchInterval: 10000,
    retry: 2,
    staleTime: 5000,
  });

  // Delete single error mutation
  const deleteMutation = useMutation({
    mutationFn: (id: number) => logsService.delete(id),
    onSuccess: () => {
      toast.success('Xatolik o\'chirildi');
      queryClient.invalidateQueries({ queryKey: ['frontend-errors'] });
      queryClient.invalidateQueries({ queryKey: ['frontend-errors-stats'] });
    },
    onError: () => {
      toast.error('Xatolikni o\'chirishda xatolik yuz berdi');
    },
  });

  const handleDelete = (id: number) => {
    if (confirm('Bu xatolikni o\'chirmoqchimisiz?')) {
      deleteMutation.mutate(id);
    }
  };

  const errors = data?.logs || [];
  const stats = statsData || {
    total: 0,
    errors: 0,
    warnings: 0,
    info: 0,
  };

  const getIcon = (level: string) => {
    switch (level) {
      case 'error': return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      case 'info': return <Info className="w-5 h-5 text-blue-500" />;
      default: return <AlertCircle className="w-5 h-5" />;
    }
  };

  const getLevelBadge = (level: string) => {
    const colors = {
      error: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300',
      info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300',
    };
    return colors[level as keyof typeof colors] || colors.error;
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Monitor className="w-8 h-8 text-[#00B8D9]" />
            <div>
              <h1 className="text-3xl font-bold text-[#212B36] dark:text-white">
                Frontend Errors
              </h1>
              <p className="text-muted-foreground mt-1">
                Frontend xatoliklari monitoring dashboard
              </p>
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            className="hover:bg-gray-100 dark:hover:bg-gray-800"
            disabled={isLoading}
          >
            <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Yangilash
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-[#1C2C30] rounded-xl p-6 shadow-sm border">
          <div className="text-sm text-muted-foreground mb-1">Jami</div>
          <div className="text-3xl font-bold text-[#212B36] dark:text-white">
            {stats.total}
          </div>
        </div>
        <div className="bg-white dark:bg-[#1C2C30] rounded-xl p-6 shadow-sm border">
          <div className="text-sm text-muted-foreground mb-1">Errors</div>
          <div className="text-3xl font-bold text-red-600">
            {stats.errors}
          </div>
        </div>
        <div className="bg-white dark:bg-[#1C2C30] rounded-xl p-6 shadow-sm border">
          <div className="text-sm text-muted-foreground mb-1">Warnings</div>
          <div className="text-3xl font-bold text-yellow-600">
            {stats.warnings}
          </div>
        </div>
        <div className="bg-white dark:bg-[#1C2C30] rounded-xl p-6 shadow-sm border">
          <div className="text-sm text-muted-foreground mb-1">Info</div>
          <div className="text-3xl font-bold text-blue-600">
            {stats.info}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <Button
          onClick={() => { setFilter('all'); setPage(1); }}
          variant={filter === 'all' ? 'default' : 'outline'}
          size="sm"
        >
          Barchasi ({stats.total})
        </Button>
        <Button
          onClick={() => { setFilter('error'); setPage(1); }}
          variant={filter === 'error' ? 'default' : 'outline'}
          size="sm"
          className={filter === 'error' ? 'bg-red-600 hover:bg-red-700' : ''}
        >
          Errors ({stats.errors})
        </Button>
        <Button
          onClick={() => { setFilter('warning'); setPage(1); }}
          variant={filter === 'warning' ? 'default' : 'outline'}
          size="sm"
          className={filter === 'warning' ? 'bg-yellow-600 hover:bg-yellow-700' : ''}
        >
          Warnings ({stats.warnings})
        </Button>
        <Button
          onClick={() => { setFilter('info'); setPage(1); }}
          variant={filter === 'info' ? 'default' : 'outline'}
          size="sm"
          className={filter === 'info' ? 'bg-blue-600 hover:bg-blue-700' : ''}
        >
          Info ({stats.info})
        </Button>
      </div>

      {/* Error List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white dark:bg-[#1C2C30] rounded-xl p-12 text-center shadow-sm border">
            <Loader2 className="w-12 h-12 text-muted-foreground mx-auto mb-4 animate-spin" />
            <p className="text-muted-foreground">Yuklanmoqda...</p>
          </div>
        ) : errors.length === 0 ? (
          <div className="bg-white dark:bg-[#1C2C30] rounded-xl p-12 text-center shadow-sm border">
            <Info className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
            <p className="text-muted-foreground">
              {filter === 'all' ? 'Hech qanday frontend xatolik yo\'q' : `${filter} xatoliklari yo'q`}
            </p>
          </div>
        ) : (
          <>
            {errors.map((error) => (
              <div
                key={error.id}
                className="bg-white dark:bg-[#1C2C30] rounded-xl p-6 shadow-sm border hover:shadow-md transition-shadow"
              >
                {/* Header */}
                <div className="flex items-start gap-3 mb-4">
                  {getIcon(error.level)}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge className={getLevelBadge(error.level)}>
                        {error.level.toUpperCase()}
                      </Badge>
                      <span className="text-sm text-muted-foreground">
                        {format(new Date(error.createdAt), 'dd.MM.yyyy HH:mm:ss')}
                      </span>
                      {error.ip && (
                        <span className="text-xs text-muted-foreground">
                          IP: {error.ip}
                        </span>
                      )}
                    </div>
                    <h3 className="font-semibold text-[#212B36] dark:text-white">
                      {error.message}
                    </h3>
                  </div>
                  <Button
                    onClick={() => handleDelete(error.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
                    disabled={deleteMutation.isPending}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                {/* Details */}
                <div className="space-y-2 text-sm">
                  <div className="flex gap-2">
                    <span className="text-muted-foreground">URL:</span>
                    <span className="text-[#212B36] dark:text-white break-all">
                      {error.url}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <span className="text-muted-foreground">User Agent:</span>
                    <span className="text-[#212B36] dark:text-white break-all">
                      {error.userAgent}
                    </span>
                  </div>
                  {error.userId && (
                    <div className="flex gap-2">
                      <span className="text-muted-foreground">User ID:</span>
                      <span className="text-[#212B36] dark:text-white">
                        {error.userId}
                      </span>
                    </div>
                  )}
                </div>

                {/* Stack Trace */}
                {error.stack && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium text-[#00B8D9] hover:underline">
                      Stack Trace
                    </summary>
                    <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto">
                      {error.stack}
                    </pre>
                  </details>
                )}

                {/* Context */}
                {error.context && (
                  <details className="mt-4">
                    <summary className="cursor-pointer text-sm font-medium text-[#00B8D9] hover:underline">
                      Context
                    </summary>
                    <pre className="mt-2 text-xs bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto">
                      {JSON.stringify(error.context, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}

            {/* Pagination */}
            {data?.pagination && data.pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 pt-4">
                <Button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                >
                  Oldingi
                </Button>
                <span className="text-sm text-muted-foreground">
                  {page} / {data.pagination.totalPages}
                </span>
                <Button
                  onClick={() => setPage(p => Math.min(data.pagination.totalPages, p + 1))}
                  variant="outline"
                  size="sm"
                  disabled={page === data.pagination.totalPages}
                >
                  Keyingi
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}











