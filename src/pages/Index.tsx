import { useState, useEffect } from "react";
import PostCard from "@/components/PostCard";
import CreatePost from "@/components/CreatePost";
import Header from "@/components/Header";
import AnonymousForm from "@/components/AnonymousForm";
import AdminDashboard from "@/components/AdminDashboard";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase, Post, AnonymousSubmission } from "@/lib/supabase";
import { toast } from "@/hooks/use-toast";

const Index = () => {
  const [activeTab, setActiveTab] = useState<'feed' | 'anonymous' | 'admin'>('feed');
  const [posts, setPosts] = useState<Post[]>([]);
  const [anonymousSubmissions, setAnonymousSubmissions] = useState<AnonymousSubmission[]>([]);
  const { user, profile, isAdmin, signOut } = useAuth();

  useEffect(() => {
    fetchPosts();
    fetchAnonymousSubmissions();

    // Set up real-time subscriptions
    const postsSubscription = supabase
      .channel('posts')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'posts' },
        () => fetchPosts()
      )
      .subscribe();

    const submissionsSubscription = supabase
      .channel('anonymous_submissions')
      .on('postgres_changes',
        { event: '*', schema: 'public', table: 'anonymous_submissions' },
        () => fetchAnonymousSubmissions()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(postsSubscription);
      supabase.removeChannel(submissionsSubscription);
    };
  }, []);

  const fetchPosts = async () => {
    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          *,
          profiles!posts_author_id_fkey(full_name, email),
          poll_options(*),
          poll_votes!inner(option_id, user_id),
          post_likes!inner(user_id)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const postsWithUserData = data?.map(post => ({
        ...post,
        user_vote: post.poll_votes?.find((vote: any) => vote.user_id === user?.id),
        user_liked: post.post_likes?.some((like: any) => like.user_id === user?.id)
      })) || [];

      setPosts(postsWithUserData);
    } catch (error) {
      console.error('Error fetching posts:', error);
      toast({
        title: "Error",
        description: "Failed to fetch posts",
        variant: "destructive",
      });
    }
  };

  const fetchAnonymousSubmissions = async () => {
    if (!isAdmin) return;
    
    try {
      const { data, error } = await supabase
        .from('anonymous_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAnonymousSubmissions(data || []);
    } catch (error) {
      console.error('Error fetching submissions:', error);
    }
  };

  const handleCreatePost = async (newPost: any) => {
    try {
      const postData = {
        author_id: user?.id,
        content: newPost.content,
        type: newPost.type,
        poll_question: newPost.type === 'poll' ? newPost.poll?.question : null,
      };

      const { data: post, error } = await supabase
        .from('posts')
        .insert([postData])
        .select()
        .single();

      if (error) throw error;

      // If it's a poll, insert poll options
      if (newPost.type === 'poll' && newPost.poll?.options) {
        const pollOptions = newPost.poll.options.map((option: any) => ({
          post_id: post.id,
          option_text: option.text
        }));

        const { error: optionsError } = await supabase
          .from('poll_options')
          .insert(pollOptions);

        if (optionsError) throw optionsError;
      }

      toast({
        title: "Success",
        description: "Post created successfully!",
      });

      fetchPosts(); // Refresh posts
    } catch (error: any) {
      console.error('Error creating post:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleAnonymousSubmission = async (submission: { category: string; content: string; urgency: 'low' | 'medium' | 'high'; }) => {
    try {
      const { error } = await supabase
        .from('anonymous_submissions')
        .insert([submission]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Anonymous submission sent successfully!",
      });
    } catch (error: any) {
      console.error('Error submitting:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleVote = async (postId: string, optionId: string) => {
    try {
      // Check if user already voted
      const { data: existingVote } = await supabase
        .from('poll_votes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', user?.id)
        .single();

      if (existingVote) {
        // Update existing vote
        const { error } = await supabase
          .from('poll_votes')
          .update({ option_id: optionId })
          .eq('id', existingVote.id);

        if (error) throw error;
      } else {
        // Insert new vote
        const { error } = await supabase
          .from('poll_votes')
          .insert([{
            post_id: postId,
            option_id: optionId,
            user_id: user?.id
          }]);

        if (error) throw error;
      }

      fetchPosts(); // Refresh to get updated vote counts
    } catch (error: any) {
      console.error('Error voting:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLike = async (postId: string) => {
    try {
      const { data: existingLike } = await supabase
        .from('post_likes')
        .select('*')
        .eq('post_id', postId)
        .eq('user_id', user?.id)
        .single();

      if (existingLike) {
        // Unlike
        const { error } = await supabase
          .from('post_likes')
          .delete()
          .eq('id', existingLike.id);

        if (error) throw error;
      } else {
        // Like
        const { error } = await supabase
          .from('post_likes')
          .insert([{
            post_id: postId,
            user_id: user?.id
          }]);

        if (error) throw error;
      }

      fetchPosts(); // Refresh to get updated like counts
    } catch (error: any) {
      console.error('Error liking post:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleUpdateSubmissionStatus = async (id: string, status: 'new' | 'reviewed' | 'resolved') => {
    try {
      const { error } = await supabase
        .from('anonymous_submissions')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) throw error;

      fetchAnonymousSubmissions(); // Refresh submissions
      toast({
        title: "Success",
        description: "Submission status updated!",
      });
    } catch (error: any) {
      console.error('Error updating status:', error);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleSignOut = async () => {
    const { error } = await signOut();
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
        isAdmin={isAdmin}
        userEmail={profile?.email}
        onSignOut={handleSignOut}
      />
      
      <main className="container mx-auto px-4 py-6 max-w-2xl">
        {activeTab === 'feed' && (
          <div className="space-y-6">
            <CreatePost 
              onSubmit={handleCreatePost} 
              userInitials={profile?.full_name?.split(' ').map(n => n[0]).join('') || profile?.email?.[0]?.toUpperCase() || 'U'} 
            />
            
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={{
                    id: post.id,
                    author: post.profiles?.full_name || post.profiles?.email || 'Unknown User',
                    content: post.content,
                    timestamp: new Date(post.created_at),
                    likes: post.likes_count,
                    replies: post.replies_count,
                    type: post.type,
                    poll: post.type === 'poll' ? {
                      question: post.poll_question || '',
                      options: post.poll_options?.map((option: any) => ({
                        id: option.id,
                        text: option.option_text,
                        votes: option.votes_count
                      })) || [],
                      totalVotes: post.poll_options?.reduce((sum: number, option: any) => sum + option.votes_count, 0) || 0,
                      hasVoted: !!post.user_vote,
                      userVote: post.user_vote?.option_id
                    } : undefined
                  }}
                  onLike={() => handleLike(post.id)}
                  onReply={() => console.log('Reply to:', post.id)}
                  onVote={(optionId) => handleVote(post.id, optionId)}
                />
              ))}
            </div>
          </div>
        )}
        
        {activeTab === 'anonymous' && (
          <AnonymousForm onSubmit={handleAnonymousSubmission} />
        )}
        
        {activeTab === 'admin' && isAdmin && (
          <AdminDashboard 
            submissions={anonymousSubmissions.map(sub => ({
              ...sub,
              timestamp: new Date(sub.created_at)
            }))}
            onUpdateStatus={handleUpdateSubmissionStatus}
          />
        )}
        
        {activeTab === 'admin' && !isAdmin && (
          <div className="text-center py-12">
            <p className="text-muted-foreground">You don't have admin permissions to view this section.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Index;