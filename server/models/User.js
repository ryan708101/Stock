import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchemaDefinition = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minlength: 6
  },
  fullName: {
    type: String,
    required: true,
    trim: true
  },
  subscriptions: {
    type: [String],
    default: [],
    validate: {
      validator: function(userSubscriptions) {
        const validStockTickers = ['GOOG', 'TSLA', 'AMZN', 'META', 'NVDA'];
        return userSubscriptions.every(stockTicker => validStockTickers.includes(stockTicker));
      },
      message: 'All subscriptions must be from the supported stocks list'
    }
  }
}, {
  timestamps: true
});

// Hash password prior to saving document
userSchemaDefinition.pre('save', async function(nextCallback) {
  if (!this.isModified('password')) {
    return nextCallback();
  }
  const saltRounds = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, saltRounds);
  nextCallback();
});

// Method to verify password against stored hash
userSchemaDefinition.methods.comparePassword = async function(passwordToVerify) {
  return await bcrypt.compare(passwordToVerify, this.password);
};

export default mongoose.model('User', userSchemaDefinition);

