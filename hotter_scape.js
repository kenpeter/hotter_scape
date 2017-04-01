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
  for(var i=1; i<=theListLength; i++) {
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
          let obj = {
            profileId: id,
            url: url,
            count: 0
          };
          profileArr.push(obj);
          resolve();
        })
        .error(console.log);
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

          let theBaseList = profile.url + '/?page=';
          let imgList = genEachPage(theBaseList, profile.count);
          profile.imgList = imgList;

          //console.log('--profile--');
          //console.log(profile);

          resolve();
        })
        .error(console.log);
    });

  });

}


function eachProfileImg() {
  return Promise.each(profileArr, (profile) => {
    return new Promise((resolve, reject) => {

      let tmpImgList = [];
      Promise.each(profile.imgList, (imgUrl) => {
        return new Promise((resolve1, reject1) => {
          // get image url
          //console.log(imgUrl);
          //resolve1();

          osmosis
            .get(imgUrl)
            .set({
              'src': '.img-responsive.img-thumbnail img@src'
            })
            .data((mydata) => {
              let tmpImgUrl = 'http://52kantu.cn' + mydata.src;
              tmpImgList.push(tmpImgUrl);
              resolve1();
            })
            .error(console.log);

        });
      })
      .then(() => {
        profile.imgList = tmpImgList;
        resolve();
      }); // end each

    }); // end promise
  }); // end promise
}


function dlEachImage() {
  return Promise.each(profileArr, (profile) => {
    return new Promise((resolve, reject) => {

      Promise.each(profile.imgList, (imgUrl) => {
        return new Promise((resolve1, reject1) => {
          axios
            .get(imgUrl, {responseType: 'arraybuffer'})
            .then((imgData) => {
              let tmpArr = imgUrl.split('/');
              let fileName = tmpArr[tmpArr.length-1];

              // dir
              let profileImgDir = path.resolve(__dirname, 'imgs', profile.profileId);
              if (!fs.existsSync(profileImgDir)) {
                fs.mkdirSync(profileImgDir);
              }

              // write path
              let savePath = path.resolve(__dirname, 'imgs', profile.profileId, fileName);
              fs.writeFile(savePath, imgData.data, "binary", (err) => {
                if(err) {
                  console.log(err);
                }
                else {
                  console.log(`save: ${savePath}`);
                  resolve1();
                }
              }); // end fs write

            });

        }); // end promise
      }) // end each promise
      .then(() => {
        resolve();
      });

    }); // end promise
  }); // end each promise

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
  return dlEachImage();
})
.then(() => {
  console.log(profileArr);
  console.log('-- all done --');
  process.exit(0);
});
