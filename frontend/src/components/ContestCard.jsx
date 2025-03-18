import React, { useState, useEffect } from 'react';
import { useContestStore } from '../stores/useContestStore.js';
import { useAuthStore } from '../stores/useAuthStore.js';
import toast from 'react-hot-toast';
import { Bookmark, BookmarkMinus, Calendar, MonitorPlay, Timer } from 'lucide-react';

const ContestCard = ({ contest, isBookmarked }) => {
    const { addBookmark, removeBookmark } = useContestStore();
    const { authUser } = useAuthStore();

    const [timeLeft, setTimeLeft] = useState(null);

    useEffect(() => {
        const updateCountdown = () => {
            const now = new Date();
            const startTime = new Date(contest.rawStartTime);
            const endtTime = new Date(contest.rawStartTime + contest.rawDuration);
            const diff = startTime - now;
            const diffend = endtTime - now;

            if (diffend <= 0) {
                setTimeLeft('Contest is over!');
                return;
            }
            if(diff<=0){
                setTimeLeft('Contest has started!')
            }

            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((diff % (1000 * 60)) / 1000);

            setTimeLeft(`${days}d ${hours}h ${minutes}m ${seconds}s`);
        };

        const timerId = setInterval(updateCountdown, 1000);

        return () => clearInterval(timerId);
    }, [contest.rawStartTime]);

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

    return (
        <div className="relative bg-gray-700 w-full shadow-lg rounded-2xl p-6 mb-4 border border-gray-200">
            <h2 className="text-2xl font-bold text-white mb-2">{contest.title}</h2>

            {/* Status and Start Time */}
            <div className="flex justify-between text-white mb-1">
                <p className='text-lg'>Status: <span className={`font-medium ${contest.status === 'upcoming' ? 'text-green-500' : 'text-red-500'}`}>{contest.status}</span></p>
                <p><Calendar className="inline-block mr-1" size={16} /> Start Time: <span className="font-medium">{new Date(contest.rawStartTime).toLocaleString()}</span></p>
            </div>

            {/* Duration and Time Left */}
            <div className="flex justify-between mb-3">
                <p className='text-white text-lg'><Timer className='inline-block mr-1' size={16} />Duration: <span className="font-medium text-white">{Math.floor(contest.rawDuration / 3600000)} hrs</span></p>
                <p className="text-blue-600 font-semibold text-xl">Time Left: {timeLeft}</p>
            </div>

            <a href={contest.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline text-lg">
                View Contest
            </a>
            {contest.solutionLink && (
                <a href={contest.solutionLink} target="_blank" rel="noopener noreferrer" className="block text-green-500 hover:underline mt-2 text-xl">
                    <MonitorPlay className="inline-block mr-1" size={18} /> View Solution
                </a>
            )}

            <button
                onClick={isBookmarked ? handleRemoveBookmark : handleBookmark}
                className={`absolute bottom-4 right-4 px-4 py-2 rounded-xl font-semibold ${isBookmarked ? 'bg-red-500 hover:bg-red-600' : 'bg-yellow-500 hover:bg-yellow-600'} text-white shadow-lg transition-all duration-200 flex items-center gap-2`}>
                {isBookmarked ? <BookmarkMinus size={20} /> : <Bookmark size={20} />}
                {isBookmarked ? 'Remove Bookmark' : 'Bookmark'}
            </button>
        </div>
    );
};

export default ContestCard;
