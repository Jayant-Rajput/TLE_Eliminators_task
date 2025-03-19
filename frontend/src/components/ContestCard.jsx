import React, { useState, useEffect } from 'react';
import { useContestStore } from '../stores/useContestStore.js';
import { useAuthStore } from '../stores/useAuthStore.js';
import toast from 'react-hot-toast';
import { Bookmark, BookmarkMinus, Calendar, MonitorPlay, Timer, ExternalLink } from 'lucide-react';

const ContestCard = ({ contest, isBookmarked }) => {
    const { addBookmark, removeBookmark } = useContestStore();
    const { authUser } = useAuthStore();
    const [timeLeft, setTimeLeft] = useState(null);
    const [isHovered, setIsHovered] = useState(false);

    useEffect(() => {
        const updateCountdown = () => {
            const now = new Date();
            const startTime = new Date(contest.rawStartTime);
            const endTime = new Date(contest.rawStartTime + contest.rawDuration);
            const diff = startTime - now;
            const diffEnd = endTime - now;

            if (diffEnd <= 0) {
                setTimeLeft('Contest is over!');
                return;
            }
            if (diff <= 0) {
                setTimeLeft('Contest has started!');
                return;
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        };

        const timerId = setInterval(updateCountdown, 1000);
        return () => clearInterval(timerId);
    }, [contest.rawStartTime, contest.rawDuration]);

    const handleBookmark = async (e) => {
        e.preventDefault();

        if (authUser === null) {
            toast.error('Please login to bookmark contests');
            return;
        }

        const data = { contestId: contest._id, userId: authUser._id };
        await addBookmark(data);
    };

    const handleRemoveBookmark = async (e) => {
        e.preventDefault();
        const data = { contestId: contest._id, userId: authUser._id };
        await removeBookmark(data);
    };

    // Determine status badge color
    const getStatusColor = (status) => {
        if (status === 'upcoming') return 'bg-green-500';
        if (status === 'ongoing') return 'bg-yellow-500';
        return 'bg-red-500';
    };

    // Determine platform icon/badge color
    const getPlatformColor = (platform) => {
        const platformLower = platform.toLowerCase();
        if (platformLower.includes('codeforces')) return 'bg-blue-600';
        if (platformLower.includes('codechef')) return 'bg-orange-500';
        if (platformLower.includes('leetcode')) return 'bg-yellow-600';
        return 'bg-purple-500';
    };

    return (
        <div 
            className="relative bg-gray-800 w-full shadow-xl rounded-2xl p-6 mb-4 border border-gray-700 transition-all duration-300 hover:shadow-2xl hover:border-blue-500"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Platform Badge */}
            <div className={`absolute top-0 right-0 ${getPlatformColor(contest.platform)} px-4 py-1 rounded-bl-lg rounded-tr-2xl text-white font-medium`}>
                {contest.platform}
            </div>

            {/* Title */}
            <h2 className="text-2xl font-bold text-white mb-4 pr-24">{contest.title}</h2>

            {/* Status Badge */}
            <div className="flex items-center mb-4">
                <span className={`${getStatusColor(contest.status)} text-white px-3 py-1 rounded-full text-sm font-medium`}>
                    {contest.status.toUpperCase()}
                </span>
                <span className="text-blue-400 font-semibold text-lg ml-4">
                    {timeLeft}
                </span>
            </div>

            {/* Start Time and Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mb-5">
                <div className="flex items-center text-gray-300">
                    <Calendar className="mr-2" size={18} />
                    <span className="text-gray-400">Start:</span>
                    <span className="font-medium text-white ml-2">
                        {new Date(contest.rawStartTime).toLocaleString()}
                    </span>
                </div>
                <div className="flex items-center text-gray-300">
                    <Timer className="mr-2" size={18} />
                    <span className="text-gray-400">Duration:</span>
                    <span className="font-medium text-white ml-2">
                        {Math.floor(contest.rawDuration / 3600000)} hours
                    </span>
                </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap items-center justify-between mt-4">
                <div className="space-x-3">
                    <a 
                        href={contest.url} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                    >
                        <ExternalLink className="mr-2" size={16} />
                        View Contest
                    </a>
                    
                    {contest.solutionLink && (
                        <a 
                            href={contest.solutionLink} 
                            target="_blank" 
                            rel="noopener noreferrer" 
                            className="inline-flex items-center bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200"
                        >
                            <MonitorPlay className="mr-2" size={16} />
                            View Solution
                        </a>
                    )}
                </div>

                <button
                    onClick={isBookmarked ? handleRemoveBookmark : handleBookmark}
                    className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-white transition-all duration-200 ${
                        isBookmarked 
                            ? 'bg-red-500 hover:bg-red-600' 
                            : 'bg-yellow-500 hover:bg-yellow-600'
                    }`}
                >
                    {isBookmarked ? <BookmarkMinus size={18} /> : <Bookmark size={18} />}
                    {isHovered || window.innerWidth > 768 ? (isBookmarked ? 'Remove Bookmark' : 'Bookmark') : ''}
                </button>
            </div>
        </div>
    );
};

export default ContestCard;