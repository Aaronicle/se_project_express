const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const { JWT_SECRET } = require("../utils/config");
const {
  BAD_REQUEST,
  NOT_FOUND,
  DEFAULT,
  CONFLICT,
  UNATHORIZED,
} = require("../utils/errors");

const createUser = (req, res) => {
  const { name, avatar, email, password } = req.body;

  bcrypt
    .hash(password, 10)
    .then((hash) =>
      User.create({ name, avatar, email, password: hash })
        .then((user) => {
          const userWithoutPassword = { ...user.toObject() };
          delete userWithoutPassword.password;
          res.status(201).send(userWithoutPassword);
        })
        .catch((err) => {
          console.error(err);
          if (err.name === "ValidationError") {
            return res.status(BAD_REQUEST).send({ message: err.message });
          }
          if (err.code === 11000) {
            return res.status(CONFLICT).send({ message: err.message });
          }
          return res
            .status(DEFAULT)
            .send({ message: "An error has occurred on the server" });
        })
    )
    .catch((err) => res.status(DEFAULT).send(err));
};

const getCurrentUser = (req, res) => {
  const { user } = req;
  User.findById(user._id)
    .orFail()
    .then((foundUser) => res.status(200).send(foundUser))
    .catch((err) => {
      console.error(err);
      if (err.name === "DocumentNotFoundError") {
        return res.status(NOT_FOUND).send({ message: err.message });
      }
      if (err.name === "CastError") {
        return res.status(BAD_REQUEST).send({ message: err.message });
      }
      return res
        .status(DEFAULT)
        .send({ message: "An error has occurred on the server" });
    });
};

const login = (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res
      .status(BAD_REQUEST)
      .send({ message: "The password and email fields are required" });
  }

  return User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      return res.send({ token });
    })
    .catch((err) => {
      if (err.message === "Incorrect email or password") {
        return res
          .status(UNATHORIZED)
          .send({ message: "Email or password incorrect" });
      }
      return res
        .status(DEFAULT)
        .send({ message: "An error has occurred on the server" });
    });
};

const updateCurrentUser = (req, res) => {
  const { name, avatar } = req.body;
  return User.findByIdAndUpdate(
    req.user._id,
    { name, avatar },
    { new: true, runValidators: true }
  )
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === "ValidationError") {
        return res.status(BAD_REQUEST).send({ message: err.message });
      }
      if (err.statusCode === NOT_FOUND) {
        return res.status(NOT_FOUND).send({ message: "User not found" });
      }
      return res
        .status(DEFAULT)
        .send({ message: "An error has occurred on the server" });
    });
};

module.exports = {
  createUser,
  getCurrentUser,
  login,
  updateCurrentUser,
};
