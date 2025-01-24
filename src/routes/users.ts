import express from 'express';

var router = express.Router({ mergeParams: true });

/* GET users listing. */
router.get('/', function (req: any, res: any, next: (err?: any) => any) {
  res.send('respond with a resource');
});

export default router;
