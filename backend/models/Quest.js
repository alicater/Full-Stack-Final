const mongoose = require('mongoose');

const questSchema = mongoose.Schema(
  {
    userID: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name: { type: String, required: true },
    isCompleted: { type: Boolean, default: false },
    completionDate: { type: Date, default: null },
    
    day: { 
        type: Number, 
        required: true, 
        default: 1 
    },
    questType: { 
        type: String, 
        enum: ['MAIN', 'DAILY', 'CUSTOM'], 
        default: 'CUSTOM' 
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Quest', questSchema);