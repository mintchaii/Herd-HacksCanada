const mongoose = require('mongoose');

const CreditCardSchema = new mongoose.Schema({
  billingAddress: {
    homeAddress: String,
    postalCode: String,
    city: String,
    province: String
  },
  cardNumber: String,
  expiryDate: String,
  cvv: String
});

const HealthInfoSchema = new mongoose.Schema({
  allergies: [String],
  dietaryRestrictions: [String],
  medications: [String]
});

const UserProfileSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  phoneNumber: String,
  email: String,
  creditCard: CreditCardSchema,
  healthInfo: HealthInfoSchema,
  touchEnabled: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('UserProfile', UserProfileSchema);
