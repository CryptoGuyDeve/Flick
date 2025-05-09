import { User, Post } from './types';

export const users: User[] = [
    {
        id: "1",
        username: "johndoe",
        name: "John Doe",
        image: "https://i.pravatar.cc/150?img=1",
        bio: "Software developer | Coffee enthusiast | Travel lover"
    },
    {
        id: "2",
        username: "sarahsmith",
        name: "Sarah Smith",
        image: "https://i.pravatar.cc/150?img=2",
        bio: "UX Designer | Art lover | Photography"
    },
    {
        id: "3",
        username: "mike_wilson",
        name: "Mike Wilson",
        image: "https://i.pravatar.cc/150?img=3",
        bio: "Tech entrepreneur | Fitness freak | Foodie"
    },
    {
        id: "4",
        username: "emily_j",
        name: "Emily Johnson",
        image: "https://i.pravatar.cc/150?img=4",
        bio: "Digital artist | Music lover | Bookworm"
    },
    {
        id: "5",
        username: "alex_tech",
        name: "Alex Thompson",
        image: "https://i.pravatar.cc/150?img=5",
        bio: "AI researcher | Chess player | Nature enthusiast"
    }
];

export const posts: Post[] = [
    {
        id: "1",
        createdAt: "2024-03-15T10:00:00Z",
        content: "Just launched my new React Native app! 🚀 #coding #reactnative",
        user_id: "1",
        user: "johndoe",
        parent_id: null,
        parent: null,
        replies: []
    },
    {
        id: "2",
        createdAt: "2024-03-15T10:05:00Z",
        content: "That's awesome! Can't wait to try it out!",
        user_id: "2",
        user: "sarahsmith",
        parent_id: "1",
        parent: null,
        replies: []
    },
    {
        id: "3",
        createdAt: "2024-03-15T10:10:00Z",
        content: "Working on some exciting new UI designs today! 🎨",
        user_id: "2",
        user: "sarahsmith",
        parent_id: null,
        parent: null,
        replies: []
    },
    {
        id: "4",
        createdAt: "2024-03-15T11:00:00Z",
        content: "Just finished a 10km run! 💪 #fitness #health",
        user_id: "3",
        user: "mike_wilson",
        parent_id: null,
        parent: null,
        replies: []
    },
    {
        id: "5",
        createdAt: "2024-03-15T11:30:00Z",
        content: "Great job! Keep up the good work!",
        user_id: "4",
        user: "emily_j",
        parent_id: "4",
        parent: null,
        replies: []
    },
    {
        id: "6",
        createdAt: "2024-03-15T12:00:00Z",
        content: "Working on some new digital art pieces. Will share soon! 🎨",
        user_id: "4",
        user: "emily_j",
        parent_id: null,
        parent: null,
        replies: []
    },
    {
        id: "7",
        createdAt: "2024-03-15T13:00:00Z",
        content: "Just published a new research paper on AI advancements!",
        user_id: "5",
        user: "alex_tech",
        parent_id: null,
        parent: null,
        replies: []
    },
    {
        id: "8",
        createdAt: "2024-03-15T13:05:00Z",
        content: "Congratulations! Would love to read it.",
        user_id: "1",
        user: "johndoe",
        parent_id: "7",
        parent: null,
        replies: []
    },
    {
        id: "9",
        createdAt: "2024-03-15T14:00:00Z",
        content: "Beautiful day for a hike! 🌲 #nature #outdoors",
        user_id: "5",
        user: "alex_tech",
        parent_id: null,
        parent: null,
        replies: []
    },
    {
        id: "10",
        createdAt: "2024-03-15T15:00:00Z",
        content: "Just finished reading an amazing book! Any recommendations?",
        user_id: "4",
        user: "emily_j",
        parent_id: null,
        parent: null,
        replies: []
    },
    {
        id: "11",
        createdAt: "2024-03-15T15:30:00Z",
        content: "I've been reading 'The Pragmatic Programmer', highly recommend!",
        user_id: "1",
        user: "johndoe",
        parent_id: "10",
        parent: null,
        replies: []
    },
    {
        id: "12",
        createdAt: "2024-03-15T16:00:00Z",
        content: "Working on a new startup idea! Excited to share more soon.",
        user_id: "3",
        user: "mike_wilson",
        parent_id: null,
        parent: null,
        replies: []
    },
    {
        id: "13",
        createdAt: "2024-03-15T16:05:00Z",
        content: "Can't wait to hear more about it!",
        user_id: "2",
        user: "sarahsmith",
        parent_id: "12",
        parent: null,
        replies: []
    },
    {
        id: "14",
        createdAt: "2024-03-15T17:00:00Z",
        content: "Just completed a new UI design project! Check it out!",
        user_id: "2",
        user: "sarahsmith",
        parent_id: null,
        parent: null,
        replies: []
    },
    {
        id: "15",
        createdAt: "2024-03-15T17:30:00Z",
        content: "Looks amazing! Great work!",
        user_id: "3",
        user: "mike_wilson",
        parent_id: "14",
        parent: null,
        replies: []
    }
];
