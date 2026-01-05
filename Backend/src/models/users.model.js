const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true, trim: true },
    fullName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    passwordChangedAt: {type: Date, default: Date.now},
    phone: { type: String, default: '' },
    gender: { type: String, enum: ['male', 'female', 'other'], default: 'other' },
    dateOfBirth: { type: Date },
    avatar: { type: String, default: '' },
    bio: { type: String, default: '' },
    address: { type: String, default: '' },
    status: { type: String, enum: ['active', 'inactive'], default: 'active' },
    friends: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],

    otp:{ type: String },
    otpAt:{ type: Date },

    // 🧩 Audit fields
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deletedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    deletedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
