import React, { useState } from "react";
import { useContestStore } from "../stores/useContestStore";
import { Calendar, Clock, Globe, Video, Plus, X, Check } from "lucide-react";
import { useTheme } from "../components/ThemeProvider.jsx";

const AdminContestCard = ({ contest }) => {
    const { updateSolutionLink } = useContestStore();
    const [newLink, setNewLink] = useState("");
    const [showInput, setShowInput] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { theme } = useTheme();

    const id = contest._id;

    // Format date nicely
    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    // Format duration
    const formatDuration = (milliseconds) => {
        const hours = Math.floor(milliseconds / (1000 * 60 * 60));
        const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
        
        return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`;
    };

    // Determine contest status and styling
    const getStatusStyle = () => {
        const now = Date.now();
        if (contest.rawStartTime > now) {
            return theme === 'dark' 
                ? "bg-blue-900/30 text-blue-400" 
                : "bg-blue-100 text-blue-600";
        } else if (contest.rawStartTime <= now && now < contest.rawStartTime + contest.rawDuration) {
            return theme === 'dark' 
                ? "bg-green-900/30 text-green-400" 
                : "bg-green-100 text-green-600";
        } else {
            return theme === 'dark' 
                ? "bg-gray-800 text-gray-400" 
                : "bg-gray-200 text-gray-600";
        }
    };

    const getStatusText = () => {
        const now = Date.now();
        if (contest.rawStartTime > now) {
            return "Upcoming";
        } else if (contest.rawStartTime <= now && now < contest.rawStartTime + contest.rawDuration) {
            return "Ongoing";
        } else {
            return "Finished";
        }
    };

    const handleAddLink = async (e) => {
        e.preventDefault();
        if (!newLink) return;

        setIsSubmitting(true);
        try {
            const data = { id, newLink };
            await updateSolutionLink(data);
            setNewLink("");
            setShowInput(false);
        } catch (error) {
            console.error("Error updating solution link:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={`${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-gray-200' : 'bg-white border-gray-200 text-gray-700'} border rounded-xl shadow-lg hover:shadow-xl transition-all overflow-hidden`}>
            <div className="p-5">
                {/* Header with status and platform */}
                <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle()}`}>
                        {getStatusText()}
                    </span>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${theme === 'dark' ? 'bg-purple-900/30 text-purple-400' : 'bg-purple-100 text-purple-600'}`}>
                        {contest.platform}
                    </span>
                </div>
                
                {/* Title */}
                <h2 className={`text-xl font-bold mb-3 ${theme === 'dark' ? 'text-white' : 'text-gray-800'}`}>
                    {contest.title}
                </h2>
                
                {/* Details with icons */}
                <div className="space-y-2 mb-4">
                    <div className="flex items-center">
                        <Calendar size={16} className={`mr-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
                        <span>{formatDate(contest.rawStartTime)}</span>
                    </div>
                    <div className="flex items-center">
                        <Clock size={16} className={`mr-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
                        <span>Duration: {formatDuration(contest.rawDuration)}</span>
                    </div>
                </div>
                
                {/* Contest link */}
                <a
                    href={contest.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center ${theme === 'dark' ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-700'} transition-colors`}
                >
                    <Globe size={16} className="mr-2" />
                    View Contest
                </a>

                {/* Add Solution Link Section */}
                <div className="mt-5 pt-4 border-t border-gray-700/20">
                    {!showInput ? (
                        <button
                            onClick={() => setShowInput(true)}
                            className={`inline-flex items-center px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-green-800/30 text-green-400 hover:bg-green-800/50' : 'bg-green-100 text-green-600 hover:bg-green-200'} transition-colors`}
                        >
                            <Plus size={18} className="mr-2" />
                            Add Solution Link
                        </button>
                    ) : (
                        <div className="space-y-3">
                            <div className={`flex items-center p-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700/50' : 'bg-gray-100'}`}>
                                <Video size={18} className={`mr-2 ${theme === 'dark' ? 'text-blue-400' : 'text-blue-500'}`} />
                                <input
                                    type="text"
                                    placeholder="Enter YouTube Solution Link"
                                    value={newLink}
                                    onChange={(e) => setNewLink(e.target.value)}
                                    className={`flex-grow bg-transparent border-none focus:outline-none focus:ring-0 ${theme === 'dark' ? 'placeholder-gray-500' : 'placeholder-gray-400'}`}
                                />
                            </div>
                            
                            <div className="flex gap-2">
                                <button
                                    onClick={handleAddLink}
                                    disabled={isSubmitting || !newLink}
                                    className={`flex-1 inline-flex items-center justify-center px-4 py-2 rounded-lg ${
                                        isSubmitting || !newLink
                                            ? 'bg-gray-400 cursor-not-allowed text-gray-200'
                                            : theme === 'dark'
                                                ? 'bg-blue-600 hover:bg-blue-700 text-white'
                                                : 'bg-blue-500 hover:bg-blue-600 text-white'
                                    } transition-colors`}
                                >
                                    {isSubmitting ? (
                                        <span className="inline-flex items-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Submitting...
                                        </span>
                                    ) : (
                                        <>
                                            <Check size={18} className="mr-2" />
                                            Submit Link
                                        </>
                                    )}
                                </button>
                                
                                <button
                                    onClick={() => setShowInput(false)}
                                    className={`inline-flex items-center justify-center px-4 py-2 rounded-lg ${theme === 'dark' ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-700'} transition-colors`}
                                >
                                    <X size={18} className="mr-2" />
                                    Cancel
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminContestCard;