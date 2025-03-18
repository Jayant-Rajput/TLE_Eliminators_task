import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useContestStore = create((set, get) => ({
  isfetchingContests: false,
  isUpdating: false,
  allContests: [],
  bookmarkContest: [],
  pastContestsWithNoLink: [],
  trigger: false,
  bookmarkedContests : [],
  triggerBookmark: false,


  fetchContests: async () => {
    set({ isfetchingContests: true });
    try {
      const response = await axiosInstance.get("/contest/list");
      set({allContests: response.data});
      toast.success("contests fetched successfully");
    } catch (error) {
      toast.error(error.response.data.message);
      console.log("Error in fetchingContests", error);
    } finally {
      set({ isfetchingContests: false });
    }
  },

  fetchPastContestsWithNoLink: async() => {
    set({isfetchingContests: true});
    try{
      const response = await axiosInstance.get("/contest/past");
      set({pastContestsWithNoLink: response.data});
      toast.success("data fetched successfully")
    }catch(error){
      toast.error(error.response.data.message);
      console.log("ERROR in fetchPastContestsWithNoLink : ", error);
    }finally{
      set({isfetchingContests: false});
    }
  },

  updateSolutionLink: async (data) => {
    set({isUpdating: true});
    try{
      console.log("Inside update try block");
      const response = await axiosInstance.post("/contest/updateLink", data);
      console.log("response.data: ", response.data);
      if(response.status===204) toast.success("solution link updated successfully");
      else toast.error("solution link update failed");
    }catch(error){
      toast.error(error.response.data.message);
      console.log("ERROR in updateSolutionLink: ", error);
    }finally{
      set({isUpdating: false});
      set({trigger: !get().trigger});
    }
  },

  addBookmark : async (data) => {
    set({isUpdating: true});
    try{
      const response = await axiosInstance.post("/contest/bookmark", data);
      if(response.status===201){
        toast.success("contest bookmarked successfully");
        set({bookmarkContest: [...get().bookmarkContest, data.contestId] });
        console.log("addBookmark bookmarkContest: ", bookmarkContest);
        set({triggerBookmark: !get().triggerBookmark});
      }
      else toast.error("contest bookmark failed");
    }catch(error){
      toast.error(error.response.data.message);
      console.log("ERROR in addBookmark: ", error);
    }finally{
      set({isUpdating: false});
    }
  },

  removeBookmark : async (data) => {
    set({isUpdating: true});
    try{
      const response = await axiosInstance.post("/contest/removeBookmark", data);
      if(response.status===201){
        toast.success("contest unbookmarked successfully");
        set({bookmarkContest: get().bookmarkContest.filter(contestId => contestId !== data.contestId) });
      }
      else toast.error("contest unbookmark failed");
    }catch(error){
      toast.error(error.response.data.message);
      console.log("ERROR in removeBookmark: ", error);
    }finally{
      set({isUpdating: false});
      set({triggerBookmark: !get().triggerBookmark});
    }
  }
}));
