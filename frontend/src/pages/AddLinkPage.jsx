import React, { useEffect } from 'react'
import { useContestStore } from '../stores/useContestStore.js'
import AdminContestCard from '../components/AdminContestCard.jsx';

const YtLinkAddPage = () => {
  const {fetchPastContestsWithNoLink, isfetchingContests, pastContestsWithNoLink, trigger, isUpdating} = useContestStore();

  useEffect(()=>{
    fetchPastContestsWithNoLink();
  },[trigger]);

  if(isfetchingContests || isUpdating){
    return <h1>wait for a while...</h1>
  }

  if(pastContestsWithNoLink.length === 0){
    return (
      <div className="flex items-center justify-center h-screen">
          <h1 className='text-2xl'>No past contests found without solution link</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {pastContestsWithNoLink.map((contest, index) => (
          <AdminContestCard key={index} contest={contest} />
        ))}
      </div>
    </div>
  )
}

export default YtLinkAddPage;