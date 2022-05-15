export const genClientId = () => (Math.random().toString(36) + '0000000000000000000').slice(2, 10).toUpperCase();
