
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { PlusCircle, X } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export interface Rule {
  id: string;
  field: string;
  operator: string;
  value: string;
}

export interface RuleGroup {
  id: string;
  rules: Rule[];
  combinator: 'AND' | 'OR';
}

interface RuleBuilderProps {
  ruleGroup: RuleGroup;
  onRuleGroupChange: (ruleGroup: RuleGroup) => void;
  onAudienceSizeChange: (size: number) => void;
}

export default function RuleBuilder({ 
  ruleGroup, 
  onRuleGroupChange,
  onAudienceSizeChange
}: RuleBuilderProps) {
  const fieldOptions = [
    { value: 'totalSpend', label: 'Total Spend' },
    { value: 'visits', label: 'Visits' },
    { value: 'lastActive', label: 'Last Active' }
  ];
  
  const operatorOptions = [
    { value: '$gt', label: '>' },
    { value: '$lt', label: '<' },
    { value: '$eq', label: '=' },
    { value: '$gte', label: '>=' },
    { value: '$lte', label: '<=' }
  ];

  const handleAddRule = () => {
    const newRule: Rule = {
      id: `rule-${Date.now()}`,
      field: 'totalSpend',
      operator: '$gt',
      value: ''
    };
    
    const updatedRuleGroup = {
      ...ruleGroup,
      rules: [...ruleGroup.rules, newRule]
    };
    
    onRuleGroupChange(updatedRuleGroup);
    simulateAudienceSizeUpdate(updatedRuleGroup);
  };

  const handleRemoveRule = (ruleId: string) => {
    const updatedRules = ruleGroup.rules.filter(rule => rule.id !== ruleId);
    const updatedRuleGroup = { ...ruleGroup, rules: updatedRules };
    
    onRuleGroupChange(updatedRuleGroup);
    simulateAudienceSizeUpdate(updatedRuleGroup);
  };

  const handleRuleChange = (index: number, key: keyof Rule, value: string) => {
    const updatedRules = [...ruleGroup.rules];
    updatedRules[index] = { ...updatedRules[index], [key]: value };
    
    const updatedRuleGroup = { ...ruleGroup, rules: updatedRules };
    onRuleGroupChange(updatedRuleGroup);
    simulateAudienceSizeUpdate(updatedRuleGroup);
  };

  const handleCombinatorChange = (value: 'AND' | 'OR') => {
    const updatedRuleGroup = { ...ruleGroup, combinator: value };
    onRuleGroupChange(updatedRuleGroup);
    simulateAudienceSizeUpdate(updatedRuleGroup);
  };

  // Simulate audience size update - in a real app this would call the API
  const simulateAudienceSizeUpdate = (ruleGroup: RuleGroup) => {
    if (ruleGroup.rules.length === 0) {
      onAudienceSizeChange(0);
      return;
    }
    
    // Simple audience size simulation based on rules
    const baseSize = 5000;
    const multiplier = ruleGroup.combinator === 'AND' ? 0.7 : 1.3;
    const ruleImpact = ruleGroup.rules.length * 300;
    
    // Generate a size that changes based on rules but appears realistic
    const simulatedSize = Math.floor((baseSize - ruleImpact) * multiplier);
    const finalSize = Math.max(simulatedSize, 100); // Ensure at least 100 users
    
    onAudienceSizeChange(finalSize);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center mb-4">
        <h3 className="text-lg font-medium">Segment Rules</h3>
        <div className="ml-auto flex gap-2">
          <Select 
            value={ruleGroup.combinator}
            onValueChange={(value) => handleCombinatorChange(value as 'AND' | 'OR')}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Combinator" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="AND">AND</SelectItem>
              <SelectItem value="OR">OR</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={handleAddRule} className="bg-purple-500 hover:bg-purple-600 text-white">
            <PlusCircle className="mr-2 h-4 w-4" />
            Add Rule
          </Button>
        </div>
      </div>
      
      <Card className="border-crm-softPurple">
        <CardContent className="p-4">
          {ruleGroup.rules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No rules defined. Click "Add Rule" to create your first rule.
            </div>
          ) : (
            <div className="space-y-4">
              {ruleGroup.rules.map((rule, index) => (
                <div 
                  key={rule.id} 
                  className="rule-builder-item flex items-center flex-wrap gap-2"
                >
                  {index > 0 && (
                    <div className="rule-operator w-full md:w-auto mb-2 md:mb-0">
                      {ruleGroup.combinator}
                    </div>
                  )}
                  
                  <div className="flex items-center space-x-2 flex-1 flex-wrap md:flex-nowrap gap-2">
                    <Select 
                      value={rule.field}
                      onValueChange={(value) => handleRuleChange(index, 'field', value)}
                    >
                      <SelectTrigger className="w-full md:w-[150px]">
                        <SelectValue placeholder="Field" />
                      </SelectTrigger>
                      <SelectContent>
                        {fieldOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Select 
                      value={rule.operator}
                      onValueChange={(value) => handleRuleChange(index, 'operator', value)}
                    >
                      <SelectTrigger className="w-[80px]">
                        <SelectValue placeholder="Op" />
                      </SelectTrigger>
                      <SelectContent>
                        {operatorOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    
                    <Input 
                      value={rule.value}
                      onChange={(e) => handleRuleChange(index, 'value', e.target.value)}
                      className="flex-1"
                      placeholder={rule.field === 'lastActive' ? 'Days inactive' : 'Value'}
                      type={rule.field === 'lastActive' ? 'number' : 'text'}
                    />
                  </div>
                  
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => handleRemoveRule(rule.id)}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
