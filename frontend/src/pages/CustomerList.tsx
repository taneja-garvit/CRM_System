import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { cn } from '@/lib/utils';

interface Customer {
  _id: string;
  name: string;
  email: string;
  totalSpend: number;
  visits: number;
  lastActive: string;
}

const CustomerList: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

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

    const fetchCustomers = async () => {
      try {
        console.log('Fetching customers with token:', token);
        const response = await axios.get('http://localhost:5000/api/customers', {
          headers: { Authorization: `Bearer ${token}` },
        });
        console.log('Fetch customers response:', response.data);
        setCustomers(response.data.customers);
        toast({
          title: 'Success',
          description: 'Customers fetched successfully!',
        });
      } catch (err: any) {
        console.error('Fetch customers error:', err);
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
          setError(err.response?.data?.error || 'Failed to fetch customers');
        }
      } finally {
        setLoading(false);
      }
    };

    console.log('Verifying token with /api/auth/user');
    axios.get('http://localhost:5000/api/auth/user', {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((response) => {
        console.log('Token verification response:', response.data);
        fetchCustomers();
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

  return (
    <div className="animate-fade-in">
      {/* Navigation Bar */}
      <nav className="bg-crm-softPurple/30 p-4">
        <ul className="flex space-x-4">
          <li>
            <a
              href="/ingest-customer"
              className={cn('text-crm-darkPurple', window.location.pathname === '/ingest-customer' && 'font-bold underline')}
            >
              Ingest Customer
            </a>
          </li>
          <li>
            <a
              href="/customers"
              className={cn('text-crm-darkPurple', window.location.pathname === '/customers' && 'font-bold underline')}
            >
              Customer List
            </a>
          </li>
          <li>
            <a
              href="/campaign-creation"
              className={cn('text-crm-darkPurple', window.location.pathname === '/campaign-creation' && 'font-bold underline')}
            >
              Campaign Creation
            </a>
          </li>
          <li>
            <a
              href="/campaign-history"
              className={cn('text-crm-darkPurple', window.location.pathname === '/campaign-history' && 'font-bold underline')}
            >
              Campaign History
            </a>
          </li>
        </ul>
      </nav>

      <Card className="max-w-4xl mx-auto shadow-md">
        <CardHeader className="bg-crm-softPurple/30">
          <CardTitle className="text-crm-darkPurple text-2xl">Customer List</CardTitle>
          <CardDescription>View all customers in the CRM</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          {loading && (
            <div className="text-center">Loading customers...</div>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {!loading && !error && customers.length === 0 && (
            <div className="text-center">No customers found.</div>
          )}

          {!loading && !error && customers.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Total Spend (₹)</TableHead>
                  <TableHead>Visits</TableHead>
                  <TableHead>Last Active</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customers.map((customer) => (
                  <TableRow key={customer._id}>
                    <TableCell>{customer.name}</TableCell>
                    <TableCell>{customer.email}</TableCell>
                    <TableCell>{customer.totalSpend.toLocaleString()}</TableCell>
                    <TableCell>{customer.visits}</TableCell>
                    <TableCell>{formatDate(customer.lastActive)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerList;