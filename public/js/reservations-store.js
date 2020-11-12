const DB_VERSION = 1;
const DB_NAME = 'gih-reservations';

const openDatabase = () => {
  return new Promise((resolve, reject) => {
    if (!window.indexedDB) {
      reject('IndexedDB not supported');
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      reject('Database error:', event.target.error);
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onupgradeneeded = (event) => {
      const db = event.target.result;

      if (!db.objectStoreNames.contains('reservations')) {
        db.createObjectStore('reservations', {
          keyPath: 'id',
        });
      }
    };
  });
};

const openObjectStore = (db, storeName, transactionMode) => {
  return db.transaction(storeName, transactionMode).objectStore(storeName);
};

const addToObjectStore = (storeName, object) => {
  return new Promise((resolve, reject) => {
    openDatabase()
      .then((db) => {
        openObjectStore(db, storeName, 'readwrite').add(
          object
        ).onsuccess = resolve;
      })
      .catch((error) => reject(error));
  });
};

const updateInObjectStore = (storeName, id, object) => {
  return new Promise((resolve, reject) => {
    openDatabase()
      .then((db) => {
        openObjectStore(db, storeName, 'readwrite').openCursor().onsuccess = (
          event
        ) => {
          const cursor = event.target.result;
          if (!cursor) {
            reject('Reservation not found in object store');
          }

          if (cursor.value.id === id) {
            cursor.update(object).onsuccess = resolve;
            return;
          }

          cursor.continue();
        };
      })
      .catch((err) => reject(err));
  });
};

const getReservations = () => {
  return new Promise((resolve, reject) => {
    openDatabase()
      .then((db) => {
        const objectStore = openObjectStore(db, 'reservations');

        const reservations = [];

        objectStore.openCursor().onsuccess = (event) => {
          const cursor = event.target.result;

          // Store, falling back to network w frequent updates
          if (cursor) {
            reservations.push(cursor.value);
            cursor.continue();
          } else if (reservations.length > 0) {
            resolve(reservations);
          } else {
            getReservationsFromServer().then((reservations) => {
              openDatabase().then((db) => {
                const objectStore = openObjectStore(
                  db,
                  'reservations',
                  'readwrite'
                );

                for (let i = 0; i < reservations.length; i++) {
                  objectStore.add(reservations[i]);
                }

                resolve(reservations);
              });
            });
          }
        };
      })
      .catch(() => {
        getReservationsFromServer().then((reservations) =>
          resolve(reservations)
        );
      });
  });
};

const getReservationsFromServer = () => {
  return new Promise((resolve) => $.getJSON('/reservations.json', resolve));
};
