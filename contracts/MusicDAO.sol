pragma solidity ^0.4.24;

contract MusicDAO {
    event NewMeasure(uint measureID, uint currentMeasure);

    struct Note {
        // Step is the time to start the note
        uint8 step;
        // Duration is the end of the note
        uint8 duration;
        // Pitch is the pitch of the note A0 = 0 -> A8 = 96
        uint8 pitch;
    }

    // Maps note ID to note struct.
    mapping(uint => Note) private notes;

    // Note ID index.
    uint private currentNote;

    // Maps measure ID to first note
    mapping(uint => uint) private measures;

    // Maps measure ID to last note
    mapping(uint => uint) private measuresLast;

    // Maps measure ID to votes
    mapping(uint => uint) public votes;

    // Maps voters to voting status
    mapping(address => bool) public authorizedVoters;

    // Maps voters to next allowed measure ID to vote.
    mapping(address => uint) public nextVote;

    // Current unique ID for measure
    uint public currentMeasureID;

    uint public lastMeasureID;

    // List of measure IDs
    uint[] private song;

    // Current measure in song
    uint public currentMeasure;
    
    // Maximum length of song
    uint public songLength;

    // Number of blocks between each round.
    uint public lengthRoundBlocks;

    // Current round starting block.
    uint public currentRoundStart;

    constructor(uint _songLength, uint _lengthRoundBlocks) public {
        currentMeasureID = 0;
        currentMeasure = 0;
        songLength = _songLength;
        lengthRoundBlocks = _lengthRoundBlocks;
        currentRoundStart = block.number;
    }

    function finalizeVoting() internal {
        uint bestMeasureId = 0;
        uint bestMeasureVotes = 0;
        for (uint i = lastMeasureID; i < currentMeasureID; i++) {
            if (votes[i] >= bestMeasureVotes) {
                bestMeasureVotes = votes[i];
                bestMeasureId = i;
            }
        }
        song.push(bestMeasureId);
        emit NewMeasure(bestMeasureId, currentMeasure);
        currentMeasure++;
        lastMeasureID = currentMeasureID;
    }

    function vote(uint id) external {
        require(authorizedVoters[msg.sender], "sender is not authorized to vote (run claim())");
        require(id < currentMeasureID, "can't vote for non-existant measure");
        if (block.number >= currentRoundStart + lengthRoundBlocks) {
            finalizeVoting();
            currentRoundStart = block.number + 1;
        }
        require(nextVote[msg.sender] <= currentMeasure, "sender already voted");
        votes[id] += 1;
        nextVote[msg.sender]++;
    }

    function claim() external {
        authorizedVoters[msg.sender] = true;
    }

    function propose(bytes m) external {
        require(authorizedVoters[msg.sender], "sender is not authorized to propose");
        if (block.number >= currentRoundStart + lengthRoundBlocks) {
            finalizeVoting();
            currentRoundStart = block.number + 1;
        }
        uint measureStart = currentNote;
        for (uint i = 0; i < m.length; i += 3) {
            notes[currentNote] = Note(uint8(m[i]), uint8(m[i+1]), uint8(m[i+2]));
            currentNote++;
        }
        measures[currentMeasureID] = measureStart;
        measuresLast[currentMeasureID] = currentNote;
        votes[currentMeasureID] = 0;
        currentMeasureID++;
    }

    function getSongMeasures() external view returns (uint) {
        return currentMeasure;
    }

    function getSongMeasure(uint i) external view returns (uint) {
        return song[i];
    }

    function getMeasure(uint i) external view returns (uint) {
        return measures[i];
    }

    function getMeasureLast(uint i) external view returns (uint) {
        return measuresLast[i];
    }

    function getNote(uint i) external view returns (uint8, uint8, uint8) {
        return (notes[i].step, notes[i].duration, notes[i].pitch);
    }
}