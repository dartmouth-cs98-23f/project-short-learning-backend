import { Router } from 'express';
import { requireAuth, requireSignin } from '../services/passport';
import * as User from '../controllers/user_controllers';

const router = Router();

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

export default router;
