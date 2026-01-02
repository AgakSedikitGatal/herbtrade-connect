import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export interface Comment {
  id: string;
  postId: string;
  author: {
    name: string;
    username: string;
    avatar: string;
    isVerified: boolean;
    role: 'buyer' | 'seller';
  };
  content: string;
  timestamp: string;
  likes: number;
  likedByUser: boolean;
}

export interface Post {
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
}

interface CommunityContextType {
  posts: Post[];
  comments: Comment[];
  addPost: (post: Omit<Post, 'id' | 'timestamp' | 'likes' | 'comments' | 'reposts' | 'likedByUser'>) => void;
  likePost: (postId: string) => void;
  deletePost: (postId: string) => void;
  addComment: (postId: string, comment: Omit<Comment, 'id' | 'postId' | 'timestamp' | 'likes' | 'likedByUser'>) => void;
  likeComment: (commentId: string) => void;
  deleteComment: (commentId: string) => void;
  getCommentsForPost: (postId: string) => Comment[];
}

const CommunityContext = createContext<CommunityContextType | undefined>(undefined);

const STORAGE_KEY = 'herblocx_community_posts';
const COMMENTS_STORAGE_KEY = 'herblocx_community_comments';
// Initial mock posts
const initialPosts: Post[] = [
  {
    id: '1',
    author: {
      name: 'PT. Herbal Nusantara',
      username: '@herbalnusantara',
      avatar: '/nyam.jpg',
      isVerified: true,
      role: 'seller'
    },
    content: 'Excited to announce our new batch of premium organic turmeric! 🌿 Sourced directly from Javanese farms with full blockchain traceability. Contact us for wholesale inquiries. #Turmeric #OrganicHerbs #HerBlocX',
    media: {
      type: 'image',
      url: '/turmeric.jpg'
    },
    likes: 128,
    comments: 24,
    reposts: 15,
    timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    likedByUser: false
  },
  {
    id: '2',
    author: {
      name: 'Green Botanics Co.',
      username: '@greenbotanics',
      avatar: '/aul.JPG',
      isVerified: true,
      role: 'seller'
    },
    content: 'Just completed our 500th verified transaction on HerBlocX! 🎉 Thank you to all our buyers for trusting us. Transparency and quality are our top priorities. The blockchain never lies! 💚',
    likes: 256,
    comments: 42,
    reposts: 38,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    likedByUser: false
  },
  {
    id: '3',
    author: {
      name: 'Ahmad Buyer',
      username: '@ahmadb',
      avatar: '/dus.JPG',
      isVerified: false,
      role: 'buyer'
    },
    content: 'Just received my order of Andrographis from @herbalnusantara - amazing quality! The tracking on HerBlocX made the whole process so transparent. Highly recommend! 🌱',
    media: {
      type: 'image',
      url: '/andrographis.jpg'
    },
    likes: 89,
    comments: 12,
    reposts: 5,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    likedByUser: false
  },
  {
    id: '4',
    author: {
      name: 'Spice Masters Ltd',
      username: '@spicemasters',
      avatar: '/yan.jpg',
      isVerified: true,
      role: 'seller'
    },
    content: 'Our Ceylon Cinnamon just got ISO 22000 certified! 🏆 Every batch is now traceable from farm to your facility. Check our updated product page on HerBlocX marketplace.',
    media: {
      type: 'image',
      url: '/cinnamon.jpg'
    },
    likes: 312,
    comments: 56,
    reposts: 89,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    likedByUser: false
  },
  {
    id: '5',
    author: {
      name: 'Natural Herbs Indonesia',
      username: '@naturalherbsid',
      avatar: '/fio.jpg',
      isVerified: true,
      role: 'seller'
    },
    content: 'Blockchain technology is revolutionizing the herbal trade industry. No more fraud, no more fake certifications. Just pure transparency! 🔗✨ What do you think about Web3 in agriculture?',
    likes: 445,
    comments: 78,
    reposts: 102,
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    likedByUser: false
  }
];

// Initial mock comments
const initialComments: Comment[] = [
  {
    id: 'c1',
    postId: '1',
    author: {
      name: 'Budi Santoso',
      username: '@budisantoso',
      avatar: '/dus.JPG',
      isVerified: false,
      role: 'buyer'
    },
    content: 'Great quality turmeric! Just placed an order. Looking forward to receiving it.',
    timestamp: new Date(Date.now() - 1000 * 60 * 20).toISOString(),
    likes: 5,
    likedByUser: false
  },
  {
    id: 'c2',
    postId: '1',
    author: {
      name: 'Green Botanics Co.',
      username: '@greenbotanics',
      avatar: '/aul.JPG',
      isVerified: true,
      role: 'seller'
    },
    content: 'Congratulations on the new batch! Your turmeric is always top-notch. 🌿',
    timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    likes: 12,
    likedByUser: false
  },
  {
    id: 'c3',
    postId: '2',
    author: {
      name: 'Ahmad Buyer',
      username: '@ahmadb',
      avatar: '/dus.JPG',
      isVerified: false,
      role: 'buyer'
    },
    content: 'Amazing milestone! Your products have always been reliable. Keep it up! 💪',
    timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
    likes: 8,
    likedByUser: false
  }
];

export const CommunityProvider = ({ children }: { children: ReactNode }) => {
  const [posts, setPosts] = useState<Post[]>(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : initialPosts;
  });

  const [comments, setComments] = useState<Comment[]>(() => {
    const stored = localStorage.getItem(COMMENTS_STORAGE_KEY);
    return stored ? JSON.parse(stored) : initialComments;
  });

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem(COMMENTS_STORAGE_KEY, JSON.stringify(comments));
  }, [comments]);

  const addPost = (postData: Omit<Post, 'id' | 'timestamp' | 'likes' | 'comments' | 'reposts' | 'likedByUser'>) => {
    const newPost: Post = {
      ...postData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      likes: 0,
      comments: 0,
      reposts: 0,
      likedByUser: false
    };
    setPosts(prev => [newPost, ...prev]);
  };

  const likePost = (postId: string) => {
    setPosts(prev => prev.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          likes: post.likedByUser ? post.likes - 1 : post.likes + 1,
          likedByUser: !post.likedByUser
        };
      }
      return post;
    }));
  };

  const deletePost = (postId: string) => {
    setPosts(prev => prev.filter(post => post.id !== postId));
    // Also delete associated comments
    setComments(prev => prev.filter(comment => comment.postId !== postId));
  };

  const addComment = (postId: string, commentData: Omit<Comment, 'id' | 'postId' | 'timestamp' | 'likes' | 'likedByUser'>) => {
    const newComment: Comment = {
      ...commentData,
      id: `c-${Date.now()}`,
      postId,
      timestamp: new Date().toISOString(),
      likes: 0,
      likedByUser: false
    };
    setComments(prev => [...prev, newComment]);
    // Update comment count on the post
    setPosts(prev => prev.map(post => 
      post.id === postId ? { ...post, comments: post.comments + 1 } : post
    ));
  };

  const likeComment = (commentId: string) => {
    setComments(prev => prev.map(comment => {
      if (comment.id === commentId) {
        return {
          ...comment,
          likes: comment.likedByUser ? comment.likes - 1 : comment.likes + 1,
          likedByUser: !comment.likedByUser
        };
      }
      return comment;
    }));
  };

  const deleteComment = (commentId: string) => {
    const comment = comments.find(c => c.id === commentId);
    if (comment) {
      setComments(prev => prev.filter(c => c.id !== commentId));
      // Update comment count on the post
      setPosts(prev => prev.map(post => 
        post.id === comment.postId ? { ...post, comments: Math.max(0, post.comments - 1) } : post
      ));
    }
  };

  const getCommentsForPost = (postId: string) => {
    return comments.filter(comment => comment.postId === postId);
  };

  return (
    <CommunityContext.Provider value={{ 
      posts, 
      comments,
      addPost, 
      likePost, 
      deletePost,
      addComment,
      likeComment,
      deleteComment,
      getCommentsForPost
    }}>
      {children}
    </CommunityContext.Provider>
  );
};

export const useCommunity = () => {
  const context = useContext(CommunityContext);
  if (!context) {
    throw new Error('useCommunity must be used within a CommunityProvider');
  }
  return context;
};
