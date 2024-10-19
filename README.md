# AWS Signature Version 4 Authorization Helper

This project provides utilities to create the signature for authenticating requests with **AWS Signature Version 4**, using the HTTP `Authorization` header. The goal is to replace the necessary parts of the [discontinued `CryptoJS` library](https://www.npmjs.com/package/crypto-js) for hashing and HMAC operations with simpler and more focused functions.

## Table of Contents

- [Usage](#usage)
- [The WordArray schema](#the-wordarray-schema)
- [Modules](#modules)
  - [The method SHA256](#the-method-sha256)
  - [The method hmacSHA256](#the-method-hmacsha256)
  - [The method wordArrayToString](#the-method-wordarraytostring)
- [License](#license)

## Usage

In [`index.js`](/index.js), there is an example of how to use the utility functions to generate an AWS Signature Version 4-compliant `Authorization` header for an HTTP request.

It will generate the appropriate headers, including the `Authorization` and `X-Amz-Date` required by AWS for Signature Version 4.

## The WordArray schema

It replicates the `WordArray` schema from the `CryptoJS` library, with the following structure:

```javascript
{
  words: Number[],  // Array of integers representing the binary data
  sigBytes: Number  // Number of significant bytes in the WordArray
}
```

## Modules

### The method SHA256

Generates a SHA-256 hash for the given string, shaped as a [`WordArray object`](#the-wordarray-schema).

It replaces the `SHA256` method from the `CryptoJS` library.

|          | Name    | Type      |
| -------- | ------- | --------- |
| @param   | message | String    |
| @returns |         | WordArray |

Example usage:

```javascript
import { SHA256 } from "./methods/SHA256.js";

const hash = await SHA256("your message here");
```

### The method hmacSHA256

Generates a SHA-256 hash signed with the secret key via HMAC (Hash-based Message Authentication Code), returning a [`WordArray` object](#the-wordarray-schema).

This method replaces the `hmacSHA256(message, key)` method from the `CryptoJS` library.

|          | Name    | Type                |
| -------- | ------- | ------------------- |
| @param   | message | String              |
| @param   | key     | String \| WordArray |
| @returns |         | WordArray           |

Example usage:

```javascript
import { hmacSHA256 } from "./methods/hmacSHA256.js";

const key = "your-secret-key";
const message = "your-message-to-sign";
const result = await hmacSHA256(message, key);
```

### The method wordArrayToString

This method converts a [`WordArray` object](#the-wordarray-schema) (such as the output of [`SHA256`](#the-method-sha256) or [`hmacSHA256`](#the-method-hmacsha256)) into a hexadecimal string.

|          | Name      | Type      |
| -------- | --------- | --------- |
| @param   | wordArray | WordArray |
| @returns |           | String    |

Example usage:

```javascript
import { wordArrayToString } from "./methods/wordArray.js";

const wordArray = {
  words: [
    -1567232218, 331030564, 1562435124, 1510089630, 1352492523, -1538243759,
    -1426617865, 13957215452,
  ],
  sigBytes: 32,
};
const hexString = wordArrayToString(wordArray);
```

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.
