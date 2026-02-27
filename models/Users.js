const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        "Please enter a valid email",
      ],
    },
    firstname: {
      type: String,
      required: [true, "first name is required"],
    },
    lastname: {
      type: String,
      required: [true, "last name is required"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      validate: {
        validator: function (v) {
          return /^(?=.*[a-zA-Z])(?=.*[!@#$%^&*()\-_=+\[\]{};:'",.<>/?`~|]).{6,}$/.test(
            v,
          );
        },
        message:
          "Password must be at least 6 characters long and contain at least one letter and one special character",
      },
    },
    avatar: {
      type: String,
      default: "avatar.png",
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  { timestamps: true },
);

module.exports = mongoose.model("appUsers", userSchema);
