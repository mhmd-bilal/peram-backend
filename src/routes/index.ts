import express from 'express';

var router = express.Router();

/* GET home page. */
router.get('/', function (req: any, res: any, next: (err?: any) => any) {
  res.render('index', { title: 'Peram backend' });
});

export default router;
