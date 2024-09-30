// db.js
const dbName = "descriptionsDB";
const storeName = "descriptions";

const openDatabase = () => {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, 1);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      db.createObjectStore(storeName, { keyPath: "id" });
    };

    request.onsuccess = (event) => {
      resolve(event.target.result);
    };

    request.onerror = (event) => {
      reject(event.target.error);
    };
  });
};

export const saveDescriptions = async (descriptions) => {
  const db = await openDatabase();
  const transaction = db.transaction(storeName, "readwrite");
  const store = transaction.objectStore(storeName);

  descriptions.forEach((description) => {
    store.put(description); // Adiciona ou atualiza a descrição
  });

  return new Promise((resolve) => {
    transaction.oncomplete = () => resolve();
  });
};

export const fetchDescriptions = async () => {
  const db = await openDatabase();
  const transaction = db.transaction(storeName, "readonly");
  const store = transaction.objectStore(storeName);
  
  return new Promise((resolve) => {
    const request = store.getAll(); // Pega todas as descrições
    request.onsuccess = () => resolve(request.result);
  });
};
