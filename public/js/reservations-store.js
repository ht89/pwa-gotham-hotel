const openDatabase = () => {
  if (!window.indexedDB) {
    return false;
  }

  const request = window.indexedDB.open('gih-reservations', 1);

  request.onerror = (event) => {
    console.log('Database error:', event.target.error);
  };

  request.onupgradeneeded = (event) => {
    const db = event.target.result;

    if (!db.objectStoreNames.contains('reservations')) {
      db.createObjectStore('reservations', {
        keyPath: 'id',
      });
    }
  };

  return request;
};

const openObjectStore = (storeName, successCallback, transactionMode) => {
  const db = openDatabase();
  if (!db) {
    return false;
  }

  db.onsuccess = (event) => {
    const db = event.target.result;

    const objectStore = db
      .transaction(storeName, transactionMode)
      .objectStore(storeName);

    successCallback(objectStore);
  };

  return true;
};

const getReservations = (successCallback) => {
  const reservations = [];

  const db = openObjectStore('reservations', (objectStore) => {
    objectStore.openCursor().onsuccess = (event) => {
      const cursor = event.target.result;

      // Store, falling back to network w frequent updates
      if (cursor) {
        reservations.push(cursor.value);
        cursor.continue();
      } else if (reservations.length > 0) {
        successCallback(reservations);
      } else {
        $.getJSON('/reservations.json', (reservations) => {
          openObjectStore(
            'reservations',
            (reservationStore) => {
              for (let i = 0; i < reservations.length; i++) {
                reservationStore.add(reservations[i]);
              }

              successCallback(reservations);
            },
            'readwrite'
          );
        });
      }
    };
  });

  if (!db) {
    $.getJSON('/reservations.json', successCallback);
  }
};
