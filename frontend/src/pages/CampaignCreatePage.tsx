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
const backend = import.meta.env.VITE_BACKEND_URL;
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false); // For AI button loading state
  const [message, setMessage] = useState("");
  const [audienceSize, setAudienceSize] = useState(0);
  const [ruleGroup, setRuleGroup] = useState<RuleGroup>({
    id: "group-1",
    rules: [],
    combinator: "AND"
  });

  // Fetch audience size and data when ruleGroup changes
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
          `${backend}/api/customers/preview`,
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
          console.log("Failed in preview audience");
        }
      }
    };

    fetchAudienceSize();
  }, [ruleGroup, navigate, toast]);

  // Function to generate AI message
  const handleGenerateAIMessage = async () => {
    if (ruleGroup.rules.length === 0) {
      toast({
        title: "No audience defined",
        description: "Please add rules to define your audience before generating a message.",
        variant: "destructive",
      });
      return;
    }

    setAiLoading(true);
    try {
      const token = localStorage.getItem('auth_token');
      const segmentRules = convertRulesToMongoQuery(ruleGroup);

     
      let prompt = "Generate a promotional campaign message for customers";
      
      // Add context based on rules
      const spendRule = ruleGroup.rules.find(rule => rule.field === 'totalSpend');
      if (spendRule) {
        prompt += ` who spend ${spendRule.operator} $${spendRule.value} on average`;
      }
      
      const visitsRule = ruleGroup.rules.find(rule => rule.field === 'visits');
      if (visitsRule) {
        prompt += ` with ${visitsRule.operator} ${visitsRule.value} visits`;
      }

      prompt += '. Offer a discount or incentive (also add some emojis accordingly).';

      // Call backend to generate message
      const aiResponse = await axios.post(
        `${backend}/api/campaigns/generate-message`,
        { prompt},
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        }
      );

      setMessage(aiResponse.data.message);
      // toast({
      //   title: "Message generated",
      //   description: "AI has generated a campaign message. Feel free to edit it!",
      // });
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
          title: "Failed to generate message",
          description: error.response?.data?.error || "Could not generate message with AI.",
          variant: "destructive",
        });
      }
    } finally {
      setAiLoading(false);
    }
  };

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
      const segmentRules = convertRulesToMongoQuery(ruleGroup);
      const token = localStorage.getItem('auth_token');
      
      console.log('Campaign payload:', { segmentRules, message });
      
      const response = await axios.post(
        `${backend}/api/campaigns`,
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
      
      navigate("/campaigns/history");
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

  const convertRulesToMongoQuery = (ruleGroup: RuleGroup) => {
    if (ruleGroup.rules.length === 0) return {};
    
    const conditions = ruleGroup.rules.map(rule => {
      if (rule.field === 'lastActive') {
        const daysAgo = parseInt(rule.value) || 0;
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        return { [rule.field]: { '$lt': date.toISOString() } };
      }
      return { [rule.field]: { [rule.operator]: parseFloat(rule.value) } };
    });
    
    const operator = ruleGroup.combinator === 'AND' ? '$and' : '$or';
    return { [operator]: conditions };
  };

return (
  <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
    <Card className="max-w-4xl w-full bg-white shadow-lg rounded-xl overflow-hidden">
      <CardContent className="p-8">
        <h1 className="text-4xl font-bold mb-8 text-gray-800 bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">
          Create Campaign
        </h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Rule Builder Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label className="text-xl font-semibold text-gray-700">
                Audience Rules
              </label>
              <span className="text-sm text-gray-500">
                Audience Size: <span className="font-medium">{audienceSize}</span>
              </span>
            </div>
            <div className="p-6 bg-gray-50 rounded-lg border border-gray-200">
              <RuleBuilder
                ruleGroup={ruleGroup}
                onRuleGroupChange={setRuleGroup}
                onAudienceSizeChange={setAudienceSize}
              />
            </div>
          </div>

          {/* Campaign Message Section */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <label
                className="text-xl font-semibold text-gray-700"
                htmlFor="message"
              >
                Campaign Message
              </label>
              <Button
                type="button"
                variant="outline"
                onClick={handleGenerateAIMessage}
                disabled={aiLoading}
                className="relative bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium rounded-lg px-4 py-2 hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 shadow-md disabled:opacity-50"
              >
                {aiLoading ? (
                  <div className="flex items-center">
                    <Loader size="small" className="mr-2" />
                    <span>Generating...</span>
                  </div>
                ) : (
                  <span>Generate with AI</span>
                )}
              </Button>
            </div>
            <Textarea
              id="message"
              placeholder="Enter your campaign message here..."
              className="min-h-[120px] w-full p-4 text-gray-700 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/campaigns/create")}
              disabled={isLoading}
              className="px-6 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 transition-all duration-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="relative bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-medium rounded-lg px-6 py-2 hover:from-purple-600 hover:to-indigo-600 transition-all duration-300 shadow-md disabled:opacity-50"
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
      </CardContent>
    </Card>
  </div>
);

}