# Certificate Diversity Shield Study

## Features

Collects some metadata on certificates that users encounter. Securely makes this
metadata anonymous before sending back to Mozilla.

### Details
Every time browser connects to a website, study collects the following
about the presented certificate:

    1. Validity period (only Day, Month, Year)
    2. Whether certificate was submitted to CT log. If yes, log names.
    3. Anonymized names of all CAs involved in the chain of trust (names are hashed using user-specific secret key randomly generated client-side)  -- this is to see how often users encounter the same issuers, such as Let’s Encrypt, but without learning anything about the identities of issuers
    4. Anonymized hash of entire certificate -- to ensure data set only includes each unique certificate one time, and see how often users encounter exact same certificates

## General Setup and Install

1.  Clone / copy the directory
2.  `npm install`
