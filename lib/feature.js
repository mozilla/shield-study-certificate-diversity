/** feature.js **/
const { Cc, Ci } = require('chrome');
const OS = Cc['@mozilla.org/observer-service;1'].getService(Ci.nsIObserverService);

const CryptoJS = require('crypto-js');
const prefSvc = require('sdk/preferences/service');
const TelemetryLog = require('lib/TelemetryLog.js');

const HMAC_key_pref = 'shield.certificateDiversity.HMAC_key';

exports.cleanup = function () {
  this.observer.unregister;
  prefSvc.reset(HMAC_key_pref);
};

exports.setup = function () {
  if(!prefSvc.has(HMAC_key_pref)) {
    const key = CryptoJS.lib.WordArray.random(128/8);
    prefSvc.set(HMAC_key_pref, key);
  }
  this.observer = new CertObserver();
};

function CertObserver() {
  this.register();
}
CertObserver.prototype = { //eslint-disable-line no-undef
  observe: function(subject, topic, data) {
    subject.QueryInterface(Ci.nsIHttpChannel);
    const chain = this.getCert(subject);
    const key = prefSvc.get(HMAC_key_pref);
    //for each certificate in the chain
    for (let i = chain.length - 1; i >= 0; i--) {
      let cert = chain.queryElementAt(i, Ci.nsIX509Cert);
      // get some stats on cert
      const fingerprintHMAC = CryptoJS.HmacSHA256(cert.sha256Fingerprint, key);
      const validity = cert.validity;
      // Use validity.notAfterLocalDay, .notBeforeLocalDay if anonymization req'd
      const commonNameHMAC = CryptoJS.HmacSHA256(cert.issuerCommonName, key);
      const issuerOrgHMAC = CryptoJS.HmacSHA256(cert.issuerOrganization, key);
      const issuerUnitHMAC = CryptoJS.HmacSHA256(cert.issuerOrganizationUnit, key);
      // log the data
      TelemetryLog.log({
        fingerprintHMAC,
        validity,
        commonNameHMAC,
        issuerUnitHMAC,
        issuerOrgHMAC,
      });
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
