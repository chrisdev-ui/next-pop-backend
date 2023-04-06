import mongoose from 'mongoose'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      validate: {
        validator: function (email) {
          const emailRegex = /^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+\.[a-zA-Z0-9-.]+$/i
          return emailRegex.test(email)
        },
        message: 'Email address is not valid'
      }
    },
    password: { type: String, required: true, minlength: 6 },
    profilePicture: { type: String, required: false, default: '' },
    isAdmin: { type: Boolean, required: true, default: false }
  },
  { timestamps: true }
)

const User = mongoose.models.User || mongoose.model('User', userSchema)

export default User
