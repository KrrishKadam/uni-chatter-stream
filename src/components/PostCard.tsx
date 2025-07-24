import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Heart, MessageCircle, Share, BarChart3 } from "lucide-react";
import { useState } from "react";

export interface Post {
  id: string;
  type: 'query' | 'poll';
  author: string;
  content: string;
  timestamp: Date;
  likes?: number;
  replies?: number;
  poll?: {
    question: string;
    options: Array<{
      id: string;
      text: string;
      votes: number;
    }>;
    totalVotes: number;
    hasVoted?: boolean;
    userVote?: string;
  };
}

interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
  onReply?: (postId: string) => void;
  onVote?: (postId: string, optionId: string) => void;
}

const PostCard = ({ post, onLike, onReply, onVote }: PostCardProps) => {
  const [isLiked, setIsLiked] = useState(false);
  const [selectedOption, setSelectedOption] = useState(post.poll?.userVote);

  const handleLike = () => {
    setIsLiked(!isLiked);
    onLike?.(post.id);
  };

  const handleVote = (optionId: string) => {
    if (post.poll?.hasVoted) return;
    setSelectedOption(optionId);
    onVote?.(post.id, optionId);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return 'now';
    if (minutes < 60) return `${minutes}m`;
    if (hours < 24) return `${hours}h`;
    return `${days}d`;
  };

  return (
    <Card className="group bg-gradient-card border-card-border shadow-post hover:shadow-hover transition-all duration-300 p-6">
      <div className="flex space-x-4">
        <Avatar className="h-12 w-12 ring-2 ring-primary/10">
          <AvatarFallback className="bg-gradient-primary text-white font-semibold">
            {getInitials(post.author)}
          </AvatarFallback>
        </Avatar>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center space-x-2 mb-2">
            <h3 className="font-semibold text-foreground truncate">{post.author}</h3>
            {post.type === 'poll' && (
              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-secondary-muted text-secondary border border-secondary/20">
                <BarChart3 className="h-3 w-3 mr-1" />
                Poll
              </span>
            )}
            <span className="text-sm text-muted-foreground">·</span>
            <span className="text-sm text-muted-foreground">{formatTime(post.timestamp)}</span>
          </div>
          
          <div className="space-y-4">
            <p className="text-foreground leading-relaxed">{post.content}</p>
            
            {post.type === 'poll' && post.poll && (
              <div className="space-y-3 bg-muted/30 rounded-lg p-4 border border-subtle">
                <h4 className="font-medium text-foreground">{post.poll.question}</h4>
                <div className="space-y-2">
                  {post.poll.options.map((option) => {
                    const percentage = post.poll!.totalVotes > 0 
                      ? Math.round((option.votes / post.poll!.totalVotes) * 100) 
                      : 0;
                    const isSelected = selectedOption === option.id;
                    const hasVoted = post.poll!.hasVoted;

                    return (
                      <div key={option.id} className="relative">
                        <Button
                          variant={isSelected ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleVote(option.id)}
                          disabled={hasVoted}
                          className={`w-full justify-between p-3 h-auto ${
                            hasVoted ? 'cursor-default' : 'hover:scale-[1.01] transition-transform'
                          }`}
                        >
                          <span className="text-left">{option.text}</span>
                          {hasVoted && (
                            <span className="font-semibold">{percentage}%</span>
                          )}
                        </Button>
                        {hasVoted && (
                          <div 
                            className="absolute inset-0 bg-primary/10 rounded-md transition-all duration-500 ease-out"
                            style={{ 
                              width: `${percentage}%`,
                              zIndex: -1
                            }}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>
                <p className="text-sm text-muted-foreground text-center">
                  {post.poll.totalVotes} vote{post.poll.totalVotes !== 1 ? 's' : ''}
                </p>
              </div>
            )}
          </div>
          
          <div className="flex items-center justify-between mt-4 pt-3 border-t border-subtle">
            <div className="flex items-center space-x-6">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLike}
                className={`text-muted-foreground hover:text-primary transition-colors ${
                  isLiked ? 'text-red-500 hover:text-red-600' : ''
                }`}
              >
                <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} />
                <span>{(post.likes || 0) + (isLiked ? 1 : 0)}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onReply?.(post.id)}
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <MessageCircle className="h-4 w-4 mr-2" />
                <span>{post.replies || 0}</span>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="text-muted-foreground hover:text-primary transition-colors"
              >
                <Share className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default PostCard;