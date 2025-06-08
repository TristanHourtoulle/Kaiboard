"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { RoleBadge } from "@/components/ui/role-badge";
import { format } from "date-fns";
import { 
  Search, 
  Filter, 
  RefreshCw, 
  Eye, 
  Activity,
  Clock,
  Globe,
  AlertCircle,
  CheckCircle,
  XCircle,
  ChevronLeft,
  ChevronRight,
  Settings,
  Calendar,
  RotateCcw
} from "lucide-react";

interface RequestLog {
  id: string;
  method: string;
  url: string;
  path: string;
  statusCode: number | null;
  responseTime: number | null;
  userAgent: string | null;
  ipAddress: string | null;
  userId: string | null;
  requestBody: string | null;
  queryParams: string | null;
  headers: string | null;
  errorMessage: string | null;
  timestamp: string;
  user: {
    id: string;
    name: string | null;
    email: string | null;
    role: string | null;
  } | null;
}

interface LogsResponse {
  logs: RequestLog[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
  stats: {
    totalRequests: number;
    averageResponseTime: number;
    methodDistribution: { method: string; count: number }[];
    statusDistribution: { status: number | null; count: number }[];
  };
}

export function AdminLogsClient() {
  const [logs, setLogs] = useState<RequestLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 50,
    totalCount: 0,
    totalPages: 0,
    hasNext: false,
    hasPrev: false
  });
  const [stats, setStats] = useState({
    totalRequests: 0,
    averageResponseTime: 0,
    methodDistribution: [] as { method: string; count: number }[],
    statusDistribution: [] as { status: number | null; count: number }[]
  });

  // Filters
  const [search, setSearch] = useState("");
  const [timeRange, setTimeRange] = useState("30m"); // Quick time range filter
  const [methodFilter, setMethodFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  
  // Advanced filters popover
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Detail dialog
  const [selectedLog, setSelectedLog] = useState<RequestLog | null>(null);
  const [showDetails, setShowDetails] = useState(false);

  // Quick time range options
  const getTimeRangeFilter = (range: string) => {
    const now = new Date();
    switch (range) {
      case "30m":
        return { startDate: new Date(now.getTime() - 30 * 60 * 1000).toISOString() };
      case "1h":
        return { startDate: new Date(now.getTime() - 60 * 60 * 1000).toISOString() };
      case "24h":
        return { startDate: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString() };
      case "7d":
        return { startDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString() };
      default:
        return {};
    }
  };

  const fetchLogs = async () => {
    setLoading(true);
    try {
      // Get time range filter if quick filter is selected
      const timeRangeFilter = timeRange !== "all" ? getTimeRangeFilter(timeRange) : {};
      
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        ...(search && { search }),
        ...(methodFilter && methodFilter !== "all" && { method: methodFilter }),
        ...(statusFilter && statusFilter !== "all" && { status: statusFilter }),
        // Use custom date range if set, otherwise use quick time range
        ...(startDate && { startDate }),
        ...(endDate && { endDate }),
        ...(timeRangeFilter.startDate && !startDate && { startDate: timeRangeFilter.startDate })
      });

      const response = await fetch(`/api/admin/logs?${params}`);
      if (response.ok) {
        const data: LogsResponse = await response.json();
        setLogs(data.logs);
        setPagination(data.pagination);
        setStats(data.stats);
      } else {
        console.error('Failed to fetch logs');
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [pagination.page, search, timeRange, methodFilter, statusFilter, startDate, endDate]);

  const getStatusBadge = (statusCode: number | null) => {
    if (!statusCode) return <Badge variant="secondary">Unknown</Badge>;
    
    if (statusCode >= 200 && statusCode < 300) {
      return <Badge className="bg-green-100 text-green-800">
        <CheckCircle className="w-3 h-3 mr-1" />
        {statusCode}
      </Badge>;
    } else if (statusCode >= 400 && statusCode < 500) {
      return <Badge className="bg-yellow-100 text-yellow-800">
        <AlertCircle className="w-3 h-3 mr-1" />
        {statusCode}
      </Badge>;
    } else if (statusCode >= 500) {
      return <Badge className="bg-red-100 text-red-800">
        <XCircle className="w-3 h-3 mr-1" />
        {statusCode}
      </Badge>;
    } else {
      return <Badge variant="outline">{statusCode}</Badge>;
    }
  };

  const getMethodBadge = (method: string) => {
    const colors = {
      GET: "bg-blue-100 text-blue-800",
      POST: "bg-green-100 text-green-800", 
      PUT: "bg-yellow-100 text-yellow-800",
      DELETE: "bg-red-100 text-red-800",
      PATCH: "bg-purple-100 text-purple-800"
    };
    
    return (
      <Badge className={colors[method as keyof typeof colors] || "bg-gray-100 text-gray-800"}>
        {method}
      </Badge>
    );
  };

  const formatDuration = (ms: number | null) => {
    if (!ms) return 'N/A';
    if (ms < 1000) return `${ms}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const openDetails = (log: RequestLog) => {
    setSelectedLog(log);
    setShowDetails(true);
  };

  const resetFilters = () => {
    setSearch("");
    setTimeRange("30m");
    setMethodFilter("all");
    setStatusFilter("all");
    setStartDate("");
    setEndDate("");
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold text-blue-600">{stats.totalRequests}</p>
                <p className="text-sm text-muted-foreground">Total Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold text-green-600">{stats.averageResponseTime}ms</p>
                <p className="text-sm text-muted-foreground">Avg Response Time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Globe className="w-5 h-5 text-purple-500" />
              <div>
                <p className="text-2xl font-bold text-purple-600">
                  {stats.methodDistribution.find(m => m.method === 'GET')?.count || 0}
                </p>
                <p className="text-sm text-muted-foreground">GET Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold text-red-600">
                  {stats.statusDistribution.filter(s => s.status && s.status >= 400).reduce((acc, s) => acc + s.count, 0)}
                </p>
                <p className="text-sm text-muted-foreground">Error Requests</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Simple Filters Bar */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Left side - Search and Time Range */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
              {/* Search */}
              <div className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search URL, IP, error message..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              {/* Quick Time Range */}
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-36">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All time</SelectItem>
                    <SelectItem value="30m">Last 30 min</SelectItem>
                    <SelectItem value="1h">Last hour</SelectItem>
                    <SelectItem value="24h">Last 24h</SelectItem>
                    <SelectItem value="7d">Last 7 days</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            {/* Right side - Action buttons */}
            <div className="flex items-center gap-2">
              {/* Advanced Filters Popover */}
              <Popover open={showAdvancedFilters} onOpenChange={setShowAdvancedFilters}>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Settings className="w-4 h-4 mr-2" />
                    Advanced
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-80 p-4" align="end">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium">HTTP Method</Label>
                      <Select value={methodFilter} onValueChange={setMethodFilter}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="All methods" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All methods</SelectItem>
                          <SelectItem value="GET">GET</SelectItem>
                          <SelectItem value="POST">POST</SelectItem>
                          <SelectItem value="PUT">PUT</SelectItem>
                          <SelectItem value="DELETE">DELETE</SelectItem>
                          <SelectItem value="PATCH">PATCH</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div>
                      <Label className="text-sm font-medium">Status Code</Label>
                      <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="All statuses" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All statuses</SelectItem>
                          <SelectItem value="200">200 - Success</SelectItem>
                          <SelectItem value="400">400 - Bad Request</SelectItem>
                          <SelectItem value="401">401 - Unauthorized</SelectItem>
                          <SelectItem value="403">403 - Forbidden</SelectItem>
                          <SelectItem value="404">404 - Not Found</SelectItem>
                          <SelectItem value="500">500 - Server Error</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <Label className="text-sm font-medium">Start Date</Label>
                        <Input
                          type="date"
                          value={startDate}
                          onChange={(e) => setStartDate(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label className="text-sm font-medium">End Date</Label>
                        <Input
                          type="date"
                          value={endDate}
                          onChange={(e) => setEndDate(e.target.value)}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="flex justify-between pt-2">
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={resetFilters}
                      >
                        <RotateCcw className="w-4 h-4 mr-2" />
                        Reset
                      </Button>
                      <Button 
                        size="sm"
                        onClick={() => setShowAdvancedFilters(false)}
                      >
                        Apply Filters
                      </Button>
                    </div>
                  </div>
                </PopoverContent>
              </Popover>
              
              {/* Refresh button */}
              <Button onClick={fetchLogs} disabled={loading} size="sm">
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Request Logs</CardTitle>
          <CardDescription>
            {pagination.totalCount} total requests
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Method</TableHead>
                  <TableHead>Path</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>IP</TableHead>
                  <TableHead>Response Time</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  Array.from({ length: 10 }).map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                      <TableCell><div className="h-4 bg-gray-200 rounded animate-pulse"></div></TableCell>
                    </TableRow>
                  ))
                ) : logs.map((log) => (
                  <TableRow key={log.id} className="hover:bg-muted/50">
                    <TableCell className="font-mono text-sm">
                      {format(new Date(log.timestamp), 'MMM dd, HH:mm:ss')}
                    </TableCell>
                    <TableCell>
                      {getMethodBadge(log.method)}
                    </TableCell>
                    <TableCell className="font-mono text-sm max-w-xs truncate">
                      {log.path}
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(log.statusCode)}
                    </TableCell>
                    <TableCell>
                      {log.user ? (
                        <div className="flex items-center gap-2">
                          <span className="text-sm">{log.user.name || log.user.email}</span>
                          {log.user.role && <RoleBadge role={log.user.role} size="sm" showTitle={false} />}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">Anonymous</span>
                      )}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {log.ipAddress || 'N/A'}
                    </TableCell>
                    <TableCell>
                      {formatDuration(log.responseTime)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openDetails(log)}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <div className="text-sm text-muted-foreground">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.totalCount)} of {pagination.totalCount} entries
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={!pagination.hasPrev}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <span className="text-sm">
                Page {pagination.page} of {pagination.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={!pagination.hasNext}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Details Dialog */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white dark:bg-gray-900 border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
            <DialogDescription>
              Detailed information about the selected request
            </DialogDescription>
          </DialogHeader>
          
          {selectedLog && (
            <div className="space-y-6">
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Method</Label>
                  <div className="mt-1">{getMethodBadge(selectedLog.method)}</div>
                </div>
                <div>
                  <Label>Status Code</Label>
                  <div className="mt-1">{getStatusBadge(selectedLog.statusCode)}</div>
                </div>
                <div>
                  <Label>Response Time</Label>
                  <div className="mt-1">{formatDuration(selectedLog.responseTime)}</div>
                </div>
                <div>
                  <Label>Timestamp</Label>
                  <div className="mt-1 font-mono text-sm">
                    {format(new Date(selectedLog.timestamp), 'PPpp')}
                  </div>
                </div>
              </div>

              {/* URL Info */}
              <div>
                <Label>Full URL</Label>
                <div className="mt-1 p-3 bg-muted rounded-md font-mono text-sm break-all">
                  {selectedLog.url}
                </div>
              </div>

              {/* User Info */}
              {selectedLog.user && (
                <div>
                  <Label>User</Label>
                  <div className="mt-1 flex items-center gap-2">
                    <span>{selectedLog.user.name || selectedLog.user.email}</span>
                    {selectedLog.user.role && <RoleBadge role={selectedLog.user.role} size="sm" />}
                  </div>
                </div>
              )}

              {/* IP and User Agent */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <Label>IP Address</Label>
                  <div className="mt-1 font-mono text-sm">{selectedLog.ipAddress || 'N/A'}</div>
                </div>
                <div>
                  <Label>User Agent</Label>
                  <div className="mt-1 text-sm break-all">{selectedLog.userAgent || 'N/A'}</div>
                </div>
              </div>

              {/* Request Body */}
              {selectedLog.requestBody && (
                <div>
                  <Label>Request Body</Label>
                  <pre className="mt-1 p-3 bg-muted rounded-md text-sm overflow-x-auto">
                    {JSON.stringify(JSON.parse(selectedLog.requestBody), null, 2)}
                  </pre>
                </div>
              )}

              {/* Query Parameters */}
              {selectedLog.queryParams && (
                <div>
                  <Label>Query Parameters</Label>
                  <pre className="mt-1 p-3 bg-muted rounded-md text-sm overflow-x-auto">
                    {JSON.stringify(JSON.parse(selectedLog.queryParams), null, 2)}
                  </pre>
                </div>
              )}

              {/* Headers */}
              {selectedLog.headers && (
                <div>
                  <Label>Headers</Label>
                  <pre className="mt-1 p-3 bg-muted rounded-md text-sm overflow-x-auto">
                    {JSON.stringify(JSON.parse(selectedLog.headers), null, 2)}
                  </pre>
                </div>
              )}

              {/* Error Message */}
              {selectedLog.errorMessage && (
                <div>
                  <Label>Error Message</Label>
                  <div className="mt-1 p-3 bg-red-50 border border-red-200 rounded-md text-sm text-red-800">
                    {selectedLog.errorMessage}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
} 