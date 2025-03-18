import React, { useEffect, useState } from 'react';
import ContestCard from '../components/ContestCard';
import { useContestStore } from '../stores/useContestStore';

const HomePage = () => {
    const { allContests, fetchContests, isfetchingContests, bookmarkContest, isUpdating, triggerBookmark } = useContestStore();

    useEffect(() => {
        fetchContests();
    }, [triggerBookmark]);

    const [filterstate, setfilterstate] = useState(['upcoming']);

    const handleFilterChange = (newFilter) => {
        setfilterstate((prevfilterstate) =>
            prevfilterstate.includes(newFilter)
                ? prevfilterstate.filter(filter => filter !== newFilter)
                : [...prevfilterstate, newFilter]
        );
    };

    const filteredContests = allContests.filter((contest) => {
        const platformFilters = ['CodeChef', 'CodeForces', 'LeetCode'].filter(platform => filterstate.includes(platform));
        const statusFilters = ['upcoming', 'ongoing', 'finished'].filter(status => filterstate.includes(status));
    
        const platformMatch = platformFilters.length === 0 || platformFilters.some(platform => contest.platform.toLowerCase() === platform.toLowerCase());
        const statusMatch =
            (filterstate.includes('upcoming') && contest.rawStartTime > Date.now()) ||
            (filterstate.includes('ongoing') && contest.rawStartTime <= Date.now() && Date.now() < contest.rawStartTime + contest.rawDuration) ||
            (filterstate.includes('finished') && contest.status === 'finished');

        const bookmarkMatch = filterstate.includes('Bookmarks') && bookmarkContest.includes(contest._id);

        if (filterstate.includes('Bookmarks')) {
            return bookmarkMatch;
        }

        if (platformFilters.length && statusFilters.length) {
            return platformMatch && statusMatch;
        }

        return statusFilters.length ? statusMatch : platformMatch;
    });

    const filters = ['CodeChef', 'CodeForces', 'LeetCode', 'upcoming', 'ongoing', 'finished', 'Bookmarks'];

    if (isfetchingContests || isUpdating) {
        return <h1>Loading contests, please wait...</h1>;
    }

    return (
        <div className="p-6">
            <h1 className="text-3xl font-semibold mb-6 text-center">Contest List</h1>

            {/* Filter Buttons */}
            <div className="flex justify-center gap-4 mb-6 flex-wrap">
                {filters.map((item, index) => (
                    <button
                        key={index}
                        onClick={() => handleFilterChange(item)}
                        className={`px-4 py-2 m-1 rounded-full ${filterstate.includes(item) ? 'bg-blue-600 text-white' : 'bg-gray-300 text-gray-700'} hover:bg-blue-500 transition`}
                    >
                        {item}
                    </button>
                ))}
            </div>

            {/* Contest Cards - Single Card per Row */}
            <div className="flex flex-col gap-6 items-center">
                {filteredContests.map((contest, index) => (
                    <ContestCard key={index} contest={contest} isBookmarked={bookmarkContest.includes(contest._id)} />
                ))}
            </div>
        </div>
    );
};

export default HomePage;
