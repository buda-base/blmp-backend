import express from 'express';
import personRoutes from './person';
import userRoutes from './user';

const router = express.Router(); // eslint-disable-line new-cap

/** GET /health-check - Check service health */
router.get('/health-check', (req, res) => res.send('OK'));

// mount person routes at /persons
router.use('/persons', personRoutes);

// mount works routes at /works
router.use('/works', personRoutes);

// mount auth routes at /user
router.use('/users', userRoutes);

export default router;
