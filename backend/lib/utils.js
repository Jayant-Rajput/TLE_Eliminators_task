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
  const response = await axios.get("https://codeforces.com/api/contest.list?gym=false");
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
      if(cnt===5) break;      // Stop iteration after taking 5 past contests //for each loop me break nhi hota.
    }
  }

  return contests;
};

const codechefContestList = async () => {
    const response = await axios.get("https://www.codechef.com/api/list/contests/all");
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
        const duration_millisecond = durationInMinutes*60*1000;

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
}
