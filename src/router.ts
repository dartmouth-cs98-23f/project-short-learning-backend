import { Router } from 'express';
import { requireAuth, requireSignin } from './services/passport';
import * as User from './controllers/user_controllers';
import * as Relationships from './controllers/relationship_controllers';

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

/***
 * Get a user's profile (by ID)
 * 
 * Useful for getting a user's profile
 * for display to other users.
 * 
 * Does not return sensitive information,
 * only returns:
 * - firstName
 * - lastName
 * - id
 * - (maybe eventually) profilePictureURL
 */
router.get('/users/:id', requireAuth, async (req, res) => {
  try {
    const user = await User.getUser(req.params.id);
    res.json(user);
  } catch (error) {
    res.status(422).send({ error: error.toString() });
  }
});

router.post('/relationships', requireAuth, async (req, res) => {

  // get the fromUserID from the request body
  const fromUserID = req.user._id;
  const toUserID = req.body.toUserID;
  try {
    const relationship = await Relationships.create({ fromUserID, toUserID });
    res.json(relationship);
  } catch (error) {
    // res.status(422).send({ error: "hello, world" });
    res.json({ error: error.toString() });
  }
})

/**
 * Get all relationships for a user.
 * 
 * Returns all users that have a relationship with the given user (including pending!).
 * 
 * Caller should handle filtering or use one of the other endpoints
 * that promise to return a specific subset of relationships.
 */
router.get('/relationships/:userId', requireAuth, async (req, res) => {
  
  // get direction from query params
  const direction = req.query.direction || 'all';
  
  // get status from query params
  const status: string = req.query.status.toString() || 'all';
  
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
        relationships = [];
    }
    res.json(relationships);
  } catch (error) {
    res.status(422).send({ error: error.toString() });
  }
});

// /**
//  * Get outgoing relationships for a user
//  * 
//  * Useful for getting a list of users that a user has sent a friend request to.
//  */
// router.get('/relationships/outgoing/:userId', requireAuth, async (req, res) => {
//   try {
//     const relationships = await Relationships.getOutgoing(req.params.userId);
//     res.json(relationships);
//   } catch (error) {
//     res.status(422).send({ error: error.toString() });
//   }
// });

// /**
//  * Get incoming relationships for a user.
//  * 
//  * Useful for getting a list of users that have sent a friend request to a user.
//  */
// router.get('/relationships/incoming/:userId', requireAuth, async (req, res) => {
//   try {
//     const relationships = await Relationships.getIncoming(req.params.userId);
//     res.json(relationships);
//   } catch (error) {
//     res.status(422).send({ error: error.toString() });
//   }
// });

// /**
//  * Get pending relationships for a user.
//  * 
//  * Useful for getting a list of users that:
//  *  - have sent a friend request to a user
//  *  - a user has sent a friend request to
//  * ... but the request has not been accepted yet.
//  * 
//  * @param direction - "outgoing" | "incoming" | "all"
//  */
// router.get('/relationships/pending/:userId/:direction', requireAuth, async (req, res) => {
//   try {
//     // get direction from req.params.direction and make sure it is valid
//     const direction = req.params.direction.toLowerCase();
//     if (direction !== 'outgoing' && direction !== 'incoming' && direction !== 'all') {
//       throw new Error('Invalid direction');
//     }
    
//     const relationships = await Relationships.getPending(req.params.userId, direction);
//     res.json(relationships);
//   } catch (error) {
//     res.status(422).send({ error: error.toString() });
//   }
// });

// /**
//  * Get connections for a user.
//  * 
//  * Parses the relationships for given user and returns a list of **other**
//  * users that have a relationship with the given user.
//  * 
//  * Filters 
//  */
// router.get('/relationships/connections/:userId/:status', requireAuth, async (req, res) => {
//   try {
//     // get status from req.params.status and make sure it is valid
//     const status = req.params.status.toLowerCase();
//     if (status !== 'accepted' && status !== 'declined' && status !== 'blocked' && status !== 'pending' && status !== 'all') {
//       throw new Error('Invalid status');
//     }
    
//     const relationships = await Relationships.getConnections(req.params.userId, status);
//     res.json(relationships);
//   } catch (error) {
//     res.status(422).send({ error: error.toString() });
//   }
// });

export default router;
