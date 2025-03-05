const User = require("../models/user");
const bcrypt = require("bcryptjs");
const { JWT_SECRET } = require("../utils/config");
const {
  BAD_REQUEST,
  NOT_FOUND,
  DEFAULT,
  CONFLICT,
  UNATHORIZED,
} = require("../utils/errors");

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.status(200).send(users))
    .catch((err) => {
      console.error(err);
      return res
        .status(DEFAULT)
        .send({ message: "An error has occurred on the server" });
    });
};

const createUser = (req, res) => {
  const { name, avatar, email, password } = req.body;
  bcrypt
    .hash(password, 10)
    .then((hash) => {
      return User.create({ name, avatar, email, password: hash })
        .then((user) => {
          delete user.password;
          res.status(201).send(user);
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
        });
    })
    .then((user) => res.send(user))
    .catch((err) => res.status(400).send(err));
};

const getCurrentUser = (req, res) => {
  const { user } = req;
  User.findById(user._id)
    .orFail()
    .then((user) => res.status(200).send(user))
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

  User.findUserByCredentials(email, password)
    .then((user) => {
      const token = jwt.sign({ _id: user._id }, JWT_SECRET, {
        expiresIn: "7d",
      });
      return res.send(token);
    })
    .catch((err) => {
      return res
        .status(UNATHORIZED)
        .send({ message: "Email or password incorrect" });
    });
};

const updateCurrentUser = (req, res) => {
  const { name, avatar } = req.body;
  //findIdandUpdate, name and avatar. pass in object with new as the property and true as the field
  return User.findByIdAndUpdate(
    req.user._id,
    { name, avatar },
    { new: true, runValidators: true }
  )
    .then((user) => {
      return res.send(user);
    })
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
  getUsers,
  createUser,
  getCurrentUser,
  login,
  updateCurrentUser,
};
