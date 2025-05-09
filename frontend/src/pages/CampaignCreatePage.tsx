import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import RuleBuilder, { RuleGroup } from "@/components/campaigns/RuleBuilder";
import { useToast } from "@/hooks/use-toast";
import Loader from "@/components/Loader";
import axios from 'axios';

export default function CampaignCreatePage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [audienceSize, setAudienceSize] = useState(0);
  const [ruleGroup, setRuleGroup] = useState<RuleGroup>({
    id: "group-1",
    rules: [],
    combinator: "AND"
  });

  // Fetch audience size when ruleGroup changes
  useEffect(() => {
    if (ruleGroup.rules.length === 0) {
      setAudienceSize(0);
      return;
    }

    const fetchAudienceSize = async () => {
      try {
        const segmentRules = convertRulesToMongoQuery(ruleGroup);
        const token = localStorage.getItem('auth_token');
        const response = await axios.post(
          'http://localhost:5000/api/customers/preview',
          { segmentRules },
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        setAudienceSize(response.data.audienceSize);
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
            title: "Failed to preview audience",
            description: "Unable to fetch audience size.",
            variant: "destructive",
          });
        }
      }
    };

    fetchAudienceSize();
  }, [ruleGroup, navigate, toast]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (ruleGroup.rules.length === 0) {
      toast({
        title: "No rules defined",
        description: "Please add at least one rule to define your audience segment.",
        variant: "destructive",
      });
      return;
    }
    
    if (!message.trim()) {
      toast({
        title: "Message required",
        description: "Please enter a message for your campaign.",
        variant: "destructive",
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Convert rules to MongoDB query format
      const segmentRules = convertRulesToMongoQuery(ruleGroup);
      const token = localStorage.getItem('auth_token');
      
      // Log payload for debugging
      console.log('Campaign payload:', { segmentRules, message });
      
      // Create campaign via backend API
      const response = await axios.post(
        'http://localhost:5000/api/campaigns',
        { segmentRules, message },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );
      
      console.log('Campaign response:', response.data);
      
      toast({
        title: "Campaign created",
        description: "Your campaign has been successfully created."
      });
      
      // Redirect to campaigns list
      navigate("/campaigns");
    } catch (error) {
      console.error('Error creating campaign:', error.response?.data);
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
          title: "Failed to create campaign",
          description: error.response?.data?.error || "There was an error creating your campaign.",
          variant: "destructive",
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Convert rules to MongoDB query format
  const convertRulesToMongoQuery = (ruleGroup: RuleGroup) => {
    if (ruleGroup.rules.length === 0) return {};
    
    const conditions = ruleGroup.rules.map(rule => {
      // Handle lastActive field specially (convert to date)
      if (rule.field === 'lastActive') {
        const daysAgo = parseInt(rule.value) || 0;
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        
        // For lastActive, we use $lt to find users inactive for X days
        return { [rule.field]: { '$lt': date.toISOString() } };
      }
      
      // For other fields, use the operator directly
      return { [rule.field]: { [rule.operator]: parseFloat(rule.value) } };
    });
    
    // If using AND, use $and operator, otherwise use $or
    const operator = ruleGroup.combinator === 'AND' ? '$and' : '$or';
    return { [operator]: conditions };
  };

  return (
    <div className="max-w-3xl mx-auto animate-fade-in">
      <h1 className="text-3xl font-bold mb-6 text-crm-darkPurple">Create Campaign</h1>
      
      <form onSubmit={handleSubmit} className="space-y-8">
        <RuleBuilder 
          ruleGroup={ruleGroup}
          onRuleGroupChange={setRuleGroup}
          onAudienceSizeChange={setAudienceSize}
        />
        
        <div className="space-y-2">
          <label className="text-lg font-medium" htmlFor="message">
            Campaign Message
          </label>
          <Textarea
            id="message"
            placeholder="Enter your campaign message here..."
            className="min-h-[100px]"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
          />
        </div>
        
        <Card className="bg-crm-softPurple border-none">
          <CardContent className="p-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium text-crm-darkPurple">Audience Preview</h3>
              <div className="text-xl font-bold text-crm-darkPurple">
                {audienceSize.toLocaleString()} customers
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="flex justify-end space-x-4">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate("/campaigns")}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button 
            type="submit"
            className="bg-crm-purple hover:bg-crm-darkPurple text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center">
                <Loader size="small" className="mr-2" />
                <span>Creating Campaign...</span>
              </div>
            ) : (
              <span>Create Campaign</span>
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}