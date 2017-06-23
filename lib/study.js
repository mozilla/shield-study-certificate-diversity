/** study.js **/
const self = require('sdk/self');
const shield = require('shield-studies-addon-utils');
const { when: unload } = require('sdk/system/unload');

const feature = require('./feature');

const studyConfig = {
  name: self.addonId,
  duration: 7,
  surveyUrls:  {
    'end-of-study': null,
    'user-ended-study': null,
    'ineligible':  null
  },
  variations: {
    'base': () => {},
  }
};

class CertDiversityStudy extends shield.Study {
  constructor (config) {
    super(config);
  }
  isEligible () {
    return super.isEligible();
  }
  whenIneligible () {
    super.whenIneligible();
  }
  whenInstalled () {
    super.whenInstalled();
    feature.setup();
  }
  cleanup (reason) {
    super.cleanup();  // cleanup simple-prefs, simple-storage
    feature.cleanup();
  }
  whenComplete () {
    super.whenComplete();  // calls survey, uninstalls
  }
  whenUninstalled () {
    super.whenUninstalled();
  }
  decideVariation () {
    return super.decideVariation(); // chooses at random
  }
}

const thisStudy = new CertDiversityStudy(studyConfig);

// for testing / linting
exports.CertDiversityStudy = CertDiversityStudy;
exports.studyConfig = studyConfig;

// for use by index.js
exports.study = thisStudy;

unload((reason) => thisStudy.shutdown(reason));
