import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageSquare, BarChart3, Plus, X } from "lucide-react";

interface CreatePostProps {
  onSubmit: (post: {
    type: 'query' | 'poll';
    content: string;
    poll?: {
      question: string;
      options: string[];
    };
  }) => void;
  userInitials?: string;
}

const CreatePost = ({ onSubmit, userInitials = "ME" }: CreatePostProps) => {
  const [content, setContent] = useState("");
  const [postType, setPostType] = useState<'query' | 'poll'>('query');
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(['', '']);
  const [isExpanded, setIsExpanded] = useState(false);

  const addPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, '']);
    }
  };

  const removePollOption = (index: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== index));
    }
  };

  const updatePollOption = (index: number, value: string) => {
    const newOptions = [...pollOptions];
    newOptions[index] = value;
    setPollOptions(newOptions);
  };

  const handleSubmit = () => {
    if (!content.trim()) return;
    
    const post: any = {
      type: postType,
      content: content.trim(),
    };

    if (postType === 'poll') {
      if (!pollQuestion.trim() || pollOptions.some(opt => !opt.trim())) return;
      post.poll = {
        question: pollQuestion.trim(),
        options: pollOptions.map(opt => opt.trim()).filter(opt => opt),
      };
    }

    onSubmit(post);
    
    // Reset form
    setContent("");
    setPollQuestion("");
    setPollOptions(['', '']);
    setIsExpanded(false);
  };

  const canSubmit = content.trim() && (
    postType === 'query' || 
    (pollQuestion.trim() && pollOptions.every(opt => opt.trim()))
  );

  return (
    <Card className="bg-gradient-card border-card-border shadow-post p-6 mb-6">
      <div className="flex space-x-4">
        <Avatar className="h-12 w-12 ring-2 ring-primary/10">
          <AvatarFallback className="bg-gradient-primary text-white font-semibold">
            {userInitials}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 space-y-4">
          <div className="flex items-center space-x-2 mb-3">
            <Button
              variant={postType === 'query' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPostType('query')}
              className="flex items-center space-x-2"
            >
              <MessageSquare className="h-4 w-4" />
              <span>Query</span>
            </Button>
            <Button
              variant={postType === 'poll' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setPostType('poll')}
              className="flex items-center space-x-2"
            >
              <BarChart3 className="h-4 w-4" />
              <span>Poll</span>
            </Button>
          </div>

          <Textarea
            placeholder={postType === 'query' 
              ? "What's your question or query?" 
              : "Add a description for your poll..."
            }
            value={content}
            onChange={(e) => setContent(e.target.value)}
            onFocus={() => setIsExpanded(true)}
            className="min-h-[80px] resize-none border-muted focus:border-primary transition-colors"
          />

          {postType === 'poll' && isExpanded && (
            <div className="space-y-3 p-4 bg-muted/30 rounded-lg border border-subtle">
              <Input
                placeholder="Poll question"
                value={pollQuestion}
                onChange={(e) => setPollQuestion(e.target.value)}
                className="font-medium"
              />
              
              <div className="space-y-2">
                {pollOptions.map((option, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <Input
                      placeholder={`Option ${index + 1}`}
                      value={option}
                      onChange={(e) => updatePollOption(index, e.target.value)}
                    />
                    {pollOptions.length > 2 && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removePollOption(index)}
                        className="text-destructive hover:text-destructive px-2"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                
                {pollOptions.length < 4 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={addPollOption}
                    className="w-full border-dashed"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add option
                  </Button>
                )}
              </div>
            </div>
          )}

          {isExpanded && (
            <div className="flex items-center justify-between pt-3 border-t border-subtle">
              <div className="flex items-center space-x-2">
                <Badge variant="secondary" className="text-xs">
                  {content.length}/280
                </Badge>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsExpanded(false);
                    setContent("");
                    setPollQuestion("");
                    setPollOptions(['', '']);
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleSubmit}
                  disabled={!canSubmit}
                  className="bg-gradient-primary hover:bg-primary-hover"
                >
                  {postType === 'query' ? 'Post Query' : 'Create Poll'}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default CreatePost;