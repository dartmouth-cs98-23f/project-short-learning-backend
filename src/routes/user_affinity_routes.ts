import { Router } from 'express';
import { requireAuth } from '../services/passport';
import * as UserAffinity from '../controllers/user_affinity_controller';

const router = Router();

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

export default router;
