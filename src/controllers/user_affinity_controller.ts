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