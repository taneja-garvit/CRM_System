import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import Loader from "@/components/Loader";
import { PlusCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import axios from 'axios';

// Campaign type definition
interface Campaign {
  id: string;
  message: string;
  audienceSize: number;
  createdAt: string;
  stats: {
    sent: number;
    failed: number;
  };
}

export default function CampaignListPage() {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();
  const backend = import.meta.env.VITE_BACKEND_URL;
  const token = localStorage.getItem('auth_token');


  useEffect(() => {
    // Fetch campaigns when component mounts
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    
    try {
      // Fetch campaigns from backend API
      const response = await axios.get(`${backend}/api/campaigns`,  {
          headers: { Authorization: `Bearer ${token}` },
        });
      const backendCampaigns = response.data;
      
      // Map backend data to frontend Campaign interface
      const mappedCampaigns: Campaign[] = backendCampaigns.map((campaign: any) => ({
        id: campaign._id,
        message: campaign.message,
        audienceSize: campaign.audienceSize,
        createdAt: campaign.createdAt,
        stats: {
          sent: campaign.communicationLogs?.filter((log: any) => log.status === 'SENT').length || 0,
          failed: campaign.communicationLogs?.filter((log: any) => log.status === 'FAILED').length || 0,
        },
      }));
      
      setCampaigns(mappedCampaigns);
    } catch (error) {
      if (error.response?.status === 401) {
        localStorage.removeItem('auth_token');
        navigate('/');
        toast({
          title: "Session expired",
          description: "Please log in again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Failed to fetch campaigns",
          description: "There was an error loading campaigns. Please try again.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const options: Intl.DateTimeFormatOptions = { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
  <div className="max-w-6xl mx-auto px-6 py-10 animate-fade-in">
    <div className="flex justify-between items-center mb-8">
      <h1 className="text-4xl font-bold text-purple-600">📊 Campaign History</h1>
      <Button
        onClick={() => navigate('/campaigns/create')}
        className="bg-purple-600 hover:bg-purple-700 text-white transition-all"
      >
        <PlusCircle className="mr-2 h-5 w-5" />
        New Campaign
      </Button>
    </div>

    <Card className="shadow-lg border border-gray-200 rounded-lg">
      <CardContent className="p-0">
        {isLoading ? (
          <div className="flex justify-center items-center py-16">
            <Loader size="large" />
          </div>
        ) : campaigns.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500 text-lg mb-6">No campaigns found</p>
            <Button
              onClick={() => navigate('/campaigns/create')}
              className="bg-purple-600 hover:bg-purple-700 text-white transition-all"
            >
              Create Your First Campaign
            </Button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table className="min-w-full divide-y divide-gray-200">
              <TableHeader>
                <TableRow className="bg-gray-100 text-gray-700">
                  <TableHead className="w-[320px] font-semibold">Message</TableHead>
                  <TableHead className="font-semibold">Audience Size</TableHead>
                  <TableHead className="font-semibold">Sent</TableHead>
                  <TableHead className="font-semibold">Failed</TableHead>
                  <TableHead className="font-semibold">Created At</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow 
                    key={campaign.id}
                    className="hover:bg-gray-50 transition-colors"
                  >
                    <TableCell className="font-medium text-gray-800">
                      {campaign.message.length > 40 
                        ? `${campaign.message.substring(0, 40)}...` 
                        : campaign.message}
                    </TableCell>
                    <TableCell className="text-gray-700">{campaign.audienceSize.toLocaleString()}</TableCell>
                    <TableCell className="text-gray-700">{campaign.stats.sent.toLocaleString()}</TableCell>
                    <TableCell className={campaign.stats.failed > 0 ? "text-red-600 font-semibold" : "text-gray-700"}>
                      {campaign.stats.failed.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-gray-600">{formatDate(campaign.createdAt)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className="bg-green-100 text-green-800 border border-green-300 px-2 py-1 text-sm"
                      >
                        Completed
                      </Badge>
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

}