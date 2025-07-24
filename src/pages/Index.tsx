import { useState, useEffect } from "react";
import Header from "@/components/Header";
import PostCard, { Post } from "@/components/PostCard";
import CreatePost from "@/components/CreatePost";
import AnonymousForm from "@/components/AnonymousForm";
import AdminDashboard from "@/components/AdminDashboard";
import { useToast } from "@/hooks/use-toast";

interface AnonymousSubmission {
  id: string;
  category: string;
  content: string;
  urgency: 'low' | 'medium' | 'high';
  timestamp: Date;
  status: 'new' | 'reviewed' | 'resolved';
}

const Index = () => {
  const [activeTab, setActiveTab] = useState<'feed' | 'anonymous' | 'admin'>('feed');
  const [posts, setPosts] = useState<Post[]>([]);
  const [anonymousSubmissions, setAnonymousSubmissions] = useState<AnonymousSubmission[]>([]);
  const [isAdmin, setIsAdmin] = useState(false); // In real app, this would be based on authentication
  const { toast } = useToast();

  // Demo data initialization
  useEffect(() => {
    const demoReports: AnonymousSubmission[] = [
      {
        id: "anon-001",
        category: "bullying",
        content: "There's been ongoing harassment in the computer lab during evening hours. Students are being intimidated and their work is being disrupted. The issue has been happening for the past two weeks.",
        urgency: "high",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        status: "new"
      },
      {
        id: "anon-002",
        category: "mental-health",
        content: "The exam pressure is becoming overwhelming. Many students are struggling with anxiety and there's limited counseling support available. We need more mental health resources.",
        urgency: "medium",
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
        status: "reviewed"
      }
    ];

    const demoPosts: Post[] = [
      {
        id: "1",
        type: "query",
        author: "Sarah Johnson",
        content: "Can anyone explain the difference between async/await and promises in JavaScript? I'm preparing for my web development exam and getting confused between the two approaches.",
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        likes: 12,
        replies: 3
      },
      {
        id: "2", 
        type: "poll",
        author: "Prof. Michael Chen",
        content: "We're planning the schedule for next semester's programming courses. Which time slots work best for the majority of students?",
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        likes: 8,
        replies: 15,
        poll: {
          question: "Which time slot do you prefer for programming classes?",
          options: [
            { id: "morning", text: "Morning (9-11 AM)", votes: 45 },
            { id: "afternoon", text: "Afternoon (2-4 PM)", votes: 32 },
            { id: "evening", text: "Evening (6-8 PM)", votes: 23 }
          ],
          totalVotes: 100,
          hasVoted: false
        }
      },
      {
        id: "3",
        type: "query", 
        author: "Alex Kumar",
        content: "Has anyone taken the Machine Learning elective with Dr. Rodriguez? How's the workload and what programming languages does she use in assignments?",
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        likes: 7,
        replies: 8
      }
    ];

    setPosts(demoPosts);
    setAnonymousSubmissions(demoReports);
  }, []);

  const handleCreatePost = (newPost: {
    type: 'query' | 'poll';
    content: string;
    poll?: { question: string; options: string[] };
  }) => {
    const post: Post = {
      id: Date.now().toString(),
      type: newPost.type,
      author: "You", // In real app, this would be the logged-in user
      content: newPost.content,
      timestamp: new Date(),
      likes: 0,
      replies: 0,
    };

    if (newPost.type === 'poll' && newPost.poll) {
      post.poll = {
        question: newPost.poll.question,
        options: newPost.poll.options.map((text, index) => ({
          id: `option-${index}`,
          text,
          votes: 0
        })),
        totalVotes: 0,
        hasVoted: false
      };
    }

    setPosts([post, ...posts]);
    toast({
      title: "Posted Successfully!",
      description: newPost.type === 'query' ? "Your query has been posted." : "Your poll has been created.",
    });
  };

  const handleAnonymousSubmission = (submission: {
    category: string;
    content: string;
    urgency: 'low' | 'medium' | 'high';
  }) => {
    const newSubmission: AnonymousSubmission = {
      id: `anon-${Date.now()}`,
      ...submission,
      timestamp: new Date(),
      status: 'new'
    };

    setAnonymousSubmissions([newSubmission, ...anonymousSubmissions]);
  };

  const handleVote = (postId: string, optionId: string) => {
    setPosts(posts.map(post => {
      if (post.id === postId && post.poll && !post.poll.hasVoted) {
        const updatedOptions = post.poll.options.map(option =>
          option.id === optionId
            ? { ...option, votes: option.votes + 1 }
            : option
        );
        
        return {
          ...post,
          poll: {
            ...post.poll,
            options: updatedOptions,
            totalVotes: post.poll.totalVotes + 1,
            hasVoted: true,
            userVote: optionId
          }
        };
      }
      return post;
    }));

    toast({
      title: "Vote Recorded",
      description: "Thanks for participating in the poll!",
    });
  };

  const handleLike = (postId: string) => {
    setPosts(posts.map(post => 
      post.id === postId 
        ? { ...post, likes: (post.likes || 0) + 1 }
        : post
    ));
  };

  const handleUpdateSubmissionStatus = (id: string, status: 'new' | 'reviewed' | 'resolved') => {
    setAnonymousSubmissions(submissions =>
      submissions.map(submission =>
        submission.id === id
          ? { ...submission, status }
          : submission
      )
    );

    toast({
      title: "Status Updated",
      description: `Submission marked as ${status}.`,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-subtle">
      <Header 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        isAdmin={isAdmin}
      />

      <main className="container mx-auto px-4 py-8">
        {activeTab === 'feed' && (
          <div className="max-w-2xl mx-auto space-y-6">
            <CreatePost onSubmit={handleCreatePost} />
            
            {posts.length === 0 ? (
              <div className="text-center py-12">
                <h3 className="text-lg font-semibold text-foreground mb-2">No posts yet</h3>
                <p className="text-muted-foreground">Be the first to post a query or create a poll!</p>
              </div>
            ) : (
              <div className="space-y-4">
                {posts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onLike={handleLike}
                    onVote={handleVote}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'anonymous' && (
          <AnonymousForm onSubmit={handleAnonymousSubmission} />
        )}

        {activeTab === 'admin' && (
          <AdminDashboard
            submissions={anonymousSubmissions}
            onUpdateStatus={handleUpdateSubmissionStatus}
          />
        )}

        {/* Admin Toggle for Demo */}
        <div className="fixed bottom-4 right-4">
          <button
            onClick={() => setIsAdmin(!isAdmin)}
            className="px-4 py-2 bg-gradient-primary text-white rounded-lg shadow-lg text-sm font-medium"
          >
            {isAdmin ? 'Exit Admin' : 'Admin Mode'}
          </button>
        </div>
      </main>
    </div>
  );
};

export default Index;
