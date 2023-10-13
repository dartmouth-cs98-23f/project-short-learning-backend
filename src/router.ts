import { Router } from 'express';

const router = Router();

router.get('/', (req, res) => {
  res.json({ message: 'Shortform API' });
});

export default router;