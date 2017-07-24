/** feature.js **/
const { Cc, Ci} = require('chrome');
const OS = Cc['@mozilla.org/observer-service;1'].getService(Ci.nsIObserverService);

const sjcl = require('sjcl');
const xutils = require('shield-studies-addon-utils');

exports.cleanup = function () {
  this.observer.unregister;
};

exports.setup = function () {
  this.observer = new CertObserver();
};

function CertObserver() {
  this.register();
  this.leafFingerprints = [];
  this.hmac = new sjcl.misc.hmac('test');
}
CertObserver.prototype = { //eslint-disable-line no-undef
  toHex: function(byteArray) {
    return Array.from(byteArray, function(byte) {
      return ('0' + (byte & 0xFF).toString(16)).slice(-2);
    }).join('');
  },
  observe: function(subject, topic, data) {
    subject.QueryInterface(Ci.nsIHttpChannel);
    const leaf = this.getCert(subject);
    if(leaf === null) {
      return; // exit if no certificate (connection over http)
    }
    const chain = leaf.getChain();
    let certData = [];
    for (let i = chain.length - 1; i >= 0; i--) {
      let cert = chain.queryElementAt(i, Ci.nsIX509Cert);
      // get some stats on cert, anonymize them
      const fingerprintHMAC = this.toHex(this.hmac.encrypt(cert.sha256Fingerprint));
      const validityStart = cert.validity.notBeforeLocalDay;
      const validityEnd = cert.validity.notAfterLocalDay;
      const commonNameHMAC = this.toHex(this.hmac.encrypt(cert.issuerCommonName));
      const issuerOrgHMAC = this.toHex(this.hmac.encrypt(cert.issuerOrganization));
      const issuerUnitHMAC = this.toHex(this.hmac.encrypt(cert.issuerOrganizationUnit));
      certData.push({
        fingerprintHMAC,
        validityStart,
        validityEnd,
        commonNameHMAC,
        issuerUnitHMAC,
        issuerOrgHMAC,
      });
    }
    // log this (anonymized) certificate chain if we haven't seen it before
    const fingerprint = certData.slice(-1)[0].fingerprintHMAC;
    if(this.leafFingerprints.indexOf(fingerprint) === -1) {
      this.leafFingerprints.push(fingerprint);
      xutils.report(certData);
    }
  },
  register: function() {
    OS.addObserver(this, 'http-on-examine-response', false);
  },
  unregister: function() {
    OS.removeObserver(this, 'http-on-examine-response');
  },
  getCert: function(channel) {
    try {
      // Do we have a valid channel argument?
      if (!(channel instanceof Ci.nsIChannel)) {
        return null;
      }
      var secInfo = channel.securityInfo;
      // Print general connection security state
      if (secInfo instanceof Ci.nsITransportSecurityInfo) {
        secInfo.QueryInterface(Ci.nsITransportSecurityInfo);
      } else {
        return null;
      }
      if (secInfo instanceof Ci.nsISSLStatusProvider) {
        return secInfo.QueryInterface(Ci.nsISSLStatusProvider).
               SSLStatus.QueryInterface(Ci.nsISSLStatus).serverCert;
      }
      return null;
    } catch(err) {
      return null;
    }
  },
};
