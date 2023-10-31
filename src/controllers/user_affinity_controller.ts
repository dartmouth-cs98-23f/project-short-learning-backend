import UserAffinity from "../models/user_affinity_model";

export const createUserAffinity = async (user, { topic, subTopic, affinityValue }) => {
  try {
    if (!topic || !subTopic ) {
      throw new Error('Incomplete information provided');
    }
    const userAffinity = new UserAffinity({
      userId: user._id,
      topic,
      subTopic,
      affinityValue: affinityValue || 0.0,
    });
    const savedUserAffinity = await userAffinity.save();
    return savedUserAffinity;
  } catch (error) {
    throw new Error(`Create user affinity error: ${error}`);
  }
}

export const getUserAffinities = async (user) => {
  try {
    const userAffinities = await UserAffinity.find({ userId: user._id });
    return userAffinities;
  } catch (error) {
    throw new Error(`Get user affinities error: ${error}`);
  }
}

export const getUserAffinity = async (user, id) => {
  try {
    const userAffinity = await UserAffinity.findOne({ userId: user._id, _id: id });
    return userAffinity;
  } catch (error) {
    throw new Error(`Get user affinity error: ${error}`);
  }
}

export const updateUserAffinity = async (user, { id, topic, subTopic, affinityValue }) => {
  try {
    const userAffinity = await UserAffinity.findOne({ userId: user._id, _id: id });
    if (!userAffinity) {
      throw new Error('User affinity not found');
    }
    // Can only edit affinity value after creation
    userAffinity.affinityValue = affinityValue || userAffinity.affinityValue;
    const savedUserAffinity = await userAffinity.save();
    return savedUserAffinity;
  } catch (error) {
    throw new Error(`Update user affinity error: ${error}`);
  }
}

export const deleteUserAffinity = async (user, id) => {
  try {
    const userAffinity = await UserAffinity.findOne({ userId: user._id, _id: id });
    if (!userAffinity) {
      throw new Error('User affinity not found');
    }
    await UserAffinity.deleteOne({ userId: user._id, _id: id });
    return true;
  } catch (error) {
    throw new Error(`Delete user affinity error: ${error}`);
  }
}