import { Router } from 'express';
import { requireAuth, requireSignin } from './services/passport';
import * as User from './controllers/user_controllers';

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

export default router;