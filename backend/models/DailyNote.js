const mongoose = require('mongoose');

const DailyNoteSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  notes: {
    type: String,
    maxlength: [2000, 'Notes cannot be more than 2000 characters']
  },
  mood: {
    type: String,
    enum: ['great', 'good', 'okay', 'bad', 'terrible'],
    default: 'okay'
  },
  dailyBudget: {
    type: Number,
    default: 0
  },
  dailyTarget: {
    type: Number,
    default: 0
  },
  highlights: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for user and date (one note per day per user)
DailyNoteSchema.index({ userId: 1, date: 1 }, { unique: true });

// Update the updatedAt field before saving
DailyNoteSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('DailyNote', DailyNoteSchema);
