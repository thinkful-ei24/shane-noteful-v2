const express = require('express');
const knex = require('../knex');

const router = express.Router();

foldersRouter.get('/', (req, res, next) => {
  knex.select('id', 'name')
    .from('folders')
    .then(results => {
      res.json(results);
    })
    .catch(err => next(err));
});

foldersRouter.get('/:id', (req, res, next) => {
  const { id } = req.params;

  knex.first('id', 'name')
    .from('folders')
    .where('id', id)
    .returning(['id', 'name'])
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

foldersRouter.put('/:id', (req, res, next) => {
  const { id } = req.params;

  const updateObj = {
    name: req.body.name
  };

  knex('folders')
    .where('id', id)
    .update(updateObj)
    .returning(['id', 'name'])
    .then(item => {
      res.json(item);
    })
    .catch(err => {
      next(err);
    });
});

foldersRouter.post('/', (req, res, next) => {
  const { name } = req.body;

  const newItem = { name };

  if(!newItem.name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  knex.insert(newItem)
    .into('folders')
    .returning(['id', 'name'])
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
  });
});

foldersRouter.delete('/:id', (req, res, next) => {
  const { id } = req.params;

  knex('folders').where({id: id})
    .del()
    .then(res.sendStatus(204))
});


module.exports = router;