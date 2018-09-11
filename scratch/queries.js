'use strict';

const knex = require('../knex');

process.stdout.write('\x1Bc');

// let searchTerm = 1001;
// knex
//   .select('notes.id', 'title', 'content')
//   .from('notes')
//   .modify(queryBuilder => {
//     if (searchTerm) {
//       queryBuilder.where('title', 'like', `%${searchTerm}%`);
//     }
//   })
//   .orderBy('notes.id')
//   .then(results => {
//     console.log(JSON.stringify(results, null, 2));
//   })
//   .catch(err => {
//     console.error(err);
//   });


//search by id
// knex
//   .select('notes.id')
//   .from('notes')
//   .modify(queryBuilder => {
//     if(searchTerm) {
//       queryBuilder.where('id', searchTerm );
//     }
//   })
//   .then(results => {
//     JSON.stringify(results, null, 2);
//   })
//   .catch(err => {
//     console.log(err);
//   });


  //update
// knex('notes')
//   .where('id', searchTerm)
//   .update(myObj)
//   .then(console.log)
//   .catch(err => {
//     console.log(err);
//   });

// let newObj =   {
//   "title": "NEWTITLE",
//   "content": "NEWCONTENT"
// };

//create note
// knex
//   .insert(newObj)
//   .into('notes')
//   .returning(['id', 'title', 'content'])
//   .then(console.log);

//delete
let searchID = 1029;
knex('notes')
  .where({id: searchID})
  .del()
  .then();



knex('notes')
  .select()
  .then(console.log);
