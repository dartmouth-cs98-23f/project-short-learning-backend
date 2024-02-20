import { Router } from 'express'
import * as Dashbooard from '../controllers/dashboard_controllers';
import { requireAuth } from '../services/passport';

const dashboardRouter = Router();

/**
 * GET request to get dashboard data
 *  - See src/models/dashboard_models.ts for the schema
 *
 * @pathparam none
 *
 * @queryparam date.gt - get watch history with date greater than this date
 * @queryparam date.lt - get watch history with date less than this date
 * 
 * @returns a json object with the dashboard data
 *
 * @errors 200 if success
 *         422 if no dashboard data found
 *         500 if server error
 */
dashboardRouter.get('/dashboard', requireAuth, async (req, res) => {
  try {
    const dashboardData = await Dashbooard.getDashboardData(req.user, req.query);
    return res.json(dashboardData);
  } catch (error) {
    res.status(422).json({ error: error.message });
  }
});

export default dashboardRouter;