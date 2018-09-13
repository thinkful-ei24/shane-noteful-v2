const express = require('express');
const knex = require('../knex');

const tagsRouter = express.Router();

tagsRouter.get('/', (req, res, next) => {
  knex.select('id', 'name')
    .from('tags')
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

router.get('/:id', (req, res, next) => {
  const { id } = req.params;

  knex.first('id', 'name')
    .from('tags')
    .where('id', id)
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

tagsRouter.put('/:id', (req, res, next) => {
  const { id } = req.params;

  const updateItem = {
    name: req.body.name
  }

  knex('tags')
    .where('id', id)
    .update(updateItem)
    .returning(['id', 'name'])
    .then(item => {
      res.json(item);
    })
    .catch(err => {
      next(err);
    });
});

tagsRouter.post('/', (req, res, next) => {
  const { name } = req.body;
  const newItem = { name };

  if(!newItem.name) {
    const err = new Error('Missing `name` in request body');
    err.status(400);
    return next(err);
  }

  knex.insert(newItem)
    .into('tags')
    .returning(['id', 'name'])
    .then(results => {
      res.json(results);
    })
    .catch(err => {
      next(err);
    });
});

tagsRouter.delete('/:id', (req, res, next) => {
  const { id } = req.params;

  knex('tags')
    .where('id', id)
    .del()
    .then(res.sendStatus(204))
});


















router.post('/tags', (req, res, next) => {
  const { name } = req.body;

  /***** Never trust users. Validate input *****/
  if (!name) {
    const err = new Error('Missing `name` in request body');
    err.status = 400;
    return next(err);
  }

  const newItem = { name };

  knex.insert(newItem)
    .into('tags')
    .returning(['id', 'name'])
    .then((results) => {
      // Uses Array index solution to get first item in results array
      const result = results[0];
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => next(err));
});