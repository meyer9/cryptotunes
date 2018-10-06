var MusicDAO = artifacts.require("MusicDAO");
const util = require('util')

const waitNBlocks = async n => {
  const sendAsync = util.promisify(web3.currentProvider.sendAsync);
  await Promise.all(
    [...Array(n).keys()].map(i =>
      sendAsync({
        jsonrpc: '2.0',
        method: 'evm_mine',
        id: i
      })
    )
  );
};

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
    await instance.vote(a)
    // console.log(await instance.nextVote(accounts[0]))
    let passed = false;
    try {
      await instance.vote(a)
    } catch (e) {
      passed = true;
    }
    assert(passed, "contract did not error on multiple votes")
  });

  it("should not allow a votes for non-existant measure proposal", async function() {
    let instance = await MusicDAO.new(100, 5)
    await instance.claim()
    let a = await instance.currentMeasureID();
    await instance.propose("0xabcdefabcdefabcdef")
    let passed = false;
    try {
      await instance.vote(a + 1)
    } catch (e) {
      passed = true;
    }
    assert(passed, "contract did not error on multiple votes")
  });

  it("should be able to access notes, measures of song", async function() {
    let instance = await MusicDAO.new(100, 5)
    await instance.claim() // 1
    let a = await instance.currentMeasureID();
    await instance.propose("0x000000010101020202") // 2
    await instance.vote(a) // 3
    await waitNBlocks(2); // 5
    a = await instance.currentMeasureID();
    await instance.propose("0x030303040404050505");
    await instance.vote(a);
    await waitNBlocks(3); // 5
    a = await instance.currentMeasureID();
    await instance.propose("0x060606070707080808");
    await instance.vote(a);

    let measures = (await instance.getSongMeasures()).toNumber()
    assert(measures == 2, "should have 2 measures")
    let  k = 0;
    for (let i = 0; i < measures; i++) {
      let measureID = (await instance.getSongMeasure(i)).toNumber()
      let noteStart = (await instance.getMeasure(measureID)).toNumber()
      let noteEnd = (await instance.getMeasureLast(measureID)).toNumber()
      for (let j = noteStart; j < noteEnd; j++) {
        let note = (await instance.getNote(j))[0].toNumber()
        assert(note == k, "notes should ascend")
        assert(note < 6, "notes should not go above 6")
        k += 1;
      }
    }
  });
});
