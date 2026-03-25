import mongoose from "mongoose";

const leaveSchema = new mongoose.Schema({

  employeeId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  reason: { type: String, required: true },
  

  type: { 
    type: String, 
    enum: ["Casual", "Sick", "Paid", "casual", "sick", "paid"], 
    default: "casual" 
  },
  
  status: { 
    type: String, 
    enum: ["pending", "approved", "rejected", "Approved", "Rejected"], 
    default: "pending" 
  },
  
  appliedAt: { type: Date, default: Date.now }
});

export default mongoose.model("Leave", leaveSchema);