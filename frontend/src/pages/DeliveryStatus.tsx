import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Loader from "@/components/Loader";
import { Check, Clock } from "lucide-react";

interface CommunicationLog {
  _id: string;
  campaignId: string;
  customerId: string;
  status: 'SENT' | 'FAILED';
  createdAt: string;
}

interface Customer {
  _id: string;
  name: string;
  email: string;
}

const DeliveryStatus: React.FC = () => {
  const { campaignId } = useParams<{ campaignId: string }>();
  const [logs, setLogs] = useState<CommunicationLog[]>([]);
  const [customers, setCustomers] = useState<{ [key: string]: Customer }>({});
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchLogs = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Please log in to view delivery status');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`http://localhost:5000/api/campaigns/${campaignId}/logs`, {
          headers: { 'Authorization': `Bearer ${token}` },
        });
        if (!response.ok) throw new Error('Failed to fetch delivery logs');
        const data: CommunicationLog[] = await response.json();
        setLogs(data);

        // Fetch customer details for logs
        const customerIds = [...new Set(data.map(log => log.customerId))];
        const customerResponse = await fetch('http://localhost:5000/api/customers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ customerIds }),
        });
        if (!customerResponse.ok) throw new Error('Failed to fetch customers');
        const customerData: Customer[] = await customerResponse.json();
        const customerMap = customerData.reduce((map, customer) => ({
          ...map,
          [customer._id]: customer,
        }), {});
        setCustomers(customerMap);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (campaignId) fetchLogs();
  }, [campaignId]);

  // Function to render status badge with appropriate styling
  const renderStatusBadge = (status: 'SENT' | 'FAILED') => {
    if (status === 'SENT') {
      return (
        <Badge className="bg-green-500 hover:bg-green-600">
          <Check className="h-3 w-3 mr-1" />
          Sent
        </Badge>
      );
    } else {
      return (
        <Badge variant="destructive">
          <Clock className="h-3 w-3 mr-1" />
          Failed
        </Badge>
      );
    }
  };

  return (
    <div className="animate-fade-in">
      <Card className="shadow-md">
        <CardHeader className="border-b bg-crm-lightGray">
          <CardTitle className="text-xl text-crm-darkPurple">
            Delivery Status for Campaign
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          {loading && (
            <div className="flex justify-center items-center py-12">
              <Loader size="large" className="border-crm-purple" />
            </div>
          )}
          
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          
          {!loading && logs.length === 0 && !error && (
            <div className="text-center py-8 text-muted-foreground">
              <p>No delivery logs found for this campaign.</p>
            </div>
          )}
          
          {!loading && logs.length > 0 && (
            <div className="rounded-md border shadow-sm overflow-hidden">
              <Table>
                <TableHeader className="bg-crm-lightGray">
                  <TableRow>
                    <TableHead className="font-semibold text-crm-darkPurple">Customer Name</TableHead>
                    <TableHead className="font-semibold text-crm-darkPurple">Email</TableHead>
                    <TableHead className="font-semibold text-crm-darkPurple">Status</TableHead>
                    <TableHead className="font-semibold text-crm-darkPurple">Sent At</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map(log => (
                    <TableRow key={log._id} className="hover:bg-crm-softPurple/20">
                      <TableCell className="font-medium">
                        {customers[log.customerId]?.name || 'Unknown'}
                      </TableCell>
                      <TableCell>{customers[log.customerId]?.email || 'Unknown'}</TableCell>
                      <TableCell>{renderStatusBadge(log.status)}</TableCell>
                      <TableCell>
                        {new Date(log.createdAt).toLocaleString()}
                      </TableCell>
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