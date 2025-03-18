import React, { useState } from "react";
import { useContestStore } from "../stores/useContestStore";

const AdminContestCard = ({ contest }) => {
    const { updateSolutionLink } = useContestStore();
    const [newLink, setNewLink] = useState("");
    const [showInput, setShowInput] = useState(false);

    const id = contest._id;

    const handleAddLink = async (e) => {
        e.preventDefault();

        const data = {id, newLink};
        setNewLink("");
        setShowInput(false);
        await updateSolutionLink(data);
    };

    return (
        <div className="bg-white shadow-md rounded-2xl p-4 m-4 max-w-md">
            <h2 className="text-2xl font-semibold text-gray-600 mb-2">{contest.title}</h2>
            <p className="text-gray-600 mb-1">Platform: {contest.platform}</p>
            <p className="text-gray-600 mb-1">Status: {contest.status}</p>
            <p className="text-gray-600 mb-1">Start Time: {new Date(contest.rawStartTime).toLocaleString()}</p>
            <p className="text-gray-600 mb-1">Duration: {Math.floor(contest.rawDuration / 3600000)} hrs</p>
            <a
                href={contest.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 hover:underline"
            >
                View Contest
            </a>

            <br/>
            {/* Add Solution Link Section */}
            <button
                onClick={() => setShowInput(!showInput)}
                className="mt-2 text-green-500 hover:underline text-lg"
            >
                {showInput ? "Cancel" : "Add Solution Link"}
            </button>

            {showInput && (
                <div className="mt-2">
                    <input
                        type="text"
                        placeholder="Enter YouTube Solution Link"
                        value={newLink}
                        onChange={(e) => setNewLink(e.target.value)}
                        className="border border-b-red-950 px-2 py-1 rounded w-full mb-2 text-gray-700"
                    />
                    <button
                        onClick={handleAddLink}
                        className="bg-blue-500 text-white px-4 py-1 rounded hover:bg-blue-600"
                    >
                        Submit Link
                    </button>
                </div>
            )}
        </div>
    );
};

export default AdminContestCard;
