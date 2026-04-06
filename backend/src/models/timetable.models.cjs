const mongoose = require("mongoose");

const timetableSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    dayOfWeek: {
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    },

    specificDate: {
      type: Date,
    },

    title: {
      type: String,
      required: true,
    },

    startTime: {
      type: String, 
      required: true,
    },

    endTime: {
      type: String,
      required: true,
    },

    isRecurring: {
      type: Boolean,
      default: true,
    },
    venue: {
      type: String,
      required: true
    }
  },
  { timestamps: true }
);

const Timetable = new mongoose.model("Timetable", timetableSchema);

module.exports = {
  Timetable
}