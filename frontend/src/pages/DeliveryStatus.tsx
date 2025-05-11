import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle, Backpack } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Loader from "@/components/Loader";
import { cn } from '@/lib/utils';

interface CommunicationLog {
  _id: string;
  campaignId: string;
  customerId: string;
  customerEmail: string;
  message: string;
  status: 'SENT' | 'FAILED' | 'PENDING';
  createdAt: string;
  error?: string;
}

const DeliveryStatus: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [logs, setLogs] = useState<CommunicationLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');
  const backend = import.meta.env.VITE_BACKEND_URL;


  useEffect(() => {
    const token = localStorage.getItem('auth_token');
    console.log('Token from localStorage:', token);

    if (!token) {
      console.log('No token found, redirecting to /login');
      navigate('/login');
      toast({
        title: 'Session expired',
        description: 'Please log in again.',
        variant: 'destructive',
      });
      return;
    }

    const fetchDeliveryLogs = async () => {
      try {
        console.log('Fetching delivery logs with token:', token);
        const response = await axios.get(`${backend}/api/delivery`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Fetch delivery logs response:', response.data);
        setLogs(response.data.logs);
        toast({
          title: 'Success',
          description: 'Delivery logs fetched successfully!',
        });
      } catch (err: any) {
        console.error('Fetch delivery logs error:', err);
        if (err.code === 'ERR_NETWORK') {
          setError('Cannot connect to the backend. Please ensure the server is running on http://localhost:5000.');
        } else if (err.response?.status === 401) {
          console.log('Unauthorized, clearing token and redirecting to /login');
          localStorage.removeItem('auth_token');
          navigate('/login');
          toast({
            title: 'Session expired',
            description: 'Please log in again.',
            variant: 'destructive',
          });
        } else {
          setError(err.response?.data?.error || 'Failed to fetch delivery logs');
        }
      } finally {
        setLoading(false);
      }
    };

    console.log('Verifying token with /api/auth/user');
    axios.get(`${backend}/api/auth/user`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        console.log('Token verification response:', response.data);
        fetchDeliveryLogs();
      })
      .catch((err) => {
        console.error('Token verification error:', err);
        if (err.code === 'ERR_NETWORK') {
          setError('Cannot connect to the backend. Please ensure the server is running on http://localhost:5000.');
          setLoading(false);
        } else {
          localStorage.removeItem('auth_token');
          navigate('/login');
          toast({
            title: 'Session expired',
            description: 'Please log in again.',
            variant: 'destructive',
          });
        }
      });
  }, [navigate, toast]);

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'SENT':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'FAILED':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

 return (
  <div className="animate-fade-in px-4 py-8 sm:px-6 lg:px-8 max-w-6xl mx-auto">
    <Card className="shadow-lg border border-gray-200 rounded-lg">
      <CardHeader className="bg-purple-50 border-b border-purple-200 rounded-t-lg">
        <CardTitle className="text-purple-600 text-2xl font-bold">📬 Delivery Status</CardTitle>
        <CardDescription className="text-gray-700">
          Track the status of communications sent to customers
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        {loading && (
          <div className="flex justify-center items-center py-12">
            <Loader size="large" />
          </div>
        )}

        {error && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-5 w-5" />
            <AlertTitle className="font-semibold">Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {!loading && !error && logs.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            <p>No delivery logs found.</p>
          </div>
        )}

        {!loading && !error && logs.length > 0 && (
          <div className="overflow-auto rounded-lg border border-gray-100">
            <Table className="min-w-full text-sm">
              <TableHeader className="bg-gray-100 text-gray-700">
                <TableRow>
                  <TableHead>Customer Email</TableHead>
                  <TableHead>Message</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Sent At</TableHead>
                  <TableHead>Error</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {logs.map((log, index) => (
                  <TableRow
                    key={log._id}
                    className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}
                  >
                    <TableCell className="py-3">{log.customerEmail}</TableCell>
                    <TableCell className="py-3 max-w-md truncate">{log.message}</TableCell>
                    <TableCell className="py-3">
                      <Badge
                        variant="outline"
                        className={cn(
                          'text-xs px-2 py-1 rounded-full border',
                          getStatusVariant(log.status)
                        )}
                      >
                        {log.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="py-3">{formatDate(log.createdAt)}</TableCell>
                    <TableCell className="py-3">{log.error || <span className="text-gray-400">-</span>}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  </div>
);

};

export default DeliveryStatus;