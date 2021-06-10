import '@testing-library/jest-dom/extend-expect';

process.on('unhandledRejection', (reason) => {
  console.error('Jest has found an unhandled exception!');
  fail(reason);
});
