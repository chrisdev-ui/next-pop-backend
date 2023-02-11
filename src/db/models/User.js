import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    profilePicture: { type: String, required: false, default: '' },
    isAdmin: { type: Boolean, required: true, default: false }
  },
  { timestamps: true }
)

const User = mongoose.models.User || mongoose.model('User', userSchema)

export default User
