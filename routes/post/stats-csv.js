'use strict';

/**
 * Count item by key and increment in the array
 *
 * @param {array} myArray
 * @param {string} key
 *
 * @return {array}
 */
var countByKey = function (myArray, key, startedAt, endedAt) {
  if (startedAt && key < startedAt ) {
    return myArray;
  }

  if (endedAt && key > endedAt ) {
    return myArray;
  }

  if (myArray[key] === undefined) {
    myArray[key] = 1;
  } else {
    myArray[key] = myArray[key] + 1;
  }

  return myArray;
};

/**
 * Push the data of array in csv
 *
 * @param {string} csv
 * @param {array} array
 *
 * @return {string}
 */
var pushArrayInCsv = function (csv, array) {
  var keys = Object.keys(array);
  for (const key of keys) {
    csv += key + ';' + array[key] + '\n';
  }

  return csv;
};

var sortObject = function (obj) {
  return Object.keys(obj).sort().reduce(function (result, key) {
    result[key] = obj[key];
    return result;
  }, {});
};

var route = function route(req, res, next, abe) {
  abe.abeExtend.hooks.instance.trigger('beforeRoute', req, res, next);
  if (typeof res._header !== 'undefined' && res._header !== null) return;

  var nbPublishPagesPerDays = {};
  var nbPublishPagesPerMonths = {};
  var nbPublishPagesPerYears = {};
  var pages = abe.Manager.instance.getList();

  var compareStartedAtKeyPerDay = null;
  var compareStartedAtKeyPerMonth = null;
  var compareStartedAtKeyPerYear = null;
  if (req.body.startedAt) {
    var startedAt = req.body.startedAt;
    var compareStartedAtKeyPerDay = startedAt;
    var compareStartedAtKeyPerMonth = startedAt.replace(/-[0-9]+$/, '');
    var compareStartedAtKeyPerYear = startedAt.replace(/-[0-9]+.*$/, '');
  }

  var compareEndedAtKeyPerDay = null;
  var compareEndedAtKeyPerMonth = null;
  var compareEndedAtKeyPerYear = null;
  if (req.body.endedAt) {
    var endedAt = req.body.endedAt;
    var compareEndedAtKeyPerDay = endedAt;
    var compareEndedAtKeyPerMonth = endedAt.replace(/-[0-9]+$/, '');
    var compareEndedAtKeyPerYear = endedAt.replace(/-[0-9]+.*$/, '');
  }

  pages.forEach(function(page) {
    if (page.abe_meta.status !== 'publish') return;

    var date = page.abe_meta.date;
    var keyPerDay = date.replace(/T.*/, '');
    var keyPerMonth = date.replace(/-[0-9]+T.*/, '');
    var keyPerYear = date.replace(/-[0-9]+-[0-9]+T.*/, '');

    nbPublishPagesPerDays = countByKey(nbPublishPagesPerDays, keyPerDay, compareStartedAtKeyPerDay, compareEndedAtKeyPerDay);
    nbPublishPagesPerMonths = countByKey(nbPublishPagesPerMonths, keyPerMonth, compareStartedAtKeyPerMonth, compareEndedAtKeyPerMonth);
    nbPublishPagesPerYears = countByKey(nbPublishPagesPerYears, keyPerYear, compareStartedAtKeyPerYear, compareEndedAtKeyPerYear);
  });

  nbPublishPagesPerDays = sortObject(nbPublishPagesPerDays);
  nbPublishPagesPerMonths = sortObject(nbPublishPagesPerMonths);
  nbPublishPagesPerYears = sortObject(nbPublishPagesPerYears);

  var csv = 'Nombre de publication par jours\nDate publication;Nombre de page\n';
  csv = pushArrayInCsv(csv, nbPublishPagesPerDays);
  csv += 'Nombre de publication par mois\nDate publication;Nombre de page\n';
  csv = pushArrayInCsv(csv, nbPublishPagesPerMonths);
  csv += 'Nombre de publication par années\nDate publication;Nombre de page\n';
  csv = pushArrayInCsv(csv, nbPublishPagesPerYears);

  res.attachment('output.csv');
  res.status(200).send(csv);
}

exports.default = route;
