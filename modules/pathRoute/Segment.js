
define(function (require, exports, module) {

    function Segment() {

        this.endPointOne = null;

        this.endPointTwo = null;
    }

    Segment.prototype.getEndPointOne = function() {

        return this.endPointOne;
    }

    Segment.prototype.setEndPointOne = function(endPointOne) {

        this.endPointOne = endPointOne;
    }

    Segment.prototype.getEndPointTwo = function() {

        return this.endPointTwo;
    }

    Segment.prototype.setEndPointTwo = function(endPointTwo) {

        this.endPointTwo = endPointTwo;
    }

    module.exports = Segment
})

