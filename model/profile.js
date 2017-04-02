var mongodb = require('./connect');

var Schema = mongodb.mongoose.Schema;

var ProfileSchema = new Schema({
  profileId: String,
  imgNames: [String],
  dateCreated: { type: Date, default: Date.now },
  dateUpdated: { type: Date, default: Date.now },
});

var ProfileDAO = function(){};
var Profile = mongodb.mongoose.model('Profile', ProfileSchema);

ProfileDAO.prototype =  {
  constructor: ProfileDAO,

  save: function(obj){
    return new Promise((resolve, reject) => {
      var instance = new Profile(obj);
        instance.save((err) => {
          if(err) return reject(err);
          resolve();
        });
      });
    },

    delete: function(query) {
      return new Promise((resolve, reject) => {
        ProfileDAO.remove(query, (err, data) => {
          if(err) return reject(err);
          resolve(data);
        });
      });
    }

    /*
    search: function(query){
      return new Promise((resolve, reject) => {
        Product.find(query, (err, data) => {
          if(err) return reject(err);
          var result = [];
          if(data) {
            for(var i=0,len=data.length;i<len;i++){
              d = {
                _id: data[i]._id,
                title: data[i].title,
                url: data[i].url,
                category: data[i].category,
                advertiser: data[i].advertiser,
                content: data[i].content
              }
              result.push(d)
            }
          }
          resolve(result);
        });
      });
    }
    */
}

module.exports = ProfileDAO;
