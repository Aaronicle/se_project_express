const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const { JWT_SECRET } = require("../utils/config");
const {
  NOT_FOUND,
  BadRequestError,
  ConflictError,
  NotFoundError,
  UnauthorizedError,
} = require("../utils/errors");

const createUser = (req, res, next) => {
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
          if (err.name === "ValidationError") {
            next(new BadRequestError(err.message));
            return;
          }
          if (err.code === 11000) {
            next(new ConflictError("Email already exists"));
            return;
          }
          next(err);
        })
    )
    .catch((err) => next(err));
};

const getCurrentUser = (req, res, next) => {
  const { user } = req;
  User.findById(user._id)
    .orFail()
    .then((foundUser) => res.status(200).send(foundUser))
    .catch((err) => {
      if (err.name === "DocumentNotFoundError") {
        next(new NotFoundError(err.message));
        return;
      }
      if (err.name === "CastError") {
        next(new BadRequestError("Invalid user ID format"));
        return;
      }
      next(err);
    });
};

const login = (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    next(new BadRequestError("Email and password are required"));
    return;
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
        next(new UnauthorizedError("Email or password incorrect"));
        return;
      }
      next(err);
    });
};

const updateCurrentUser = (req, res, next) => {
  const { name, avatar } = req.body;
  return User.findByIdAndUpdate(
    req.user._id,
    { name, avatar },
    { new: true, runValidators: true }
  )
    .then((user) => res.send(user))
    .catch((err) => {
      if (err.name === "ValidationError") {
        next(new BadRequestError("Email and password are required"));
        return;
      }
      if (err.statusCode === NOT_FOUND) {
        next(new NotFoundError("User not found"));
        return;
      }
      next(err);
    });
};

module.exports = {
  createUser,
  getCurrentUser,
  login,
  updateCurrentUser,
};
