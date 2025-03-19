import React, { useEffect, useState } from 'react';
import ContestCard from '../components/ContestCard';
import { useContestStore } from '../stores/useContestStore';
import { Search, Filter, BookOpen, Clock, CheckCircle, X, Loader2 } from 'lucide-react';
import { useTheme } from '../components/ThemeProvider.jsx';

const HomePage = () => {
    const { allContests, fetchContests, isfetchingContests, bookmarkContest, isUpdating, triggerBookmark } = useContestStore();
    const [filterState, setFilterState] = useState(['upcoming']);
    const [searchTerm, setSearchTerm] = useState('');
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);
    const { theme } = useTheme(); // Access the theme context
    
    useEffect(() => {
        fetchContests();
    }, [triggerBookmark]);

    useEffect(() => {
        // This useEffect will run whenever theme changes
        console.log("Current theme in HomePage:", theme);
    }, [theme]);

    const handleFilterChange = (newFilter) => {
        setFilterState((prevFilterState) =>
            prevFilterState.includes(newFilter)
                ? prevFilterState.filter(filter => filter !== newFilter)
                : [...prevFilterState, newFilter]
        );
    };

    const clearFilters = () => {
        setFilterState(['upcoming']);
        setSearchTerm('');
    };

    // Categorize filters
    const platformFilters = ['CodeChef', 'CodeForces', 'LeetCode'];
    const statusFilters = ['upcoming', 'ongoing', 'finished'];
    const specialFilters = ['Bookmarks'];

    // Filter contests based on search term and filters
    const filteredContests = allContests.filter((contest) => {
        // Search term filter
        if (searchTerm && !contest.title.toLowerCase().includes(searchTerm.toLowerCase())) {
            return false;
        }

        const selectedPlatforms = platformFilters.filter(platform => filterState.includes(platform));
        const selectedStatuses = statusFilters.filter(status => filterState.includes(status));
    
        const platformMatch = selectedPlatforms.length === 0 || 
            selectedPlatforms.some(platform => contest.platform.toLowerCase() === platform.toLowerCase());
        
        const statusMatch =
            (filterState.includes('upcoming') && contest.rawStartTime > Date.now()) ||
            (filterState.includes('ongoing') && contest.rawStartTime <= Date.now() && 
                Date.now() < contest.rawStartTime + contest.rawDuration) ||
            (filterState.includes('finished') && contest.status === 'finished');

        const bookmarkMatch = filterState.includes('Bookmarks') && bookmarkContest.includes(contest._id);

        if (filterState.includes('Bookmarks')) {
            return bookmarkMatch && (searchTerm ? contest.title.toLowerCase().includes(searchTerm.toLowerCase()) : true);
        }

        if (selectedPlatforms.length && selectedStatuses.length) {
            return platformMatch && statusMatch;
        }

        return selectedStatuses.length ? statusMatch : platformMatch;
    });

    return (
        <div className={`min-h-screen ${theme === 'dark' ? 'bg-gray-900' : 'bg-gray-100'} p-4 md:p-6 transition-colors duration-200`}>
            <div className="max-w-7xl mx-auto">
                <h1 className={`text-3xl font-bold mb-6 text-center ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>
                    Competitive Programming Contests
                </h1>

                {/* Search and Filter Bar */}
                <div className="mb-8 flex flex-col md:flex-row gap-4 items-center">
                    <div className="relative flex-grow w-full">
                        <Search className={`absolute left-3 top-1/2 transform -translate-y-1/2 ${theme === 'dark' ? 'text-gray-400' : 'text-gray-500'}`} size={18} />
                        <input
                            type="text"
                            placeholder="Search contests..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className={`w-full pl-10 pr-4 py-3 ${theme === 'dark' ? 'bg-gray-800 border-gray-700 text-white' : 'bg-white border-gray-300 text-gray-900'} border rounded-lg focus:outline-none focus:border-blue-500 transition-colors`}
                        />
                    </div>
                    
                    <div className="relative flex-shrink-0 w-full md:w-auto">
                        <button 
                            onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)}
                            className="flex items-center justify-center gap-2 w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white py-3 px-5 rounded-lg transition-colors"
                        >
                            <Filter size={18} />
                            Filters {filterState.length > 0 && `(${filterState.length})`}
                        </button>
                        
                        {isFilterMenuOpen && (
                            <div className={`absolute right-0 mt-2 w-72 ${theme === 'dark' ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-300'} rounded-lg shadow-xl z-50 border p-4`}>
                                <div className="flex justify-between items-center mb-4">
                                    <h3 className={`font-medium ${theme === 'dark' ? 'text-white' : 'text-gray-900'}`}>Filters</h3>
                                    <button 
                                        onClick={() => setIsFilterMenuOpen(false)}
                                        className={`${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`}
                                    >
                                        <X size={18} />
                                    </button>
                                </div>
                                
                                <div className="mb-4">
                                    <h4 className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm mb-2 flex items-center`}>
                                        <BookOpen size={16} className="mr-2" />
                                        Platforms
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {platformFilters.map((platform) => (
                                            <button
                                                key={platform}
                                                onClick={() => handleFilterChange(platform)}
                                                className={`px-3 py-1 rounded-full text-sm ${
                                                    filterState.includes(platform) 
                                                        ? 'bg-blue-600 text-white' 
                                                        : theme === 'dark' 
                                                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }`}
                                            >
                                                {platform}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="mb-4">
                                    <h4 className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm mb-2 flex items-center`}>
                                        <Clock size={16} className="mr-2" />
                                        Status
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {statusFilters.map((status) => (
                                            <button
                                                key={status}
                                                onClick={() => handleFilterChange(status)}
                                                className={`px-3 py-1 rounded-full text-sm ${
                                                    filterState.includes(status) 
                                                        ? 'bg-blue-600 text-white' 
                                                        : theme === 'dark' 
                                                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }`}
                                            >
                                                {status.charAt(0).toUpperCase() + status.slice(1)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                <div className="mb-4">
                                    <h4 className={`${theme === 'dark' ? 'text-gray-400' : 'text-gray-600'} text-sm mb-2 flex items-center`}>
                                        <CheckCircle size={16} className="mr-2" />
                                        Special
                                    </h4>
                                    <div className="flex flex-wrap gap-2">
                                        {specialFilters.map((filter) => (
                                            <button
                                                key={filter}
                                                onClick={() => handleFilterChange(filter)}
                                                className={`px-3 py-1 rounded-full text-sm ${
                                                    filterState.includes(filter) 
                                                        ? 'bg-blue-600 text-white' 
                                                        : theme === 'dark' 
                                                            ? 'bg-gray-700 text-gray-300 hover:bg-gray-600' 
                                                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                                }`}
                                            >
                                                {filter}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                                
                                <button
                                    onClick={clearFilters}
                                    className={`w-full text-center py-2 text-sm ${theme === 'dark' ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-900'}`}
                                >
                                    Clear all filters
                                </button>
                            </div>
                        )}
                    </div>
                </div>

                {/* Applied Filters Display */}
                {filterState.length > 0 && (
                    <div className="flex flex-wrap gap-2 mb-6">
                        {filterState.map(filter => (
                            <span 
                                key={filter} 
                                className={`inline-flex items-center ${theme === 'dark' ? 'bg-blue-600/30 text-blue-400' : 'bg-blue-100 text-blue-600'} px-3 py-1 rounded-full text-sm`}
                            >
                                {filter}
                                <button 
                                    onClick={() => handleFilterChange(filter)}
                                    className={`ml-2 ${theme === 'dark' ? 'text-blue-400 hover:text-white' : 'text-blue-600 hover:text-blue-800'}`}
                                >
                                    <X size={14} />
                                </button>
                            </span>
                        ))}
                        
                        {filterState.length > 1 && (
                            <button 
                                onClick={clearFilters}
                                className={theme === 'dark' ? 'text-gray-400 hover:text-white text-sm' : 'text-gray-600 hover:text-gray-800 text-sm'}
                            >
                                Clear all
                            </button>
                        )}
                    </div>
                )}

                {/* Loading State */}
                {(isfetchingContests || isUpdating) ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
                        <p className={theme === 'dark' ? 'text-gray-400' : 'text-gray-600'}>Loading contests, please wait...</p>
                    </div>
                ) : (
                    <>
                        {/* Contest Results Count */}
                        <p className={theme === 'dark' ? 'text-gray-400 mb-6' : 'text-gray-600 mb-6'}>
                            Showing {filteredContests.length} {filteredContests.length === 1 ? 'contest' : 'contests'}
                        </p>

                        {/* Contest Cards */}
                        {filteredContests.length > 0 ? (
                            <div className="flex flex-col gap-6">
                                {filteredContests.map((contest, index) => (
                                    <ContestCard 
                                        key={contest._id || index} 
                                        contest={contest} 
                                        isBookmarked={bookmarkContest.includes(contest._id)} 
                                        theme={theme} // Pass theme to ContestCard
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <p className={theme === 'dark' ? 'text-gray-400 text-lg' : 'text-gray-600 text-lg'}>No contests found matching your criteria.</p>
                                <button 
                                    onClick={clearFilters}
                                    className="mt-4 text-blue-500 hover:text-blue-400"
                                >
                                    Clear filters and try again
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default HomePage;