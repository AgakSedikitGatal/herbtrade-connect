import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { Web3Header } from "@/components/Web3Header";
import { Web3Footer } from "@/components/Web3Footer";
import { Web3Background } from "@/components/Web3Background";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Heart, 
  MessageCircle, 
  Repeat2, 
  Share, 
  Image as ImageIcon, 
  Video,
  BadgeCheck,
  X,
  Trash2,
  Send,
  TrendingUp,
  Users,
  Sparkles,
  ChevronDown,
  ChevronUp
} from "lucide-react";
import { useCommunity, Comment } from "@/contexts/CommunityContext";
import { authService } from "@/lib/auth";
import { toast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";

const Community = () => {
  const { posts, addPost, likePost, deletePost, addComment, likeComment, deleteComment, getCommentsForPost } = useCommunity();
  const user = authService.getUser();
  const [newPostContent, setNewPostContent] = useState("");
  const [selectedMedia, setSelectedMedia] = useState<{ type: 'image' | 'video'; url: string } | null>(null);
  const [activeTab, setActiveTab] = useState("for-you");
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setSelectedMedia({ type: 'image', url });
    }
  };

  const handleVideoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 50 * 1024 * 1024) {
        toast({
          title: "File too large",
          description: "Video must be under 50MB",
          variant: "destructive"
        });
        return;
      }
      const url = URL.createObjectURL(file);
      setSelectedMedia({ type: 'video', url });
    }
  };

  const handlePost = () => {
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to post in the community",
        variant: "destructive"
      });
      return;
    }

    if (!newPostContent.trim() && !selectedMedia) {
      toast({
        title: "Empty Post",
        description: "Please add some content or media to your post",
        variant: "destructive"
      });
      return;
    }

    addPost({
      author: {
        name: user.name,
        username: `@${user.name.toLowerCase().replace(/\s+/g, '')}`,
        avatar: user.role === 'seller' ? '/Topan.jpg' : '/dus.JPG',
        isVerified: user.role === 'seller',
        role: user.role
      },
      content: newPostContent,
      media: selectedMedia || undefined
    });

    setNewPostContent("");
    setSelectedMedia(null);
    toast({
      title: "Posted!",
      description: "Your post is now live in the community",
    });
  };

  const handleDelete = (postId: string) => {
    deletePost(postId);
    toast({
      title: "Deleted",
      description: "Post has been removed",
    });
  };

  const formatTime = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  const trendingTopics = [
    { tag: "#OrganicHerbs", posts: "12.5K" },
    { tag: "#BlockchainTraceability", posts: "8.2K" },
    { tag: "#SustainableFarming", posts: "6.8K" },
    { tag: "#HerbalMedicine", posts: "5.4K" },
    { tag: "#Web3Agriculture", posts: "4.1K" }
  ];

  const suggestedAccounts = [
    { name: "Indo Botanica", username: "@indobotanica", verified: true, avatar: "/zaf.jpg" },
    { name: "Herbal Labs", username: "@herballabs", verified: true, avatar: "/aul.JPG" },
    { name: "Green Supply Co", username: "@greensupply", verified: true, avatar: "/fio.jpg" }
  ];

  return (
    <div className="min-h-screen bg-background">
      <Web3Background />
      <Web3Header />

      <main className="container mx-auto px-4 pt-24 pb-16">
        <div className="max-w-6xl mx-auto">
          {/* Page Header */}
          <div className="text-center mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-gradient-hero mb-4">
              Community
            </h1>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Connect with verified suppliers and buyers. Share updates, discover trends, and grow your network in the herbal trading ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Main Feed */}
            <div className="lg:col-span-8 space-y-6">
              {/* Create Post Card */}
              <Card className="glass border-border/50 p-4">
                {user ? (
                  <div className="space-y-4">
                    <div className="flex gap-4">
                      <Avatar className="h-12 w-12">
                        <AvatarImage src={user.role === 'seller' ? '/Topan.jpg' : '/dus.JPG'} />
                        <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <Textarea
                          placeholder="What's happening in the herbal world?"
                          value={newPostContent}
                          onChange={(e) => setNewPostContent(e.target.value)}
                          className="min-h-[100px] bg-background/50 border-border/50 resize-none"
                        />
                      </div>
                    </div>

                    {/* Media Preview */}
                    {selectedMedia && (
                      <div className="relative ml-16">
                        {selectedMedia.type === 'image' ? (
                          <img 
                            src={selectedMedia.url} 
                            alt="Preview" 
                            className="max-h-64 rounded-lg object-cover"
                          />
                        ) : (
                          <video 
                            src={selectedMedia.url} 
                            controls 
                            className="max-h-64 rounded-lg"
                          />
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          className="absolute top-2 right-2 bg-background/80 hover:bg-background"
                          onClick={() => setSelectedMedia(null)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}

                    <div className="flex items-center justify-between ml-16">
                      <div className="flex gap-2">
                        <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-primary hover:text-primary/80"
                        >
                          <ImageIcon className="h-5 w-5 mr-2" />
                          Photo
                        </Button>
                        <input
                          type="file"
                          accept="video/*"
                          ref={videoInputRef}
                          onChange={handleVideoSelect}
                          className="hidden"
                        />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => videoInputRef.current?.click()}
                          className="text-primary hover:text-primary/80"
                        >
                          <Video className="h-5 w-5 mr-2" />
                          Video
                        </Button>
                      </div>
                      <Button 
                        onClick={handlePost}
                        className="btn-web3"
                        disabled={!newPostContent.trim() && !selectedMedia}
                      >
                        <Send className="h-4 w-4 mr-2" />
                        Post
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">Login to share your thoughts with the community</p>
                    <Link to="/login">
                      <Button className="btn-web3">
                        Login to Post
                      </Button>
                    </Link>
                  </div>
                )}
              </Card>

              {/* Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="glass w-full justify-start">
                  <TabsTrigger value="for-you" className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4" />
                    For You
                  </TabsTrigger>
                  <TabsTrigger value="following" className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Following
                  </TabsTrigger>
                  <TabsTrigger value="trending" className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Trending
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="for-you" className="space-y-4 mt-4">
                  {posts.map((post) => (
                    <PostCard 
                      key={post.id} 
                      post={post} 
                      onLike={() => likePost(post.id)}
                      onDelete={() => handleDelete(post.id)}
                      formatTime={formatTime}
                      currentUser={user}
                      comments={getCommentsForPost(post.id)}
                      onAddComment={(content) => {
                        if (user) {
                          addComment(post.id, {
                            author: {
                              name: user.name,
                              username: `@${user.name.toLowerCase().replace(/\s+/g, '')}`,
                              avatar: user.role === 'seller' ? '/Topan.jpg' : '/dus.JPG',
                              isVerified: user.role === 'seller',
                              role: user.role
                            },
                            content
                          });
                        }
                      }}
                      onLikeComment={likeComment}
                      onDeleteComment={deleteComment}
                    />
                  ))}
                </TabsContent>

                <TabsContent value="following" className="space-y-4 mt-4">
                  {posts.filter(p => p.author.isVerified).map((post) => (
                    <PostCard 
                      key={post.id} 
                      post={post} 
                      onLike={() => likePost(post.id)}
                      onDelete={() => handleDelete(post.id)}
                      formatTime={formatTime}
                      currentUser={user}
                      comments={getCommentsForPost(post.id)}
                      onAddComment={(content) => {
                        if (user) {
                          addComment(post.id, {
                            author: {
                              name: user.name,
                              username: `@${user.name.toLowerCase().replace(/\s+/g, '')}`,
                              avatar: user.role === 'seller' ? '/Topan.jpg' : '/dus.JPG',
                              isVerified: user.role === 'seller',
                              role: user.role
                            },
                            content
                          });
                        }
                      }}
                      onLikeComment={likeComment}
                      onDeleteComment={deleteComment}
                    />
                  ))}
                </TabsContent>

                <TabsContent value="trending" className="space-y-4 mt-4">
                  {[...posts].sort((a, b) => b.likes - a.likes).map((post) => (
                    <PostCard 
                      key={post.id} 
                      post={post} 
                      onLike={() => likePost(post.id)}
                      onDelete={() => handleDelete(post.id)}
                      formatTime={formatTime}
                      currentUser={user}
                      comments={getCommentsForPost(post.id)}
                      onAddComment={(content) => {
                        if (user) {
                          addComment(post.id, {
                            author: {
                              name: user.name,
                              username: `@${user.name.toLowerCase().replace(/\s+/g, '')}`,
                              avatar: user.role === 'seller' ? '/Topan.jpg' : '/dus.JPG',
                              isVerified: user.role === 'seller',
                              role: user.role
                            },
                            content
                          });
                        }
                      }}
                      onLikeComment={likeComment}
                      onDeleteComment={deleteComment}
                    />
                  ))}
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 space-y-6">
              {/* Trending Topics */}
              <Card className="glass border-border/50 p-4">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Trending Topics
                </h3>
                <div className="space-y-3">
                  {trendingTopics.map((topic, idx) => (
                    <div key={idx} className="flex justify-between items-center hover:bg-muted/30 p-2 rounded-lg cursor-pointer transition-colors">
                      <div>
                        <p className="font-medium text-primary">{topic.tag}</p>
                        <p className="text-xs text-muted-foreground">{topic.posts} posts</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Who to Follow */}
              <Card className="glass border-border/50 p-4">
                <h3 className="font-semibold text-lg mb-4 flex items-center gap-2">
                  <Users className="h-5 w-5 text-primary" />
                  Verified Suppliers
                </h3>
                <div className="space-y-4">
                  {suggestedAccounts.map((account, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage src={account.avatar} />
                          <AvatarFallback>{account.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                          <div className="flex items-center gap-1">
                            <p className="font-medium text-sm">{account.name}</p>
                            {account.verified && (
                              <BadgeCheck className="h-4 w-4 text-primary fill-primary/20" />
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">{account.username}</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm" className="btn-web3-outline text-xs">
                        Follow
                      </Button>
                    </div>
                  ))}
                </div>
              </Card>

              {/* Community Stats */}
              <Card className="glass border-border/50 p-4">
                <h3 className="font-semibold text-lg mb-4">Community Stats</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <p className="text-2xl font-bold text-primary">2.4K</p>
                    <p className="text-xs text-muted-foreground">Active Members</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <p className="text-2xl font-bold text-primary">156</p>
                    <p className="text-xs text-muted-foreground">Verified Suppliers</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <p className="text-2xl font-bold text-primary">8.9K</p>
                    <p className="text-xs text-muted-foreground">Posts Today</p>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-muted/30">
                    <p className="text-2xl font-bold text-primary">45K</p>
                    <p className="text-xs text-muted-foreground">Transactions</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </main>

      <Web3Footer />
    </div>
  );
};

// Post Card Component
interface PostCardProps {
  post: {
    id: string;
    author: {
      name: string;
      username: string;
      avatar: string;
      isVerified: boolean;
      role: 'buyer' | 'seller';
    };
    content: string;
    media?: {
      type: 'image' | 'video';
      url: string;
    };
    likes: number;
    comments: number;
    reposts: number;
    timestamp: string;
    likedByUser: boolean;
  };
  onLike: () => void;
  onDelete: () => void;
  formatTime: (timestamp: string) => string;
  currentUser: { name: string; role: string } | null;
  comments: Comment[];
  onAddComment: (content: string) => void;
  onLikeComment: (commentId: string) => void;
  onDeleteComment: (commentId: string) => void;
}

const PostCard = ({ 
  post, 
  onLike, 
  onDelete, 
  formatTime, 
  currentUser,
  comments,
  onAddComment,
  onLikeComment,
  onDeleteComment
}: PostCardProps) => {
  const isOwnPost = currentUser?.name === post.author.name;
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");

  const handleAddComment = () => {
    if (!currentUser) {
      toast({
        title: "Login Required",
        description: "Please login to comment",
        variant: "destructive"
      });
      return;
    }
    if (!newComment.trim()) return;
    
    onAddComment(newComment);
    setNewComment("");
    toast({
      title: "Comment added",
      description: "Your comment has been posted"
    });
  };

  return (
    <Card className="glass border-border/50 p-4 hover:border-primary/30 transition-all duration-300">
      <div className="flex gap-4">
        <Avatar className="h-12 w-12">
          <AvatarImage src={post.author.avatar} />
          <AvatarFallback>{post.author.name.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold">{post.author.name}</span>
              {post.author.isVerified && (
                <BadgeCheck className="h-5 w-5 text-primary fill-primary/20" />
              )}
              <span className="text-muted-foreground text-sm">{post.author.username}</span>
              <span className="text-muted-foreground text-sm">·</span>
              <span className="text-muted-foreground text-sm">{formatTime(post.timestamp)}</span>
            </div>
            {isOwnPost && (
              <Button 
                variant="ghost" 
                size="icon" 
                className="text-muted-foreground hover:text-destructive"
                onClick={onDelete}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
          </div>

          <p className="mt-2 text-foreground whitespace-pre-wrap">{post.content}</p>

          {post.media && (
            <div className="mt-3 rounded-xl overflow-hidden border border-border/50">
              {post.media.type === 'image' ? (
                <img 
                  src={post.media.url} 
                  alt="Post media" 
                  className="w-full max-h-96 object-cover"
                />
              ) : (
                <video 
                  src={post.media.url} 
                  controls 
                  className="w-full max-h-96"
                />
              )}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between mt-4 max-w-md">
            <Button 
              variant="ghost" 
              size="sm" 
              className={`gap-2 ${showComments ? 'text-primary' : 'text-muted-foreground hover:text-primary'}`}
              onClick={() => setShowComments(!showComments)}
            >
              <MessageCircle className={`h-4 w-4 ${showComments ? 'fill-primary/20' : ''}`} />
              <span className="text-sm">{post.comments}</span>
              {showComments ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-green-500 gap-2"
            >
              <Repeat2 className="h-4 w-4" />
              <span className="text-sm">{post.reposts}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className={`gap-2 ${post.likedByUser ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}
              onClick={onLike}
            >
              <Heart className={`h-4 w-4 ${post.likedByUser ? 'fill-current' : ''}`} />
              <span className="text-sm">{post.likes}</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-muted-foreground hover:text-primary"
            >
              <Share className="h-4 w-4" />
            </Button>
          </div>

          {/* Comments Section */}
          {showComments && (
            <div className="mt-4 pt-4 border-t border-border/50 space-y-4">
              {/* Add Comment */}
              {currentUser ? (
                <div className="flex gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={currentUser.role === 'seller' ? '/Topan.jpg' : '/dus.JPG'} />
                    <AvatarFallback>{currentUser.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 flex gap-2">
                    <Input
                      placeholder="Write a comment..."
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                      className="bg-background/50 border-border/50"
                    />
                    <Button 
                      size="sm" 
                      onClick={handleAddComment}
                      disabled={!newComment.trim()}
                      className="btn-web3"
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-2">
                  <Link to="/login" className="text-primary hover:underline text-sm">
                    Login to comment
                  </Link>
                </div>
              )}

              {/* Comments List */}
              {comments.length > 0 ? (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <CommentCard
                      key={comment.id}
                      comment={comment}
                      formatTime={formatTime}
                      currentUser={currentUser}
                      onLike={() => onLikeComment(comment.id)}
                      onDelete={() => onDeleteComment(comment.id)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-center text-muted-foreground text-sm py-2">
                  No comments yet. Be the first to comment!
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

// Comment Card Component
interface CommentCardProps {
  comment: Comment;
  formatTime: (timestamp: string) => string;
  currentUser: { name: string; role: string } | null;
  onLike: () => void;
  onDelete: () => void;
}

const CommentCard = ({ comment, formatTime, currentUser, onLike, onDelete }: CommentCardProps) => {
  const isOwnComment = currentUser?.name === comment.author.name;

  return (
    <div className="flex gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/30 transition-colors">
      <Avatar className="h-8 w-8">
        <AvatarImage src={comment.author.avatar} />
        <AvatarFallback>{comment.author.name.charAt(0)}</AvatarFallback>
      </Avatar>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-medium text-sm">{comment.author.name}</span>
          {comment.author.isVerified && (
            <BadgeCheck className="h-4 w-4 text-primary fill-primary/20" />
          )}
          <span className="text-muted-foreground text-xs">{comment.author.username}</span>
          <span className="text-muted-foreground text-xs">·</span>
          <span className="text-muted-foreground text-xs">{formatTime(comment.timestamp)}</span>
        </div>
        <p className="mt-1 text-sm text-foreground">{comment.content}</p>
        <div className="flex items-center gap-4 mt-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className={`h-6 px-2 gap-1 ${comment.likedByUser ? 'text-red-500' : 'text-muted-foreground hover:text-red-500'}`}
            onClick={onLike}
          >
            <Heart className={`h-3 w-3 ${comment.likedByUser ? 'fill-current' : ''}`} />
            <span className="text-xs">{comment.likes}</span>
          </Button>
          {isOwnComment && (
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-6 px-2 text-muted-foreground hover:text-destructive"
              onClick={onDelete}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Community;
