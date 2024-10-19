import { SHA256 } from './methods/SHA256.js'
import { hmacSHA256 } from './methods/hmacSHA256.js'
import { wordArrayToString } from './methods/wordArray.js'

// Use case: getting an HTTP Authorization header of AWS Signature Version 4
async function example() {
    const headers = await getHeaders({
        method: "POST",
        url: "https://example.dev",
        data: {
            key: "value",
            anotherKey: "anotherValue"
        },
        credentials: {
            token: "tokenString",
            accessKeyId: "accessKeyIdString",
            secretKey: "secretKeyString"
        },
        awsRegion: "eu-west-1"
    })

    console.log("AWS Headers:", headers)
}

async function getHeaders({ method, url, data, credentials, awsRegion }) {
    const ALGORITHM_NAME = 'AWS4-HMAC-SHA256'
    const AWS_SERVICE = 'some-service'

    const amzDate = getAmzDate()
    const timestamp = amzDate.slice(0, 8)
    const credentialScope = `${timestamp}/${awsRegion}/${AWS_SERVICE}/aws4_request`

    // Task 1: Create a Canonical Request
    // See https://docs.aws.amazon.com/AmazonS3/latest/API/sig-v4-header-based-auth.html#canonical-request    
    const canonicalRequest = await getCanonicalRequest(method, url, data)

    // Task 2: Create a String to Sign
    // See https://docs.aws.amazon.com/AmazonS3/latest/API/sig-v4-header-based-auth.html#request-string
    const stringToSign = await getStringToSign(
        canonicalRequest,
        ALGORITHM_NAME,
        amzDate,
        credentialScope
    )

    // Task 3: Calculate Signature
    // See https://docs.aws.amazon.com/AmazonS3/latest/API/sig-v4-header-based-auth.html#signing-key
    const signature = await getSignature(
        credentials.secretKey,
        timestamp,
        awsRegion,
        AWS_SERVICE,
        stringToSign
    )

    return {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Amz-Date': amzDate,
        'Authorization': `${ALGORITHM_NAME} Credential=${credentials.accessKeyId}/${credentialScope}, SignedHeaders=host, Signature=${signature}`,
        'X-Amz-Security-Token': credentials.token,
    }
}

async function getCanonicalRequest(method, url, data) {
    const { pathname, search, host } = new URL(url)
    const hostHeader = 'host:' + host + '\n'

    const isGet = method === "GET"
    const searchParams = isGet ? new URLSearchParams(search).toString() : search
    const dataString = isGet ? "" : JSON.stringify(data)
    const bodyHash = await stringToHashHex(dataString)

    return [
        method,
        pathname,
        searchParams,
        hostHeader,
        'host',
        bodyHash,
    ].join('\n')
}

async function getStringToSign(canonicalRequest, algorithmName, amzDate, credentialScope) {
    const hashedCanonicalRequest = await SHA256(canonicalRequest)

    return [
        algorithmName,
        amzDate,
        credentialScope,
        hashedCanonicalRequest,
    ].join('\n')
}

async function getSignature(secretKey, timestamp, region, service, stringToSign) {
    const kDate = await hmacSHA256(timestamp, 'AWS4' + secretKey)
    const kRegion = await hmacSHA256(region, kDate)
    const kService = await hmacSHA256(service, kRegion)
    const kSigning = await hmacSHA256('aws4_request', kService)
    const signature = await hmacSHA256(stringToSign, kSigning)

    return wordArrayToString(signature)
}

function getAmzDate() {
    return new Date()
        .toISOString()
        .replace(/[-:.]/g, '')
        .slice(0, 15)
        .concat('Z')
}