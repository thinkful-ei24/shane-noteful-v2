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
  const { folderId } = req.query;
  const { tagId } = req.query;
  knex.select('notes.id', 'title', 'content', 'folders.id as folderId', 'folders.name as folderName', 'tags.id as tagId', 'tags.name as tagName')
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
  })
  .modify(queryBuilder => {
    if (tagId) {
      queryBuilder.where('tag_id', tagId);
    }
  })
  .orderBy('notes.id')
  .then(result => {
    if (result) {
      // Hydrate the results
      if(result){
        const hydrated = hydrateNotes(result);
        res.json(hydrated);
      } else{
        next();
      }
  }
  })
  .catch(err => {
    next(err);
  });
});

// Get a single item
notesRouter.get('/:id/', (req, res, next) => {
  const { id } = req.params;

  knex.select('notes.id', 'title', 'content', 'folders.id as folderId', 'folders.name as folderName', 'tags.id as tagId', 'tags.name as tagName')
  .from('notes')
  .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
  .leftJoin('tags', 'notes_tags.tag_id', 'tags.id')
  .leftJoin('folders', 'notes.folder_id', 'folders.id')
  .where('notes.id', id)
  .then(result => {
    if (result) {
      // Hydrate the results
      if(result){
        const hydrated = hydrateNotes(result)[0];
        res.json(hydrated);
      } else{
        next();
      }
  }
  })
  .catch(err => {
    err.status(404);
    next(err);
  });
});

// Put update an item
notesRouter.put('/:id', (req, res, next) => {
  const noteId = req.params.id;
  const { title, content, folderId, tags = [] } = req.body;

  /***** Never trust users. Validate input *****/
  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  const updateItem = {
    title: title,
    content: content,
    folder_id: (folderId) ? folderId : null
  };

  knex('notes').update(updateItem).where('id', noteId)
    .then(() => {
      return knex.del().from('notes_tags').where('note_id', noteId);
    })
    .then(() => {
      const tagsInsert = tags.map(tid => ({ note_id: noteId, tag_id: tid }));
      return knex.insert(tagsInsert).into('notes_tags');
    })
    .then(() => {
      return knex.select('notes.id', 'title', 'content',
        'folder_id as folderId', 'folders.name as folderName',
        'tags.id as tagId', 'tags.name as tagName')
        .from('notes')
        .leftJoin('folders', 'notes.folder_id', 'folders.id')
        .leftJoin('notes_tags', 'notes.id', 'notes_tags.note_id')
        .leftJoin('tags', 'tags.id', 'notes_tags.tag_id')
        .where('notes.id', noteId);
    })
    .then(result => {
      if (result) {
        const [hydrated] = hydrateNotes(result);
        res.json(hydrated);
      } else {
        next();
      }
    })
    .catch(err => {
      next(err);
    });
});


// Post (insert) an item
notesRouter.post('/', (req, res, next) => {
  const { title, content, folderId, tags = [] } = req.body;

  /***** Never trust users. Validate input *****/
  if (!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  const newItem = { title, content, folder_id: folderId };
  let noteId;

  // Insert new note into notes table
  knex.insert(newItem)
    .into('notes')
    .returning('id')
    .then(([id]) => {
      noteId = id;
      const tagsInsert = tags.map(tagId => ({ note_id: noteId, tag_id: tagId }));
      return knex.insert(tagsInsert).into('notes_tags');
    })
    .then(() => {
      // Select the new note and leftJoin on folders and tags
      return knex.select('notes.id', 'title', 'content', 'folders.id as folder_id', 'folders.name as folderName', 'tags.id as tagId', 'tags.name as tagName')
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

  // knex('notes').where({id: id})
  //   .del()
  //   .then(res.sendStatus(204))
  //   .catch(err => {
  //    next(err);
  // });

  knex.del()
    .where('id', id)
    .from('notes')
    .then(() => {
      res.status(204).end();
    })
    .catch(err => {
      next(err);
    });
});

module.exports = notesRouter;
