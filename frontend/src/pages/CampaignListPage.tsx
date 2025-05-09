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

  useEffect(() => {
    // Fetch campaigns when component mounts
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setIsLoading(true);
    
    try {
      // Fetch campaigns from backend API
      const response = await axios.get('http://localhost:5000/api/campaigns');
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
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-crm-darkPurple">Campaign History</h1>
        <Button 
          onClick={() => navigate('/campaigns/create')}
          className="bg-crm-purple hover:bg-crm-darkPurple text-white"
        >
          <PlusCircle className="mr-2 h-4 w-4" />
          New Campaign
        </Button>
      </div>
      
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center py-12">
              <Loader size="large" />
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground mb-4">No campaigns found</p>
              <Button 
                onClick={() => navigate('/campaigns/create')}
                className="bg-crm-purple hover:bg-crm-darkPurple text-white"
              >
                Create Your First Campaign
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Message</TableHead>
                  <TableHead>Audience Size</TableHead>
                  <TableHead>Sent</TableHead>
                  <TableHead>Failed</TableHead>
                  <TableHead>Created At</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">
                      {campaign.message.length > 40 
                        ? `${campaign.message.substring(0, 40)}...` 
                        : campaign.message}
                    </TableCell>
                    <TableCell>{campaign.audienceSize.toLocaleString()}</TableCell>
                    <TableCell>{campaign.stats.sent.toLocaleString()}</TableCell>
                    <TableCell className={campaign.stats.failed > 0 ? "text-destructive" : ""}>
                      {campaign.stats.failed.toLocaleString()}
                    </TableCell>
                    <TableCell>{formatDate(campaign.createdAt)}</TableCell>
                    <TableCell>
                      <Badge 
                        variant="outline" 
                        className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200"
                      >
                        Completed
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}