/*
 * Run using the mongo shell. For remote databases, ensure that the
 * connection string is supplied in the command line. For example:
 *   mongo tickettoride scripts/init.mongo.js
 */

db.travellers.remove({});
db.blacklist.remove({});

/*Q1. Enter the code for adding the initial list of Travellers here.
 * Create a list of Travellers with necessary fields. 
 * Enter the list of travellers into the DB collection named 'travellers'.
 * */

const travellersDB = [
    {id: 1, name: "test1", phone: '80123456', seat: 1, bookingTime: Date.now()},
    {id: 2, name: "test2", phone: '80123457', seat: 2, bookingTime: Date.now()}
];
db.travellers.insertMany(travellersDB);


/*Q1 code ends here*/


const count = db.travellers.count();
print('Inserted', count, 'Travellers');

//The _id below is just a placeholder. The below collection, in fact, has only one row and one column. We can denote this by any name but we call this fixedindex.
db.counters.remove({ _id: 'travellers' });
db.counters.insert({ _id: 'travellers', current: count });

db.travellers.createIndex({ id: 1 }, { unique: true });
db.travellers.createIndex({ name: 1 });
db.travellers.createIndex({ phone: 1 });
db.travellers.createIndex({ seat: 1 }, { unique: true });
db.travellers.createIndex({ bookingTime: 1 });
