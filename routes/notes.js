'use strict';

const express = require('express');
const hydrateNotes = require('../utils/hydrateNotes');
// Create an router instance (aka "mini-app")
const notesRouter = express.Router();

// TEMP: Simple In-Memory Database
const knex = require('../knex');

// Get All (and search by query)
notesRouter.get('/', (req, res, next) => {
  const { searchTerm } = req.query;
  const { folderId, noteTagId } = req.query;
  knex.select('notes.id', 'title', 'content', 'folders.id as folderId', 'folders.name as folderName', 'notes_tags.tag_id', 'tags.id', 'tags.name')
  .from('notes')
  .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
  .leftJoin('tags', 'notes_tags.tag_id', 'tags.id')
  .leftJoin('folders', 'notes.folder_id', 'folders.id')
  .modify(queryBuilder => {
    if (searchTerm) {
      queryBuilder.where('title', 'like', `%${searchTerm}%`);
    }
  })
  .modify(function (queryBuilder) {
    if (folderId) {
      queryBuilder.where('folder_id', folderId);
    }
    if (noteTagId) {
      queryBuilder.where('tag_id', noteTagId);
    }
  })
  .orderBy('notes.id')
  .then(results => {
    res.json(results);
  })
  .catch(err => {
    next(err);
  });
});

// Get a single item
notesRouter.get('/:id/', (req, res, next) => {
  const { id } = req.params;
  const { folderId, noteTagId } = req.query;
  knex.first('notes.id', 'title', 'content', 'folders.id as folderId', 'folders.name as folderName', 'notes_tags.tag_id', 'tags.id', 'tags.name')
  .from('notes')
  .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
  .leftJoin('tags', 'notes_tags.tag_id', 'tags.id')
  .leftJoin('folders', 'notes.folder_id', 'folders.id')
  .where('notes.id', id)
  .modify(function (queryBuilder) {
    if (folderId) {
      queryBuilder.where('folder_id', folderId);
    }
    if (noteTagId) {
      queryBuilder.where('tag_id', noteTagId);
    }
  })
  // .returning(['id', 'title', 'content'])
  .then(results => {
    if (results) {
      // Hydrate the results
      const hydrated = hydrateNotes(results)[0];
      // Respond with a location header, a 201 status and a note object
      res.location(`${req.originalUrl}/${hydrated.id}`).status(201).json(hydrated);
    } else {
      next();
    }
  })
  .catch(err => {
    next(err);
  });
});

// Put update an item
notesRouter.put('/:id', (req, res, next) => {
  const { id } = req.params;

  /***** Never trust users - validate input *****/
  const updateObj = {};
  const updateableFields = ['title', 'content'];

  updateableFields.forEach(field => {
    if (field in req.body) {
      updateObj[field] = req.body[field];
    }
  });

  /***** Never trust users - validate input *****/
  if (!updateObj.title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  let noteId;

  knex('notes')
    .where('id', id)
    .update(updateObj)
    .returning(['id'])
    .then(([item]) => {
      noteId = item.id;
      // SELECT notes.id, title, folder_id as folderId
      // FROM notes
      // LEFT JOIN folders ON notes.folder_id = folders.id
      return knex.select('notes.id', 'title', 'content', 'folder_id as folderId', 'folders.name as folderName')
        .from('notes')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .where('notes.id', noteId);
    })
    .then(([result]) => {
      res.location(`${req.originalUrl}/${result.id}`).status(201).json(result);
    })
    .catch(err => {
      next(err);
  });
});

// Post (insert) an item
notesRouter.post('/', (req, res, next) => {
  const { title, content, folderId, tags } = req.body;
  const newItem = { title, content, folder_id: folderId };
  let noteId;
  // Insert new note into notes table
  knex.insert(newItem).into('notes').returning('id')
    .then(([id]) => {
      // Insert related tags into notes_tags table
      noteId = id;
      const tagsInsert = tags.map(tagId => ({ note_id: noteId, tag_id: tagId }));
      return knex.insert(tagsInsert).into('notes_tags');
    })
    .then(() => {
      // Select the new note and leftJoin on folders and tags
      return knex.select('notes.id', 'title', 'content',
        'folders.id as folder_id', 'folders.name as folderName',
        'tags.id as tagId', 'tags.name as tagName')
        .from('notes')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
        .leftJoin('tags', 'tags.id', 'notes_tags.tag_id')
        .where('notes.id', noteId);
    })
    .then(result => {
      if (result) {
        // Hydrate the results
        const hydrated = hydrateNotes(result)[0];
        // Respond with a location header, a 201 status and a note object
        res.location(`${req.originalUrl}/${hydrated.id}`).status(201).json(hydrated);
      } else {
        next();
      }
    })
    .catch(err => next(err));
});

// Delete an item
notesRouter.delete('/:id', (req, res, next) => {
  const id = req.params.id;

  knex('notes').where({id: id})
    .del()
    .then(res.sendStatus(204))
    .catch(err => {
     next(err);
  });
});

module.exports = notesRouter;
