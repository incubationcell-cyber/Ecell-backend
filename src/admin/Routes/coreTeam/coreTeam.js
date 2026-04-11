const express = require("express");
const coreTeamRouter = express.Router();
const adminAuth = require("../../../middlewares/adminAuth");
const coreTeamModel = require("../../../models/coreTeamModel/coreTeamModel");
const { updateMany } = require("../../../models/adminModel");
const { uploadOnCloudinary } = require("../../../utils/cloudinary");
const upload=require("../../../middlewares/multer")

// ✅ GET ALL MEMBERS
coreTeamRouter.get("/admin/coreTeam/members", adminAuth, async (req, res) => {
    try {
        const members = await coreTeamModel.find().sort({ createdAt: -1 });

        res.status(200).json({
            message: "Core team members fetched successfully",
            count: members.length,
            data: members,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// ✅ ADD NEW MEMBER
coreTeamRouter.post("/admin/coreteam/addNewMember", adminAuth,upload.fields([
		{
			name: "memberImage",
			maxCount:1,
		},
	]) , async (req, res) => {
    try {
		const { fullName, designation,isActive } = req.body;
		 if (!fullName || !designation) {
             return res.status(400).json({
                 message: "All fields are mandatory",
             });
         }

		//taking the buffer of image from the multer and then uploading on the cloudinary
		const memberImageBuffer = req.files?.memberImage?.[0]?.buffer;
		if (!memberImageBuffer) {
			return res.status(400).json({ message: "Member Image is Required!!" });
		}
		const memberImageCloudinary = await uploadOnCloudinary(memberImageBuffer);
		

       
        const teamData = await coreTeamModel.create({
            photoUrl:memberImageCloudinary.url,
            fullName,
			designation,
			isActive,
        });

        res.status(201).json({
            message: "New member added successfully",
            data: teamData,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

// ✅ UPDATE MEMBER
coreTeamRouter.patch("/admin/coreteam/:_id", adminAuth, async (req, res) => {
    try {
		const { _id } = req.params;
		if (!_id) return res.status(400).json({ message: "_id is expected to be in the params" });
        const {  fullName, designation,isActive} = req.body;

        if (!fullName || !designation ) {
            return res.status(400).json({
                message: "All fields are mandatory",
            });
        }

        const updatedData = await coreTeamModel.findByIdAndUpdate(
            _id,
            { fullName, designation,isActive },
            { new: true, runValidators: true },
        );

        if (!updatedData) {
            return res.status(404).json({
                message: "Member not found",
            });
        }

        res.status(200).json({
            message: "Member updated successfully",
            data: updatedData,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});

//delete the member

coreTeamRouter.delete("/admin/coreteam/delete/:_id", adminAuth, async (req, res) => {
    try {
        const { _id } = req.params;
        if (!_id)
            return res
                .status(400)
                .json({ message: "_id is expected to be in the params" });
        
        const updatedData = await coreTeamModel.findByIdAndDelete(
            _id,
        );

        res.status(200).json({
            message: "Member Deleted successfully",
            data: updatedData,
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
});


module.exports = coreTeamRouter;
