import { Router } from 'express';
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

export default router;