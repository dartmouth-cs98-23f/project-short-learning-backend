import { Router } from 'express';
import { requireAuth, requireSignin } from './services/passport';
import * as User from './controllers/user_controllers';
import * as Relationships from './controllers/relationship_controllers';
import * as UserAffinity from './controllers/user_affinity_controller';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Shortform API' });
});

router.post('/auth/signup', async (req, res) => {
  try {
    const token = await User.signup(req.body);
    return res.json({ token });
  } catch (error) {
    return res.status(422).send(error.message);
  }
});

router.post('/auth/signin', requireSignin, async (req, res) => {
  try {
    const token = User.signin(req.user);
    res.json({ token });
  } catch (error) {
    res.status(422).send({ error: error.toString() });
  }
});

router.get('/user', requireAuth, async (req, res) => {
  try {
    const user = await User.getUser(req.user);
    res.json(user);
  } catch (error) {
    res.status(422).send({ error: error.toString() });
  }
});

const checkPassword = (req, res, next) => {
  if (req.body.password) {
    // If the request includes a password, require sign-in
    if (!req.body.email) {
      return res.status(422).send({ error: 'Email is required to change password' });
    }
    requireSignin(req, res, next);
  } else {
    // If no password is included, require authentication
    requireAuth(req, res, next);
  }
};

router.put('/user', checkPassword, async (req, res) => {
  try {
    const user = await User.updateUser(req.user, req.body);
    res.json(user);
  } catch (error) {
    res.status(422).send({ error: error.toString() });
  }
});

router.delete('/user', requireSignin, async (req, res) => {
  try {
    const user = await User.deleteUser(req.user);
    res.json(user);
  } catch (error) {
    res.status(422).send({ error: error.toString() });
  }
});

router.post('/user/verify', requireAuth, async (req, res) => {
  try {
    const verified = await User.verifyUser(req.user, req.body);
    res.json(verified);
  } catch (error) {
    res.status(422).send({ error: error.toString() });
  }
});

router.post('/user/resend', requireAuth, async (req, res) => {
  try {
    const sent = await User.sendVerificationEmail(req.user);
    res.json(sent);
  } catch (error) {
    res.status(422).send({ error: error.toString() });
  }
});

router.post('/user/affinities', requireAuth, async (req, res) => {
  try {
    const affinity = await UserAffinity.createUserAffinities(req.user, req.body);
    res.json(affinity);
  } catch (error) {
    res.status(422).send({ error: error.toString() });
  }
});

router.get('/user/affinities', requireAuth, async (req, res) => {
  try {
    const affinities = await UserAffinity.getUserAffinities(req.user);
    res.json(affinities);
  } catch (error) {
    res.status(422).send({ error: error.toString() });
  }
});

router.put('/user/affinities/', requireAuth, async (req, res) => {
  try {
    const affinity = await UserAffinity.updateUserAffinities(req.user, req.body);
    res.json(affinity);
  } catch (error) {
    res.status(422).send({ error: error.toString() });
  }
});

router.delete('/user/affinities/', requireAuth, async (req, res) => {
  try {
    const affinity = await UserAffinity.deleteUserAffinities(req.user);
    res.json(affinity);
  } catch (error) {
    res.status(422).send({ error: error.toString() });
  }
});

/**
 * Create a new relationship.
 * 
 * Takes in the new userIDs.
 * Status initialized to 'pending'.
 */
router.post('/relationships', async (req, res) => {

  // get the fromUserID from the request body
  const fromUserID = req.body.fromUserID;
  const toUserID = req.body.toUserID;
  try {
    const relationship = await Relationships.create({ fromUserID, toUserID });
    res.json(relationship);
  } catch (error) {
    res.status(422).send({ error: error.toString() });
  }
})

/**
 * Update an existing relationship.
 * 
 */
router.put('/relationships', async (req, res) => {
  // get the fromUserID from the request body
  const fromUserID = req.body.fromUserID;
  const toUserID = req.body.toUserID;
  const status = req.body.status;
  try {
    const relationship = await Relationships.update({ fromUserID, toUserID, status });
    res.json(relationship);
  } catch (error) {
    console.log(error)
    res.status(422).send({ error: error });
  }
});

/**
 * Get all relationships for a user.
 * 
 * Returns all users that have a relationship with the given user (including pending!).
 * 
 * Caller should handle filtering or use one of the other endpoints
 * that promise to return a specific subset of relationships.
 */
router.get('/relationships/:userId', async (req, res) => {
  
  const direction = req.query.direction || 'all';
  const status: string = req.query.status?.toString() || 'all';
  
  let relationships;

  try {
    switch (direction) {
      case 'outgoing':
        relationships = await Relationships.getOutgoing(req.params.userId, status);
        break;
      case 'incoming':
        relationships = await Relationships.getIncoming(req.params.userId, status);
        break;
      case 'all':
        relationships = await Relationships.getAll(req.params.userId, status);
        break;
      default:
        throw new Error('Invalid direction');
    }
    res.json(relationships);
  } catch (error) {
    res.status(422).send({ error: error.toString() });
  }
});

/**
 * Get all connections to a given user
 * 
 * Only returns a list of userIDs that are in a relationship with the given user.
 */
router.get('/connections/:userId', async (req, res) => {
  // get direction from query params
  const direction = req.query.direction || 'all';
  
  // get status from query params
  const status: string = req.query.status?.toString() || 'all';
  
  try {
    const connections = await Relationships.getConnections(req.params.userId, direction, status);
    res.json(connections);
  } catch (error) {
    res.status(422).send({ error: error.toString() });
  }
});

export default router;
