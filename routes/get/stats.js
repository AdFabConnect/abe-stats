'use strict';

var path = require('path');

/**
 * Count item by key and increment in the array
 *
 * @param {array} myArray
 * @param {string} key
 *
 * @return {array}
 */
var countByKey = function (myArray, key, link) {
  if (myArray[key] === undefined) {
    myArray[key] = { total: 1, links: [] };
  } else {
    myArray[key].total = myArray[key].total + 1;
  }

  myArray[key].links.push(link);

  return myArray;
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

  var template = abe.Handlebars.compile(
    abe.coreUtils.file.getContent(path.join(__dirname + '/../../partials/stats.html')),
    { noEscape: true }
  );

  var nbPublishPagesPerDays = {};
  var nbPublishPagesPerMonths = {};
  var nbPublishPagesPerYears = {};
  var pages = abe.Manager.instance.getList();

  pages.forEach(function(page) {
    if (page.abe_meta.status !== 'publish') return;

    var date = page.abe_meta.date;
    var link = page.abe_meta.link;
    var keyPerDay = date.replace(/T.*/, '');
    var keyPerMonth = date.replace(/-[0-9]+T.*/, '');
    var keyPerYear = String(date.replace(/-[0-9]+-[0-9]+T.*/, ''));

    nbPublishPagesPerDays = countByKey(nbPublishPagesPerDays, keyPerDay, link);
    nbPublishPagesPerMonths = countByKey(nbPublishPagesPerMonths, keyPerMonth, link);
    nbPublishPagesPerYears = countByKey(nbPublishPagesPerYears, keyPerYear, link);
  });

  nbPublishPagesPerDays = sortObject(nbPublishPagesPerDays);
  nbPublishPagesPerMonths = sortObject(nbPublishPagesPerMonths);
  nbPublishPagesPerYears = sortObject(nbPublishPagesPerYears);

  var data = {
    nbPublishPagesPerDays,
    nbPublishPagesPerMonths,
    nbPublishPagesPerYears,
  };

  return res.send(
    template({
      express: { req, res },
      config: JSON.stringify(abe.config),
      data,
    })
  );
}

exports.default = route;
