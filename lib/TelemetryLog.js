/* A Generic Telemetry Logging Class */

const simpleStorage = require('sdk/simple-storage');
const xutils = require('shield-studies-addon-utils');

class TelemetryLog {
  get logData() {
    return simpleStorage.storage.telemetryLogData;
  }

  set logData(newObject) {
    simpleStorage.storage.telemetryLogData = newObject;
  }

  constructor() {
    if (!this.logData) {
      this.logData = {};
    }
  }

  log(data) {
    const dataToReport = data;
    dataToReport.messageClass = 'certificate-diversity-logging';
    xutils.report(dataToReport);
  }
}

exports.TelemetryLog = TelemetryLog;
