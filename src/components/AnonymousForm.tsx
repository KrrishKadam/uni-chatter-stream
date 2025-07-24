import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { UserX, Shield, AlertTriangle, Heart, BookOpen } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface AnonymousFormProps {
  onSubmit: (submission: {
    category: string;
    content: string;
    urgency: 'low' | 'medium' | 'high';
  }) => void;
}

const AnonymousForm = ({ onSubmit }: AnonymousFormProps) => {
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [urgency, setUrgency] = useState<'low' | 'medium' | 'high'>('medium');
  const { toast } = useToast();

  const categories = [
    { value: 'bullying', label: 'Bullying/Harassment', icon: Shield },
    { value: 'mental-health', label: 'Mental Health', icon: Heart },
    { value: 'academic', label: 'Academic Issues', icon: BookOpen },
    { value: 'safety', label: 'Safety Concerns', icon: AlertTriangle },
    { value: 'other', label: 'Other', icon: UserX },
  ];

  const urgencyLevels = [
    { value: 'low', label: 'Low Priority', color: 'bg-success/10 text-success border-success/20' },
    { value: 'medium', label: 'Medium Priority', color: 'bg-warning/10 text-warning border-warning/20' },
    { value: 'high', label: 'High Priority', color: 'bg-destructive/10 text-destructive border-destructive/20' },
  ];

  const handleSubmit = () => {
    if (!content.trim() || !category) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    onSubmit({
      category,
      content: content.trim(),
      urgency,
    });

    toast({
      title: "Submission Received",
      description: "Your anonymous message has been sent securely to the administration.",
    });

    // Reset form
    setContent("");
    setCategory("");
    setUrgency('medium');
  };

  const selectedCategory = categories.find(cat => cat.value === category);
  const selectedUrgency = urgencyLevels.find(level => level.value === urgency);

  return (
    <div className="max-w-2xl mx-auto">
      <Card className="bg-gradient-card border-card-border shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-primary mx-auto mb-4 shadow-lg">
            <UserX className="h-8 w-8 text-white" />
          </div>
          <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent mb-2">
            Anonymous Submission
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Submit concerns or issues anonymously. Your identity will remain completely confidential.
          </p>
        </div>

        <div className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Category *
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => {
                    const Icon = cat.icon;
                    return (
                      <SelectItem key={cat.value} value={cat.value}>
                        <div className="flex items-center space-x-2">
                          <Icon className="h-4 w-4" />
                          <span>{cat.label}</span>
                        </div>
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                Priority Level
              </label>
              <Select value={urgency} onValueChange={(value: 'low' | 'medium' | 'high') => setUrgency(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {urgencyLevels.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      <Badge className={level.color} variant="outline">
                        {level.label}
                      </Badge>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-foreground mb-2 block">
              Your Message *
            </label>
            <Textarea
              placeholder="Describe your concern or issue in detail. The more information you provide, the better we can help."
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="min-h-[120px] resize-none border-muted focus:border-primary transition-colors"
            />
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-muted-foreground">
                {content.length}/1000 characters
              </p>
              <Badge variant="secondary" className="text-xs">
                {content.length > 0 ? 'Draft saved' : 'Start typing...'}
              </Badge>
            </div>
          </div>

          {selectedCategory && (
            <div className="p-4 bg-muted/30 rounded-lg border border-subtle">
              <div className="flex items-center space-x-2 mb-2">
                {selectedCategory.icon && <selectedCategory.icon className="h-4 w-4 text-primary" />}
                <span className="font-medium text-sm">Selected: {selectedCategory.label}</span>
                {selectedUrgency && (
                  <Badge className={selectedUrgency.color} variant="outline">
                    {selectedUrgency.label}
                  </Badge>
                )}
              </div>
              <p className="text-xs text-muted-foreground">
                This will be sent directly to the appropriate administrators for review.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between pt-4 border-t border-subtle">
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <Shield className="h-4 w-4" />
              <span>End-to-end encrypted & anonymous</span>
            </div>
            
            <Button
              onClick={handleSubmit}
              disabled={!content.trim() || !category}
              className="bg-gradient-primary hover:bg-primary-hover"
            >
              Submit Anonymously
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default AnonymousForm;