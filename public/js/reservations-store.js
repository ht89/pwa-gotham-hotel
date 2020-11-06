const openDatabase = () => {
  if (!window.indexedDB) {
    return;
  }

  const request = window.indexedDB.open('gih-reservations', 1);

  request.onerror = (event) => {
    console.log('Database error:', event.target.error);
  };

  request.onupgradeneeded = (event) => {
    const db = event.target.result;

    if (!db.objectStores.contains('reservations')) {
      db.createObjectStore('reservations', {
        keyPath: 'id',
      });
    }
  };

  return request;
};

const openObjectStore = (storeName, successCallback, transactionMode) => {};
