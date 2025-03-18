import { create } from "zustand";
import { axiosInstance } from "../lib/axios.js";
import toast from "react-hot-toast";
import { useContestStore } from "./useContestStore.js";


const BASE_URL = "http://localhost:5002";

export const useAuthStore = create((set, get) => ({

    authUser: null,
    isSigninUp: false,
    isLoggingIn: false,
    isCheckingAuth: false,
    isSendingOtp: false,
    onlineUserCount: 0,
    socket: null,

    checkAuth: async () => {
      set({ isCheckingAuth: true });
      try {
        const res = await axiosInstance.get("/auth/check");
        set({ authUser: res.data });
        useContestStore.setState({bookmarkContest: [...get().authUser.bookmarkedContests] })
        console.log("checkAuth authuser: ", get().authUser);    //for check
      } catch (error) {
        console.log("Error in checkAuth: ", error);
        set({ authUser: null });
      } finally {
        set({ isCheckingAuth: false });
      }
    },

    signup: async (data) => {
      set({ isSigninUp: true });
      try {
        const res = await axiosInstance.post("/auth/signup", data);
        set({ authUser: res.data });
        toast.success("Account Created Successfully");
        useContestStore.setState({bookmarkContest: [...get().authUser.bookmarkedContests] })
      } catch (error) {
        set({ authUser: null });
        toast.error(error.response.data.message);
        console.log("Error in signup: ", error);
      } finally {
        set({ isSigninUp: false });
      }
    },

    login: async (data) => {
      set({ isLoggingIn: true });
      try {
        const res = await axiosInstance.post("/auth/login", data);
        set({ authUser: res.data });
        console.log("Login auth user: ", get().authUser);    //for check
        toast.success("Logged in Successfully");
        useContestStore.setState({bookmarkContest: [...get().authUser.bookmarkedContests] })
      } catch (error) {
        set({ authUser: null });
        console.log("Error in login: ", error);
        toast.error(error.response.data.message);
      } finally {
        set({ isLoggingIn: false });
      }
    },

    logout: async () => {
      try {
        const { authProvider } = get();
        await axiosInstance.post("/auth/logout");           //kaam baki hai
        toast.success("Logged Out Successfully");
      } catch (error) {
        toast.error(error.response.data.message);
      }
    },
}));
