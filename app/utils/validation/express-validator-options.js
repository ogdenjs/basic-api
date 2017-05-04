module.exports = {
  customValidators: {
    isArray: function(value) {
      return Array.isArray(value)
    },
    isMongoId: function(value){
      if (!value || value.match(/^[0-9a-fA-F]{24}$/)) {
        return true
      }
      else {
        return false
      }
    },
    gte: function(value, num) {
      return value >= num
    },
    lte: (value, num) => {
      return parseInt(value) <= num
    }
  },
  customSanitizers: {
    toJsObject: (value) => {
      return JSON.parse(value)
    }
  }
}
