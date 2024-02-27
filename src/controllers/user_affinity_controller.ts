import UserAffinity from '../models/user_affinity_model'
import UserModel from '../models/user_model'

// import the list of strings from src\utils\affinityTruthTable and make it a truth table for the affinity topics
const fs = require('fs')

const fileContent = fs.readFileSync('src/utils/affinityTruthTable', 'utf8')
const affinitiesTruthTable = fileContent.split(/[\r\n]+/)

export const createUserAffinities = async (user, { affinities, complexities }) => {
  try {
    const existingUserAffinity = await UserAffinity.findOne({
      userId: user._id
    })
    if (existingUserAffinity) {
      throw new Error('User affinities already exists')
    }

    const userAffinity = new UserAffinity({
      userId: user._id,
      affinities: {},
      complexities: {}
    })

    if (affinities) {
      for (const [key, value] of Object.entries(affinities)) {
        if (!affinitiesTruthTable.includes(key)) {
          throw new Error(`Invalid topic ID: ${key}`)
        }
        if (typeof value !== 'number') {
          throw new Error(`Expected a number for affinity value, but got a ${typeof value}`);
        }
        if (value < 0 || value > 1) {
          throw new Error(`Invalid affinity value: ${value}`)
        }
        userAffinity.affinities.set(key, value)
      }
    }

    if (complexities) {
      for (const [key, value] of Object.entries(complexities)) {
        if (!affinitiesTruthTable.includes(key)) {
          throw new Error(`Invalid topic ID: ${key}`)
        }
        if (typeof value !== 'number') {
          throw new Error(`Expected a number for complexity value, but got a ${typeof value}`);
        }
        if (value < 0 || value > 1) {
          throw new Error(`Invalid complexity value: ${value}`)
        }
        userAffinity.complexities.set(key, value)
      }
    }

    const savedUserAffinity = await userAffinity.save()
    return savedUserAffinity
  } catch (error) {
    throw new Error(`Create user affinities error: ${error}`)
  }
}

export const getUserAffinities = async (user) => {
  try {
    const userAffinities = await UserAffinity.findOne({ userId: user._id })
    return userAffinities
  } catch (error) {
    throw new Error(`Get user affinities error: ${error}`)
  }
}

export const updateUserAffinities = async (user, { affinities, complexities }) => {
  try {
    const userAffinity = await UserAffinity.findOne({ userId: user._id })
    if (!userAffinity) {
      throw new Error('User affinities not found')
    }

    if (affinities) {
      for (const [key, value] of Object.entries(affinities)) {
        if (!affinitiesTruthTable.includes(key)) {
          throw new Error(`Invalid topic ID: ${key}`)
        }
        if (typeof value !== 'number') {
          throw new Error(`Expected a number for affinity value, but got a ${typeof value}`);
        }
        if (value < 0 || value > 1) {
          throw new Error(`Invalid affinity value: ${value}`)
        }
        userAffinity.affinities.set(key, value)
      }
    }

    if (complexities) {
      for (const [key, value] of Object.entries(complexities)) {
        if (!affinitiesTruthTable.includes(key)) {
          throw new Error(`Invalid topic ID: ${key}`)
        }
        if (typeof value !== 'number') {
          throw new Error(`Expected a number for complexity value, but got a ${typeof value}`);
        }
        if (value < 0 || value > 1) {
          throw new Error(`Invalid complexity value: ${value}`)
        }
        userAffinity.complexities.set(key, value)
      }
    }

    const savedUserAffinity = await userAffinity.save()
    return savedUserAffinity
  } catch (error) {
    throw new Error(`Update user affinities error: ${error}`)
  }
}

export const deleteUserAffinities = async (user) => {
  try {
    const userAffinity = await UserAffinity.findOne({ userId: user._id })
    if (!userAffinity) {
      throw new Error('User affinities not found')
    }
    await UserAffinity.deleteOne(userAffinity._id)
    return true
  } catch (error) {
    throw new Error(`Delete user affinities error: ${error}`)
  }
}

export const adminGetUserAffinities = async ({ userId }) => {
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error('User not found')
    }
    return getUserAffinities(user);
  } catch (error) {
    throw new Error(`Get user affinities with admin permissions error: ${error}`)
  }
}