# Certificate Diversity Shield Study

## Features

Collects some metadata on certificates that users encounter. Securely makes this
metadata anonymous before sending back to Mozilla.

### Details
Every time browser connects to a website, study collects the following
about the presented certificate:

    1. Validity period (only Day, Month, Year)
    3. Anonymized names of all CAs involved in the chain of trust
    4. Anonymized hash of entire certificate

### Goals
This study has two primary objectives:

    1. to get information on the distribution of root and intermediate certificate authorities that users encounter
    2. to get information on the validity periods of certificates that users encounter

We should be able to calculate many important statements from collected data, such as:

We should be able to calculate many important statements from collected data, such as:

    1. "X% of intermediate certificates that users encounter are signed by Y% of roots"
    2. "The average lifetime of 'common' intermediates is X years"
    3. "Root and intermediate certificates outlive the certificates they sign by Y months on average"
    4. "Commonly encountered intermediate certificates are more likely to sign short-lived leaf certificates"
    5. "The expiration dates of commonly encountered certificates are nearly uniformly distributed"

These answers may have significant influence on the design decisions made for implementing CRLite, a new certificate revocation detection mechanism. The SecEng team is currently exploring options for supporting CRLite on subsets of certificates, and an indication that Firefox users mostly encounter certificates from a small number of intermediates may provide evidence of the effectiveness of these partial solutions.

While solutions like Censys can provide some insights on the state of certificates, there does not appear to be much data from the perspective of the average browser client.

## Setup, Install, Build
Requires jpm and npm.

1.  Clone / copy the directory
2.  `npm install`
3.  `jpm xpi`
