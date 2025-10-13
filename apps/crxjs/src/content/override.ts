console.log('Injector script running in the main world!');

const originalCredentials = navigator.credentials;

Object.defineProperty(navigator, 'credentials', {
  get: () => {
    console.log('navigator.credentials has been accessed!');
    // You can return a modified object, a mock, or the original.
    // For this example, we'll just log and return the original.
    return originalCredentials;
  },
  configurable: true, // Important: Allows the property to be reconfigured later if needed
});
