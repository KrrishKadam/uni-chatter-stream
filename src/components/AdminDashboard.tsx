import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Settings, Shield, AlertTriangle, Heart, BookOpen, UserX, Clock, MoreVertical } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

interface AnonymousSubmission {
  id: string;
  category: string;
  content: string;
  urgency: 'low' | 'medium' | 'high';
  timestamp: Date;
  status: 'new' | 'reviewed' | 'resolved';
}

interface AdminDashboardProps {
  submissions: AnonymousSubmission[];
  onUpdateStatus: (id: string, status: 'new' | 'reviewed' | 'resolved') => void;
}

const AdminDashboard = ({ submissions, onUpdateStatus }: AdminDashboardProps) => {
  const categories = {
    'bullying': { label: 'Bullying/Harassment', icon: Shield, color: 'text-red-600' },
    'mental-health': { label: 'Mental Health', icon: Heart, color: 'text-pink-600' },
    'academic': { label: 'Academic Issues', icon: BookOpen, color: 'text-blue-600' },
    'safety': { label: 'Safety Concerns', icon: AlertTriangle, color: 'text-orange-600' },
    'other': { label: 'Other', icon: UserX, color: 'text-gray-600' },
  };

  const urgencyColors = {
    'low': 'bg-success/10 text-success border-success/20',
    'medium': 'bg-warning/10 text-warning border-warning/20',
    'high': 'bg-destructive/10 text-destructive border-destructive/20',
  };

  const statusColors = {
    'new': 'bg-primary/10 text-primary border-primary/20',
    'reviewed': 'bg-warning/10 text-warning border-warning/20',
    'resolved': 'bg-success/10 text-success border-success/20',
  };

  const formatTime = (date: Date) => {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const newSubmissions = submissions.filter(s => s.status === 'new').length;
  const reviewedSubmissions = submissions.filter(s => s.status === 'reviewed').length;
  const resolvedSubmissions = submissions.filter(s => s.status === 'resolved').length;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-card border-card-border">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <UserX className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold">{submissions.length}</p>
              <p className="text-sm text-muted-foreground">Total Submissions</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-card border-card-border">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-primary/10 rounded-lg">
              <AlertTriangle className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-2xl font-bold text-primary">{newSubmissions}</p>
              <p className="text-sm text-muted-foreground">New</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-card border-card-border">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-warning/10 rounded-lg">
              <Clock className="h-5 w-5 text-warning" />
            </div>
            <div>
              <p className="text-2xl font-bold text-warning">{reviewedSubmissions}</p>
              <p className="text-sm text-muted-foreground">Under Review</p>
            </div>
          </div>
        </Card>

        <Card className="p-4 bg-gradient-card border-card-border">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-success/10 rounded-lg">
              <Shield className="h-5 w-5 text-success" />
            </div>
            <div>
              <p className="text-2xl font-bold text-success">{resolvedSubmissions}</p>
              <p className="text-sm text-muted-foreground">Resolved</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Main Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
            Admin Dashboard
          </h2>
          <p className="text-muted-foreground">Manage anonymous submissions and student concerns</p>
        </div>
        <Button variant="outline" className="flex items-center space-x-2">
          <Settings className="h-4 w-4" />
          <span>Settings</span>
        </Button>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {submissions.length === 0 ? (
          <Card className="p-8 text-center bg-gradient-card border-card-border">
            <UserX className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-foreground mb-2">No Submissions Yet</h3>
            <p className="text-muted-foreground">
              Anonymous submissions will appear here for review and action.
            </p>
          </Card>
        ) : (
          submissions
            .sort((a, b) => {
              // Sort by urgency first (high, medium, low), then by timestamp (newest first)
              const urgencyOrder = { 'high': 3, 'medium': 2, 'low': 1 };
              if (urgencyOrder[a.urgency] !== urgencyOrder[b.urgency]) {
                return urgencyOrder[b.urgency] - urgencyOrder[a.urgency];
              }
              return b.timestamp.getTime() - a.timestamp.getTime();
            })
            .map((submission) => {
              const category = categories[submission.category as keyof typeof categories];
              const Icon = category?.icon || UserX;

              return (
                <Card key={submission.id} className="bg-gradient-card border-card-border shadow-post p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg bg-gray-100 ${category?.color || 'text-gray-600'}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-foreground">{category?.label || 'Other'}</h3>
                        <p className="text-sm text-muted-foreground">
                          {formatTime(submission.timestamp)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge className={urgencyColors[submission.urgency]} variant="outline">
                        {submission.urgency.charAt(0).toUpperCase() + submission.urgency.slice(1)} Priority
                      </Badge>
                      <Badge className={statusColors[submission.status]} variant="outline">
                        {submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}
                      </Badge>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => onUpdateStatus(submission.id, 'new')}>
                            Mark as New
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onUpdateStatus(submission.id, 'reviewed')}>
                            Mark as Reviewed
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => onUpdateStatus(submission.id, 'resolved')}>
                            Mark as Resolved
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  <div className="bg-muted/30 rounded-lg p-4 border border-subtle">
                    <p className="text-foreground leading-relaxed whitespace-pre-wrap">
                      {submission.content}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-4 pt-3 border-t border-subtle">
                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      <Shield className="h-4 w-4" />
                      <span>Anonymous submission • ID: {submission.id.slice(0, 8)}</span>
                    </div>
                    
                    <div className="flex space-x-2">
                      {submission.status === 'new' && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onUpdateStatus(submission.id, 'reviewed')}
                        >
                          Start Review
                        </Button>
                      )}
                      {submission.status === 'reviewed' && (
                        <Button
                          size="sm"
                          onClick={() => onUpdateStatus(submission.id, 'resolved')}
                          className="bg-success hover:bg-success/90 text-white"
                        >
                          Mark Resolved
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;