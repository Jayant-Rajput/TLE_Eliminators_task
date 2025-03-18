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
    <div className="flex flex-wrap justify-center">
        {pastContestsWithNoLink.map((contest, index) => (
            <AdminContestCard key={index} contest={contest} />
        ))}
    </div>
  )
}

export default YtLinkAddPage;