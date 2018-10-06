var MusicDAO = artifacts.require("MusicDAO");

contract('MusicDAO', function(accounts) {
  it("should allow registration if not yet registered", async function() {
    let instance = await MusicDAO.new(100, 5)
    await instance.claim()
  });
  it("should create notes correctly", async function() {
    let instance = await MusicDAO.new(100, 5)
    await instance.claim()
    let testData = "0xabcdefabcdefabcdef"
    await instance.propose(testData)
  });
  it("should error when inputting notes incorrectly", async function() {
    let instance = await MusicDAO.new(100, 5)
    await instance.claim()
    let testData = "0xabcdefabcdefabcdefg"
    let success = false;
    try {
      await instance.propose(testData)
    } catch (error) {
      success = true;
    }
    assert(success, "should error with invalid notes")
  });
  it("should increment currentMeasureID after proposing", async function() {
    let instance = await MusicDAO.new(100, 5)
    await instance.claim()
    await instance.propose("0xabcdefabcdefabcdef")
    let a = await instance.currentMeasureID();
    await instance.propose("0xabcdefabcdefabcdef")
    let b = await instance.currentMeasureID();
    await instance.propose("0xabcdefabcdefabcdef")
    let c = await instance.currentMeasureID();
    assert(a.lt(b), "currentMeasureID not incremented")
    assert(b.lt(c), "currentMeasureID not incremented")
  });

  it("should allow a single vote", async function() {
    let instance = await MusicDAO.new(100, 5)
    await instance.claim()
    let a = await instance.currentMeasureID();
    await instance.propose("0xabcdefabcdefabcdef")
    await instance.vote(a)
  });

  it("should not allow a multiple votes", async function() {
    let instance = await MusicDAO.new(100, 5)
    await instance.claim()
    let a = await instance.currentMeasureID();
    await instance.propose("0xabcdefabcdefabcdef")
    let passed = false;
    try {
      await instance.vote(a)
      await instance.vote(a)
    } catch (e) {
      passed = true;
    }
    assert(passed, "contract did not error on multiple votes")
  });
});
