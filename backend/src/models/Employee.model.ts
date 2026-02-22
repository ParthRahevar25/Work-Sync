import mongoose, {Schema} from "mongoose";

const employeeSchema = new Schema({
  // --- Basic Identification ---
  employeeCode: { type: String, unique: true, required: true },
  name: { type: String, required: true },
  email: { type: String, unique: true, required: true },
  role: { type: String, enum: ["admin", "manager", "employee"], default: "employee" },
  avatar: { type: String, default: "" },

  // --- Contact & Personal ---
  phone: String,
  address: String,
  emergencyContact: String,

  // --- Work & Employment ---
  department: String,
  designation: String,
  joiningDate: Date,
  workLocation: { 
    type: String, 
    enum: ["Remote", "On-site", "Hybrid"], 
    default: "On-site" 
  },
  status: { 
    type: String, 
    enum: ["Probation", "Permanent", "Notice Period", "Terminated"], 
    default: "Probation" 
  },
  managerId: { type: Schema.Types.ObjectId, ref: "Employee" }, 

  // --- The Timeline (Employee Journey) ---
  timeline: [{
    date: { type: Date, default: Date.now },
    event: { type: String, required: true }, // e.g., "Joined Work Sync"
  }],

  // --- Document Vault ---
  documents: [{
    name: String,
    url: String,
    uploadedAt: { type: Date, default: Date.now }
  }]

}, { timestamps: true });

export default mongoose.model("Employee", employeeSchema);