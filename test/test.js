const expect = require('chai').expect
const Rx = require('rx')

// Quick intro to Mocha and Chai
describe('Array', function() {
  describe('#indexOf()', function () {
    it('should return -1 when the value is not present', function () {
      expect(-1).to.equal([1,2,3].indexOf(5))
    })
  })
})

// Test Scheduler
describe('Sending a single message', function () {
  const onNext = Rx.ReactiveTest.onNext
  const onCompleted = Rx.ReactiveTest.onCompleted
  const comparer = Rx.internals.isEqual

  describe('with disposal before completion', function () {
    it('should receive one message', function () {
      const scheduler = new Rx.TestScheduler()

      const input = scheduler.createHotObservable(
        onNext(100, "foo"),
        onNext(110, 7),
        onCompleted(200)
      )

      const results = scheduler.startScheduler(
        function () {
          // Return a pipeline
          return input.
            filter(function (x) { return !isNaN(x) }).
            map(function (x) { return x * 2 })
        },
        {
          created: 50,
          subscribed: 51,
          disposed: 150
        }
      )

      expect(results.messages.length).to.equal(1)
      expect(comparer(results.messages[0], onNext(100, 14))).to.be.false
      expect(comparer(results.messages[0], onNext(110, 14))).to.be.true
    })
  })

  describe('with disposal after completion', function () {
    it('should receive two messages', function () {
      const scheduler = new Rx.TestScheduler()

      const input = scheduler.createHotObservable(
        onNext(100, "foo"),
        onNext(110, 7),
        onCompleted(200)
      )

      const results = scheduler.startScheduler(
        function () {
          // Return a pipeline
          return input.
            filter(function (x) { return !isNaN(x) }).
            map(function (x) { return x * 2 })
        },
        {
          created: 50,
          subscribed: 51,
          disposed: 250
        }
      )

      expect(results.messages.length).to.equal(2)
      expect(comparer(results.messages[0], onNext(100, 14))).to.be.false
      expect(comparer(results.messages[0], onNext(110, 14))).to.be.true
      expect(comparer(results.messages[1], onCompleted(200))).to.be.true
    })
  })
})

