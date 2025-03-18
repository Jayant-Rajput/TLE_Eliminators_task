import Contest from "../models/contest.model.js";
import User from "../models/user.model.js";

export const contestList = async (req, res) => {
  try {
    const contests = await Contest.find({});
    res.status(200).json(contests);
  } catch (error) {
    console.log("ERROR in contestList controller: ", error);
    res.status(500).json({ message: "ERROR in fetching all contests" });
  }
};

export const handlePastContests = async (req, res) => {
  try {
    const contests = await Contest.find({
      status: "finished",
      solutionLink: "",
    });

    res.status(200).json(contests);
  } catch (error) {
    console.log("ERROR in handlePastContests controller : ", error);
    res
      .status(500)
      .json({
        message: "Error in fetching all pastContests with no solution Link",
      });
  }
};

export const handleUpdateLink = async (req, res) => {
  const { id, newLink } = req.body;
  try {
    const result = await Contest.findByIdAndUpdate(
      id,
      { solutionLink: newLink },
      { new: true }
    );

    if (result)
      res.status(204).json({ message: "Solution Link updated successfully" });
    else res.status(404).json({ message: "Solution Link not updated" });
  } catch (error) {
    console.log("ERROR in handleUpdateLink controller: ", error);
    res.status(500).json({ message: "Error in updating solution link" });
  }
};

export const handleBookmark = async (req, res) => {
  const { contestId, userId } = req.body;
  try {
    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.bookmarkedContests.includes(contestId)) {
      return res.status(400).json({ message: "Contest is already bookmarked" });
    }

    user.bookmarkedContests.push(contestId);
    await user.save();

    res.status(201).json({ message: "Contest bookmarked successfully" });

  } catch (error) {
    console.log("ERROR in handleBookmark controller: ", error);
    res.status(500).json({ message: "Error in bookmarking contest" });
  }
};

export const handleRemoveBookmark = async (req, res) => {
    const {contestId, userId} = req.body;
    try{
        const user = await User.findById(userId);

        if(!user){
            return res.status(404).json({message: "User not found"});
        }

        if(!user.bookmarkedContests.includes(contestId)){
            return res.status(400).json({message: "Contest is not bookmarked"});
        }

        user.bookmarkedContests = user.bookmarkedContests.filter(id => id.toString() !== contestId);
        await user.save();

        res.status(201).json({message: "Contest un-bookmarked successfully"});

    }catch(error){
        console.log("ERROR in handleRemoveBookmark controller: ", error);
        res.status(500).json({ message: "Error in removing bookmark" });
    }
}
