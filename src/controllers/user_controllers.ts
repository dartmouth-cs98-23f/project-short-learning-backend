import jwt from 'jwt-simple';
import crypto from 'crypto';
import User from '../models/user_model';

export const signin = (user) => {
  return tokenForUser(user);
};

export const signup = async ({
  firstName, lastName, email, username, password, birthDate
}) => {
  if (!email || !password || !username || !firstName || !lastName || !birthDate) {
    throw new Error('Incomplete information provided');
  }
  // See if a user with the given email exists
  const existingEmail = await User.findOne({ email });
  if (existingEmail) {
    // If a user with email does exist, return an error
    throw new Error('Email is in use');
  }
  const existingUsername = await User.findOne({ username });
  if (existingUsername) {
    // If a user with same username does exist, return an error
    throw new Error('Username is in use');
  } 

  const user = new User();
  user.firstName = firstName;
  user.lastName = lastName;
  user.email = email;
  user.username = username;
  user.password = password;
  user.birthDate = new Date(birthDate);
  user.registrationDate = new Date();
  user.lastLoginDate = new Date();
  user.onBoardingStatus = 'verifying';

  await user.save();

  return tokenForUser(user);
};

function tokenForUser(user) {
  const timestamp = new Date().getTime();
  return jwt.encode({ sub: user.id, iat: timestamp }, process.env.AUTH_SECRET);
}

export const getUser = async (user) => {
  try {
    return user;
  } catch (error) {
    throw new Error(error);
  }
}
