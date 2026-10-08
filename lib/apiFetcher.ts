export const apiFetcher = (url: string) => {
  return fetch(url).then((res) => res.json());
};

