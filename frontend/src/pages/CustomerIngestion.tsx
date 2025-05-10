import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { AlertCircle, ChevronDown, ChevronUp } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { cn } from '@/lib/utils';

interface CustomerData {
  name: string;
  email: string;
  totalSpend: number;
  visits: number;
  lastActive: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  totalSpend?: string;
  visits?: string;
  lastActive?: string;
}

const CustomerIngestion: React.FC = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState<CustomerData>({
    name: '',
    email: '',
    totalSpend: 0,
    visits: 0,
    lastActive: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState<boolean>(false);

  // Verify authentication on mount
  // useEffect(() => {
  //   const token = localStorage.getItem('token');
  //   if (!token) {
  //     navigate('/login');
  //     return;
  //   }
  //   axios.get('http://localhost:5000/api/auth/user', {
  //     headers: { Authorization: `Bearer ${token}` },
  //   }).catch(() => {
  //     localStorage.removeItem('token');
  //     navigate('/login');
  //   });
  // }, [navigate]);

  // Validate form inputs
  const validateForm = (): FormErrors => {
    const newErrors: FormErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    if (formData.totalSpend < 0) {
      newErrors.totalSpend = 'Must be positive';
    }
    if (formData.visits < 0 || !Number.isInteger(formData.visits)) {
      newErrors.visits = 'Must be a positive integer';
    }
    if (formData.lastActive && isNaN(new Date(formData.lastActive).getTime())) {
      newErrors.lastActive = 'Invalid date';
    }
    return newErrors;
  };

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === 'totalSpend' || name === 'visits' ? Number(value) : value,
    }));
  };

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setMessage('');
    setError('');
    try {
      const token = localStorage.getItem('token');
      const response = await axios.post('http://localhost:5000/api/customers', {
        ...formData,
        lastActive: formData.lastActive || undefined, // Send undefined if empty
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });
      setMessage(response.data.message);
      setCustomer(response.data.customer);
      setFormData({
        name: '',
        email: '',
        totalSpend: 0,
        visits: 0,
        lastActive: '',
      });
      setErrors({});
      toast({
        title: 'Success',
        description: `Customer ${response.data.customer.name} created successfully!`,
      });
      setIsConfirmOpen(false);
    } catch (err: any) {
      if (err.response?.status === 401) {
        localStorage.removeItem('token');
        navigate('/login');
      } else if (err.response?.status === 400) {
        setError(err.response.data.error);
      } else {
        setError('Failed to ingest customer');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form validation before opening confirmation modal
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validateForm();
    setErrors(validationErrors);
    if (Object.keys(validationErrors).length === 0) {
      setIsConfirmOpen(true);
    }
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

      <Card className="max-w-2xl mx-auto shadow-md">
        <CardHeader className="bg-crm-softPurple/30">
          <CardTitle className="text-crm-darkPurple text-2xl">Ingest Customer Data</CardTitle>
          <CardDescription>Add a single customer to the CRM</CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleFormSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Customer Name</Label>
                <Input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
                {errors.name && (
                  <div className="text-red-500 text-sm">{errors.name}</div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  required
                />
                {errors.email && (
                  <div className="text-red-500 text-sm">{errors.email}</div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="totalSpend">Total Spend (₹)</Label>
                <Input
                  id="totalSpend"
                  type="number"
                  name="totalSpend"
                  value={formData.totalSpend}
                  onChange={handleInputChange}
                />
                {errors.totalSpend && (
                  <div className="text-red-500 text-sm">{errors.totalSpend}</div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="visits">Number of Visits</Label>
                <Input
                  id="visits"
                  type="number"
                  name="visits"
                  value={formData.visits}
                  onChange={handleInputChange}
                />
                {errors.visits && (
                  <div className="text-red-500 text-sm">{errors.visits}</div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastActive">Last Active Date</Label>
              <Input
                id="lastActive"
                type="datetime-local"
                name="lastActive"
                value={formData.lastActive}
                onChange={handleInputChange}
              />
              {errors.lastActive && (
                <div className="text-red-500 text-sm">{errors.lastActive}</div>
              )}
            </div>

            {message && (
              <Alert className="bg-green-50 border-green-200">
                <AlertTitle className="text-green-800 flex items-center gap-2">
                  Success
                </AlertTitle>
                <AlertDescription className="text-green-700">
                  {message}
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>
                  {error}
                </AlertDescription>
              </Alert>
            )}

            <CardFooter className="px-0 pt-4 flex space-x-2">
              <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
                <DialogTrigger asChild>
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? 'Processing...' : 'Ingest Customer Data'}
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Confirm Submission</DialogTitle>
                    <DialogDescription>
                      Are you sure you want to ingest this customer data? Please review the details:
                      <ul className="mt-2">
                        <li><strong>Name:</strong> {formData.name}</li>
                        <li><strong>Email:</strong> {formData.email}</li>
                        <li><strong>Total Spend:</strong> ₹{formData.totalSpend}</li>
                        <li><strong>Visits:</strong> {formData.visits}</li>
                        <li><strong>Last Active:</strong> {formData.lastActive ? new Date(formData.lastActive).toLocaleString() : 'Not set'}</li>
                      </ul>
                    </DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSubmit}>
                      Confirm
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
              <Button
                type="button"
                variant="outline"
                onClick={() => setFormData({ name: '', email: '', totalSpend: 0, visits: 0, lastActive: '' })}
                disabled={isSubmitting}
              >
                Clear
              </Button>
            </CardFooter>
          </form>

          {customer && (
            <Collapsible
              open={isCollapsibleOpen}
              onOpenChange={setIsCollapsibleOpen}
              className="mt-4"
            >
              <CollapsibleTrigger className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">Created Customer Details</h2>
                {isCollapsibleOpen ? <ChevronUp /> : <ChevronDown />}
              </CollapsibleTrigger>
              <CollapsibleContent className="mt-2">
                <p><strong>Name:</strong> {customer.name}</p>
                <p><strong>Email:</strong> {customer.email}</p>
                <p><strong>Total Spend:</strong> ₹{customer.totalSpend}</p>
                <p><strong>Visits:</strong> {customer.visits}</p>
                <p><strong>Last Active:</strong> {customer.lastActive ? new Date(customer.lastActive).toLocaleString() : 'Not set'}</p>
              </CollapsibleContent>
            </Collapsible>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CustomerIngestion;