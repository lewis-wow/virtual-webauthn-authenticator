/**
 * Describes the authenticator's transport mechanism. This indicates how the
 * authenticator communicates with the client (e.g., via USB, NFC, Bluetooth).
 */
export type AuthenticatorTransportFuture =
  | 'ble' // Bluetooth Low Energy
  | 'cable' // A FIDO cable protocol (e.g., a mobile device connected to a computer)
  | 'hybrid' // A combination of transports
  | 'internal' // Built-in to the client device (e.g., Touch ID, Windows Hello)
  | 'nfc' // Near Field Communication
  | 'smart-card' // Smart card
  | 'usb'; // Universal Serial Bus
