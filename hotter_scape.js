const osmosis = require('osmosis');
const Promise = require('bluebird');
const axios = require('axios');

const fs = require('fs');
const path = require('path');

const theBaseList = 'http://52kantu.cn/?page=';
//const theListLength = 325;
const theListLength = 1;

let listArr = [];
let profileArr = [];

function genEachPage(theBaseList, theListLength) {
  const theReturn = [];
  for(var i=0; i<=theListLength; i++) {
    let page = theBaseList + i;
    theReturn.push(page);
  }
  return theReturn;
}


listArr = genEachPage(theBaseList, theListLength);
//console.log(JSON.stringify(listArr, null, 4));

function buildId() {
  return Promise.each(listArr, (list) => {
    return new Promise((resolve, reject) => {
      osmosis
        .get(list)
        .find('figcaption > a@href')
        .set('href')
        .data((mydata) => {
          let hrefArr = mydata.href.split('/');
          let id = hrefArr[hrefArr.length - 2];

          //console.log('--- done one ---');
          //console.log(id);
          let url = "http://52kantu.cn/detail/" + id;
          let obj = { url: url, count: 0};
          profileArr.push(obj);
          resolve();
        });
    }); // end promise
  }); // end promise each
} // end run


function eachProfile() {
  return Promise.each(profileArr, (profile) => {
    return new Promise((resolve, reject) => {
      osmosis
        .get(profile.url)
        .set({
          'count': '.laypage-curr'
        })
        .data((mydata) => {
          let tmp1 = mydata.count.split(' ');
          let tmp2 = tmp1[tmp1.length-1].split('.');
          let tmp3 = tmp2[0];
          profile.count = tmp3;

          console.log('--profile--');
          console.log(profile);

          resolve();
        });
    });

  });

}

function eachProfileImg() {
  return Promise.each(profileArr, (profile) => {
    return new Promise((resolve, reject) => {

    });
  });

}


// run
buildId()
.then(() => {
  return eachProfile();
})
.then(() => {
  return eachProfileImg();
})
.then(() => {
  console.log(profileArr);
  console.log('-- all done --');
  process.exit(0);
});
