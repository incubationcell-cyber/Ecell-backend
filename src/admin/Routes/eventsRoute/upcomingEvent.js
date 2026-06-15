const express = require("express");
const adminAuth = require("../../../middlewares/adminAuth");
const eventsModel = require("../../../models/EventModel/eventsModel");
const { uploadOnCloudinary } = require("../../../utils/cloudinary");
const eventRouter = express.Router();
const upload = require("../../../middlewares/multer");

eventRouter.post("/admin/upcomingevent", adminAuth,upload.fields([
		{
			name: "upcomingEventsBanner",
			maxCount:1,
		},
	]), async (req, res) => {
	try {
		
		const { scheduledDate, eventName, speaker } = req.body;
		const upcomingEventsBannerBuffer = req.files?.upcomingEventsBanner?.[0]?.buffer;
		if (!upcomingEventsBannerBuffer) {
			return res.status(400).json({ message: "Banner of the upcoming event is required" });

		}
		const upcomingEventCloudinary = await uploadOnCloudinary(
            upcomingEventsBannerBuffer,
        );
        const eventData = new eventsModel({
            photoUrl:upcomingEventCloudinary.url,
            scheduledDate,
            eventName,
            speaker,
		});
		if(!eventData)throw new Error("No Data found in Request");
		
		const savedEventData = await eventData.save();
		if(!savedEventData)throw new Error("Server Error. Please try again");
		
        res.status(200).json({ message: "Event Saved Successsfully" });
		
	} catch (error) {
		res.status(400).json({ message: error.message });
		console.log(error);
	}
	
});
eventRouter.patch("/admin/upcomingevent/:_id", adminAuth, async (req, res) => {
	try {
		const { _id } = req.params;
		
		if(!_id)throw new Error("Event Not Found");
		
        const {scheduledDate, eventName, speaker } = req.body;
        const eventData = await eventsModel.findByIdAndUpdate(
            { _id },
            {scheduledDate, eventName, speaker },
            { new: true },
        );
		if(!eventData)throw new Error("Requested Event Not Found");
		
		const savedEventData = await eventData.save();
		if(!savedEventData)throw new Error("Something Went Wrong!!");
		
        res.status(200).json({
            message: "Event Update Successfully",
            data: savedEventData,
        });
	} catch (error) {
		res.status(400).json({ message: error.message });
		console.log(error);

	}
})

//deleting of an event
eventRouter.delete(
  "/admin/upcomingevent/:_id",
  adminAuth,
  async (req, res) => {
    try {
      const data = await eventData.findByIdAndDelete(req.params._id);

      if (!data) {
        return res.status(404).json({
          message: "Event not found"
        });
      }

      return res.status(200).json({
        message: "Event Deleted Successfully"
      });
    } catch (error) {
      return res.status(500).json({
        message: "Something went wrong while deleting the event + `${error.message}`",
        error: error.message
      });
    }
  }
);
module.exports = eventRouter;
