var MouseSeeder = function(updProgress, moveComplete) {
  var LIMIT_ORDER = 300;   // mouse movement count, random from LIMIT_ORDER to 2 * LIMIT_ORDER
  var MIN_TIME_STEP = 100; // ms
  var self = this;

  updProgress = updProgress || function() {
  };
  moveComplete = moveComplete || function() {
  };

  this.reset = function() {
    self.moveLimit = LIMIT_ORDER + Math.floor(Math.random() * LIMIT_ORDER);
    self.moveCount = 0;
    self.pointsData = '';
    self.lastInputTime = new Date().getTime();
    updProgress(self.getProgressPercentage());
  };

  this.resetAndDisable = function() {
    self.reset();
    self.moveLimit = 0;    // disable on start
  };

  this.handleMouseMove = function(event) {
    if(self.moveLimit <= self.moveCount) {
      return;
      // trigger complete event only once
    }

    event = event || window.event;
    var timeStamp = new Date().getTime();

    if((self.moveLimit > self.moveCount) && event && (timeStamp - self.lastInputTime) > MIN_TIME_STEP) {
      self.pointsData = self.pointsData + event.clientX + event.clientY;
      self.moveCount++;
      updProgress(self.getProgressPercentage());
    }
    if(self.moveLimit <= self.moveCount) {
      moveComplete(self.getPoints());
    }
  };

  this.getPoints = function() {
    return self.pointsData;
  };

  this.isMovingComplete = function() {
    return self.movesCount >= self.movesLimit;
  };

  this.getProgressPercentage = function() {
    return Math.floor(100 * self.moveCount / self.moveLimit) + '%';
  };

  this.resetAndDisable();

};