import jwt from "jsonwebtoken";
import axios from "axios";
import { ApolloClient, InMemoryCache, gql } from "@apollo/client/core/core.cjs";

import Contest from "../models/contest.model.js";

export const generateToken = (userId, res) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: "7d",
  });

  res.cookie("jwt", token, {
    maxAge: 7 * 24 * 60 * 60 * 1000, // it's in ms
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV !== "development",
  });

  return token;
};

export const fetchDataAndUpdateDB = async () => {
  try {
    const leetContestDetails = await leetCodeContestList();
    const forcesContestDetails = await forcesContestDataFetch();
    const chefContestDetails = await codechefContestList();

    const allDetails = [
      ...leetContestDetails,
      ...forcesContestDetails,
      ...chefContestDetails,
    ];

    await addContestsToDB(allDetails);
    await updateFinishedContests();
    await addYtLinks();
  } catch (error) {
    console.log("ERROR in fetchDataAndUpdateDB function : ", error);
  }
};

const addContestsToDB = async (contests) => {
  try {
    for (const contest of contests) {
      const existingContest = await Contest.findOne({ title: contest.title });

      if (!existingContest) {
        const newContest = new Contest({
          title: contest.title,
          rawStartTime: contest.raw_start_time,
          platform: contest.platform,
          status: "upcoming",
          rawDuration: contest.raw_duration,
          url: contest.url,
        });

        await newContest.save();
      }
    }
  } catch (error) {
    console.log("ERROR in addContestsToDB function : ", error);
  }
};

const updateFinishedContests = async () => {
  try {
    const rawCurrentTime = new Date().getTime();

    const result = await Contest.updateMany(
      { rawStartTime: { $lt: rawCurrentTime } }, // Compare with rawStartTime in milliseconds
      { $set: { status: "finished" } }
    );
  } catch (error) {
    console.log("ERROR in updateFinishedContests function : ", error);
  }
};

const leetCodeContestList = async () => {
  const client = new ApolloClient({
    uri: "https://leetcode.com/graphql",
    cache: new InMemoryCache(),
    headers: {
      "content-type": "application/json",
    },
  });

  const fetchContestsList = async () => {
    try {
      const response = await client.query({
        query: gql`
          query {
            allContests {
              title
              titleSlug
              startTime
              duration
            }
          }
        `,
      });

      const contests = [];
      const currentTime = new Date();
      const contestsData = response.data.allContests;

      for (const data of contestsData) {
        const title = data.title;
        const url = `https://leetcode.com/contest/${data.titleSlug}`;
        const start_time_millisecond = data.startTime * 1000;
        const duration_time_millisecond = data.duration * 1000;
        const current_time_millisecond = Date.now();

        if (current_time_millisecond > start_time_millisecond) {
          console.log(current_time_millisecond, " , ", start_time_millisecond);
          break;
        }

        contests.push({
          platform: "LeetCode",
          title,
          url,
          raw_start_time: start_time_millisecond,
          raw_duration: duration_time_millisecond,
        });
      }

      return contests;
    } catch (error) {
      console.error("Error fetching contests:", error);
      return [];
    }
  };

  return fetchContestsList();
};

const forcesContestDataFetch = async () => {
  const response = await axios.get(
    "https://codeforces.com/api/contest.list?gym=false"
  );
  const contestData = response.data.result;
  const contests = [];
  let cnt = 0;

  if (response.status === 200) {
    for (const data of contestData) {
      const title = data["name"];
      const url = `https://codeforces.com/contests/${data["id"]}`;
      const start_time_seconds = data["startTimeSeconds"];
      const start_time_milliseconds = start_time_seconds * 1000;
      const duration_seconds = data["durationSeconds"];
      const duration_milliseconds = duration_seconds * 1000;
      const phase = data["phase"];

      if (phase !== "BEFORE") cnt++;
      contests.push({
        title,
        platform: "Codeforces",
        url,
        raw_start_time: start_time_milliseconds,
        raw_duration: duration_milliseconds,
      });
      if (cnt === 5) break; // Stop iteration after taking 5 past contests //for each loop me break nhi hota.
    }
  }

  return contests;
};

const codechefContestList = async () => {
  const response = await axios.get(
    "https://www.codechef.com/api/list/contests/all"
  );
  const presentContests = response.data.present_contests;
  const futureContests = response.data.future_contests;
  const pastContests = response.data.past_contests;
  pastContests.splice(5);
  const contests = [];

  if (response.status === 200) {
    const contests_data = [...futureContests, ...pastContests];
    contests_data.forEach((data) => {
      const title = data["contest_name"];
      const url = `https://www.codechef.com/${data["contest_code"]}`;
      const start_date = data["contest_start_date"];
      const dateObject = new Date(start_date);
      const start_date_millisecond = dateObject.getTime();
      const durationInMinutes = data["contest_duration"];
      const duration_millisecond = durationInMinutes * 60 * 1000;

      contests.push({
        title,
        platform: "CodeChef",
        url,
        raw_start_time: start_date_millisecond,
        reg_participants: data["distinct_users"],
        raw_duration: duration_millisecond,
      });
    });
  }
  return contests;
};

const addYtLinks = async () => {
  let response;
  const channelId = "UCqL-fzHtN3NQPbYqGymMbTA";
  try {
    response = await axios.get("https://www.googleapis.com/youtube/v3/search", {
      params: {
        part: "snippet",
        channelId: channelId,
        maxResults: 13,
        order: "date", // To get the latest videos
        key: process.env.API_KEY,
      },
    });
  } catch (error) {
    console.log("ERROR in fetching youtube videos", error);
  }

  const videos = extractVideos(response.data.items);
  console.log("videos length: ", videos.length);

  await updateContestLinks(videos);
};

const extractVideos = (responseData) => {
  return responseData.map((video) => ({
    title: video.snippet.title,
    link: `https://www.youtube.com/watch?v=${video.id.videoId}`,
  }));
};

const updateContestLinks = async (videos) => {
  // Get all contests once to avoid multiple database queries
  const allContests = await Contest.find({});
  
  for (const video of videos) {
    const extractedInfo = extractContestInfo(video.title);
    
    if (extractedInfo) {
      // Find matching contest
      const contest = findMatchingContest(allContests, extractedInfo);
      
      if (contest) {
        contest.solutionLink = video.link;
        await contest.save();
        console.log(`updated contest: ${contest.title}`);
      } else {
        console.log(`No contest found for: ${extractedInfo.fullMatch}`);
      }
    }
  }
};

const extractContestInfo = (title) => {
  // Codeforces
  let match = title.match(/(Educational Codeforces Round \d+|Codeforces Round \d+(\s*\(Div\.?\s*\d+\)|\s*\(Div\s*\d+\)))/i);
  
  if (match) {
    const fullMatch = match[0];
    
    // Extract the base part (without division)
    const basePart = fullMatch.match(/(Educational Codeforces Round \d+|Codeforces Round \d+)/i)[0];
    
    // Extract division if present
    const divMatch = fullMatch.match(/\(Div\.?\s*(\d+)\)/i);
    const division = divMatch ? parseInt(divMatch[1]) : null;
    
    return { platform: 'codeforces', basePart, division, fullMatch };
  }
  
  // CodeChef
  match = title.match(/(?:Code[Cc]hef\s*)?Starters\s*(\d+)/i);
  
  if (match) {
    const fullMatch = match[0];
    const startersNumber = match[1];
    
    return { platform: 'codechef', startersNumber, fullMatch };
  }
  
  // LeetCode
  match = title.match(/Leetcode\s*(Biweekly|Weekly)\s*Contest\s*(\d+)/i);
  
  if (match) {
    const fullMatch = match[0];
    const contestType = match[1].toLowerCase();
    const contestNumber = match[2];
    
    return { platform: 'leetcode', contestType, contestNumber, fullMatch };
  }
  
  return null;
};

const findMatchingContest = (contests, extractedInfo) => {
  // Normalize function to handle comparison
  const normalize = (str) => str.toLowerCase().replace(/\./g, '');
  
  if (extractedInfo.platform === 'codeforces') {
    // For Codeforces, we need to match both the base part and division
    for (const contest of contests) {
      const normalizedContestTitle = normalize(contest.title);
      
      // Check if contest title contains the base part
      if (normalizedContestTitle.includes(normalize(extractedInfo.basePart))) {
        // If we have division info, check if it matches
        if (extractedInfo.division) {
          const contestDivMatch = contest.title.match(/\(Div\.?\s*(\d+)\)/i) || 
                                  contest.title.match(/\(Rated for Div\.?\s*(\d+)\)/i);
          
          if (contestDivMatch && parseInt(contestDivMatch[1]) === extractedInfo.division) {
            return contest;
          }
        } else {
          // If no division in the extracted info, just return the first match
          return contest;
        }
      }
    }
  } else if (extractedInfo.platform === 'codechef') {
    // For CodeChef, match by Starters number
    for (const contest of contests) {
      const startersMatch = contest.title.match(/Starters\s*(\d+)/i);
      
      if (startersMatch && startersMatch[1] === extractedInfo.startersNumber) {
        return contest;
      }
    }
  } else if (extractedInfo.platform === 'leetcode') {
    // For LeetCode, match by contest type and number
    for (const contest of contests) {
      const leetcodeMatch = contest.title.match(/Leetcode\s*(Biweekly|Weekly)\s*Contest\s*(\d+)/i);
      
      if (leetcodeMatch && 
          normalize(leetcodeMatch[1]) === extractedInfo.contestType && 
          leetcodeMatch[2] === extractedInfo.contestNumber) {
        return contest;
      }
    }
  }
  
  return null;
};
