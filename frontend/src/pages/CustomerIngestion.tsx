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
  totalSpend: number | '';
  visits: number | '';
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
    totalSpend: '',
    visits: '',
    lastActive: '',
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [customer, setCustomer] = useState<CustomerData | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [isCollapsibleOpen, setIsCollapsibleOpen] = useState<boolean>(false);
  const backend = import.meta.env.VITE_BACKEND_URL;


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
    if (formData.totalSpend !== '' && Number(formData.totalSpend) < 0) {
      newErrors.totalSpend = 'Must be positive';
    }
    if (formData.visits !== '' && (Number(formData.visits) < 0 || !Number.isInteger(Number(formData.visits)))) {
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
      [name]: name === 'totalSpend' || name === 'visits' ? (value === '' ? '' : Number(value)) : value,
    }));
  };

  // Handle date selection
  const handleDateSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({
      ...prev,
      lastActive: e.target.value,
    }));
    // Force blur to close the datetime picker
    e.target.blur();
  };

  // Handle form submission
  const handleSubmit = async () => {
    setIsSubmitting(true);
    setMessage('');
    setError('');
    try {
      const token = localStorage.getItem('auth_token');
      const submitData = {
        ...formData,
        totalSpend: formData.totalSpend === '' ? 0 : formData.totalSpend,
        visits: formData.visits === '' ? 0 : formData.visits,
        lastActive: formData.lastActive || undefined,
      };
      const response = await axios.post(`${backend}/api/customers`, submitData, {
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
        totalSpend: '',
        visits: '',
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
  <div className="animate-fade-in px-4 py-8 sm:px-6 lg:px-8 max-w-3xl mx-auto">
    <Card className="shadow-xl border border-gray-200">
      <CardHeader className="bg-purple-50 border-b border-purple-200 rounded-t-lg">
        <CardTitle className="text-purple-600 text-2xl font-bold">👤 Ingest Customer Data</CardTitle>
        <CardDescription className="text-gray-700">
          Add a single customer to your CRM system
        </CardDescription>
      </CardHeader>

      <CardContent className="pt-6">
        <form onSubmit={handleFormSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="name">Customer Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleInputChange} />
              {errors.name && <p className="text-sm text-red-600">{errors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" name="email" value={formData.email} onChange={handleInputChange} />
              {errors.email && <p className="text-sm text-red-600">{errors.email}</p>}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="totalSpend">Total Spend (₹)</Label>
              <Input id="totalSpend" name="totalSpend" type="number" value={formData.totalSpend} onChange={handleInputChange} />
              {errors.totalSpend && <p className="text-sm text-red-600">{errors.totalSpend}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="visits">Number of Visits</Label>
              <Input id="visits" name="visits" type="number" value={formData.visits} onChange={handleInputChange} />
              {errors.visits && <p className="text-sm text-red-600">{errors.visits}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastActive">Last Active Date</Label>
            <Input id="lastActive" type="datetime-local" name="lastActive" value={formData.lastActive} onChange={handleDateSelect} />
            {errors.lastActive && <p className="text-sm text-red-600">{errors.lastActive}</p>}
          </div>

          {message && (
            <Alert className="bg-green-50 border-green-300">
              <AlertTitle className="text-green-700 font-semibold">Success</AlertTitle>
              <AlertDescription className="text-green-600">{message}</AlertDescription>
            </Alert>
          )}

          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <CardFooter className="px-0 pt-4 flex justify-between">
            <Dialog open={isConfirmOpen} onOpenChange={setIsConfirmOpen}>
              <DialogTrigger asChild>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white" disabled={isSubmitting}>
                  {isSubmitting ? 'Processing...' : 'Ingest Customer Data'}
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-lg font-semibold">Confirm Submission</DialogTitle>
                  <DialogDescription className="text-sm text-gray-600">
                    Please confirm the details before submitting:
                  </DialogDescription>
                  <ul className="mt-4 space-y-1 text-sm text-gray-800">
                    <li><strong>Name:</strong> {formData.name}</li>
                    <li><strong>Email:</strong> {formData.email}</li>
                    <li><strong>Total Spend:</strong> ₹{formData.totalSpend || 0}</li>
                    <li><strong>Visits:</strong> {formData.visits || 0}</li>
                    <li><strong>Last Active:</strong> {formData.lastActive ? new Date(formData.lastActive).toLocaleString() : 'Not set'}</li>
                  </ul>
                </DialogHeader>
                <DialogFooter className="mt-4">
                  <Button variant="outline" onClick={() => setIsConfirmOpen(false)}>Cancel</Button>
                  <Button onClick={handleSubmit}>Confirm</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            <Button
              type="button"
              variant="ghost"
              onClick={() => setFormData({ name: '', email: '', totalSpend: '', visits: '', lastActive: '' })}
              disabled={isSubmitting}
              className="text-gray-700 hover:text-black"
            >
              Clear Form
            </Button>
          </CardFooter>
        </form>

        {customer && (
          <Collapsible
            open={isCollapsibleOpen}
            onOpenChange={setIsCollapsibleOpen}
            className="mt-8 bg-gray-50 border border-gray-200 rounded-md p-4"
          >
            <CollapsibleTrigger className="flex items-center justify-between w-full cursor-pointer">
              <h2 className="text-md font-medium text-gray-700">Created Customer Details</h2>
              {isCollapsibleOpen ? <ChevronUp className="text-gray-500" /> : <ChevronDown className="text-gray-500" />}
            </CollapsibleTrigger>
            <CollapsibleContent className="mt-4 text-sm text-gray-800 space-y-1">
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